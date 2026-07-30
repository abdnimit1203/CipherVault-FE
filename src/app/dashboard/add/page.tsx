"use client";

import { ArrowLeft, KeyRound, Save, Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { encryptVaultItem } from "@/lib/crypto";
import { auth } from "@/lib/firebase";
import axios from "axios";

export default function AddPasswordPage() {
  const router = useRouter();
  const { masterKey } = useAuth();
  
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [owner, setOwner] = useState<"Personal" | "Family" | "Friend" | "Other">("Personal");

  const ownerOptions = ["Personal", "Family", "Friend", "Other"] as const;

  const handleGenerate = () => {
    // Generate secure password
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let pass = "";
    for (let i = 0; i < 16; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(pass);
    setShowPassword(true);
    toast.success("Secure password generated!");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!masterKey) {
      toast.error("Encryption key not found. Please log in again.");
      return;
    }

    setIsSaving(true);
    try {
      // Data to encrypt (sensitive fields)
      const sensitiveData = {
        username,
        password,
        url,
        notes,
        owner
      };

      // Encrypt the sensitive data
      const { encryptedData, iv } = await encryptVaultItem(sensitiveData, masterKey);

      // Get Firebase ID token for backend auth
      const token = await auth.currentUser?.getIdToken();
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      
      await axios.post(`${apiUrl}/vault`, {
        title,
        encryptedData,
        iv
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      toast.success("Password encrypted and saved to vault!");
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Error saving vault item:", error);
      toast.error(error.message || "Failed to save item.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 p-4 md:p-8 max-w-3xl mx-auto space-y-6">
      
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "rounded-full flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10")}>
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">Add New Item</h1>
          <p className="text-sm text-slate-400">Securely encrypt and store a new credential in your vault.</p>
        </div>
      </div>

      <form onSubmit={handleSave}>
        <Card className="glass-card border-white/15 shadow-2xl rounded-3xl">
          <CardContent className="p-6 md:p-8 space-y-6">
            
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-slate-300">Title / Website Name *</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Google, Netflix, Bank of America" required />
              </div>

              {/* Owner Selector Radio Buttons */}
              <div className="space-y-2.5">
                <Label className="text-slate-300">Credential Owner *</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {ownerOptions.map((option) => {
                    const isSelected = owner === option;
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setOwner(option)}
                        className={cn(
                          "flex items-center justify-center py-2.5 px-4 rounded-2xl text-xs font-bold transition-all duration-200 border cursor-pointer select-none",
                          isSelected
                            ? "bg-gradient-to-r from-sky-500/30 to-indigo-500/20 text-cyan-300 border-cyan-400/50 shadow-lg shadow-cyan-500/10 scale-[1.02]"
                            : "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:text-white"
                        )}
                      >
                        <span className={cn("w-2 h-2 rounded-full mr-2", isSelected ? "bg-cyan-400" : "bg-slate-500")} />
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <hr className="border-border" />

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username or Email *</Label>
                <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} type="text" placeholder="you@example.com" required />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password *</Label>
                  <Button type="button" variant="link" size="sm" className="h-auto p-0 text-primary" onClick={handleGenerate}>
                    <KeyRound className="w-3 h-3 mr-1" />
                    Auto-Generate
                  </Button>
                </div>
                <div className="relative flex items-center gap-2">
                  <div className="relative flex-1">
                    <Input 
                      id="password" 
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••••••" 
                      className="pr-10 font-mono"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-border" />

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="url">Website URL</Label>
                <Input id="url" value={url} onChange={(e) => setUrl(e.target.value)} type="text" placeholder="https://example.com" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Secure Notes</Label>
                <textarea 
                  id="notes" 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" 
                  placeholder="Optional notes or security questions..."
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end gap-4">
              <Link href="/dashboard" className={buttonVariants({ variant: "outline" })}>Cancel</Link>
              <Button type="submit" className="gap-2" disabled={isSaving}>
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {isSaving ? "Encrypting..." : "Save to Vault"}
              </Button>
            </div>

          </CardContent>
        </Card>
      </form>
    </div>
  );
}
