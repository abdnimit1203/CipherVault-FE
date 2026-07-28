"use client";

import { ArrowLeft, KeyRound, Save, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";

export default function AddPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");

  const handleGenerate = () => {
    // Mock generate password
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let pass = "";
    for (let i = 0; i < 16; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(pass);
    setShowPassword(true);
    toast.success("Secure password generated!");
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Password saved securely to your vault.");
  };

  return (
    <div className="flex-1 p-4 md:p-8 max-w-3xl mx-auto space-y-6">
      
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "rounded-full flex items-center justify-center")}>
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Add New Item</h1>
          <p className="text-sm text-muted-foreground">Securely store a new credential in your vault.</p>
        </div>
      </div>

      <form onSubmit={handleSave}>
        <Card className="border-border shadow-sm">
          <CardContent className="p-6 space-y-6">
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title / Website Name *</Label>
                <Input id="title" placeholder="e.g. Google, Netflix, Bank of America" required />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="owner">Owner</Label>
                  <Input id="owner" placeholder="e.g. Personal, Mom, Work" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input id="category" placeholder="e.g. Finance, Entertainment" />
                </div>
              </div>
            </div>

            <hr className="border-border" />

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username or Email *</Label>
                <Input id="username" type="text" placeholder="you@example.com" required />
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
                <Input id="url" type="url" placeholder="https://example.com" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Secure Notes</Label>
                <textarea 
                  id="notes" 
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" 
                  placeholder="Optional notes or security questions..."
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end gap-4">
              <Link href="/dashboard" className={buttonVariants({ variant: "outline" })}>Cancel</Link>
              <Button type="submit" className="gap-2">
                <Save className="w-4 h-4" />
                Save to Vault
              </Button>
            </div>

          </CardContent>
        </Card>
      </form>
    </div>
  );
}
