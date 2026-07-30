"use client";

import { useState, useEffect } from "react";
import { Copy, Eye, Lock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { deriveMasterKey } from "@/lib/crypto";
import { Loader2 } from "lucide-react";

export function PasswordDetailsDialog({ 
  isOpen, 
  onClose, 
  item 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  item: any;
}) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [showMasterPrompt, setShowMasterPrompt] = useState(false);
  const [masterPassword, setMasterPassword] = useState("");
  const [countdown, setCountdown] = useState(15);
  const [isVerifying, setIsVerifying] = useState(false);
  const { masterKey, dbUser } = useAuth();

  // Timer for auto-hide
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRevealed && countdown > 0) {
      timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    } else if (countdown === 0 && isRevealed) {
      setIsRevealed(false);
      setCountdown(15);
      toast.info("Password hidden automatically for security.");
    }
    return () => clearTimeout(timer);
  }, [isRevealed, countdown]);

  const handleRevealRequest = () => {
    setShowMasterPrompt(true);
  };

  const handleVerify = async () => {
    if (!masterKey || !dbUser) {
      toast.error("Encryption context missing. Please log in again.");
      return;
    }
    
    setIsVerifying(true);
    try {
      const derived = await deriveMasterKey(masterPassword, dbUser.email);
      
      // Compare byte arrays
      let isValid = true;
      if (derived.length !== masterKey.length) isValid = false;
      else {
        for (let i = 0; i < derived.length; i++) {
          if (derived[i] !== masterKey[i]) {
            isValid = false;
            break;
          }
        }
      }

      if (isValid) {
        setShowMasterPrompt(false);
        setIsRevealed(true);
        setMasterPassword("");
        toast.success("Identity verified. Password revealed.");
      } else {
        toast.error("Incorrect master password.");
      }
    } catch (error) {
      toast.error("Error verifying password.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md glass-card border-white/20 text-slate-100 rounded-3xl p-6 shadow-2xl">
        
        {!showMasterPrompt ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-500/20 to-indigo-500/20 text-cyan-300 flex items-center justify-center font-bold text-lg border border-white/15">
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-extrabold text-xl text-white">{item.title}</h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 mt-1">
                    Owner: {item.owner || "Personal"}
                  </span>
                </div>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground">Username</Label>
                <div className="flex items-center gap-2">
                  <Input value={item.username} readOnly className="bg-muted font-medium" />
                  <Button variant="outline" size="icon" onClick={() => handleCopy(item.username, "Username")}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-muted-foreground">Password</Label>
                  {isRevealed && (
                    <span className="text-xs text-emerald-500 font-medium">Hides in {countdown}s</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Input 
                    type={isRevealed ? "text" : "password"} 
                    value={isRevealed ? (item?.password || "") : "••••••••••••••••"} 
                    readOnly 
                    className={`bg-muted font-mono ${isRevealed ? "text-foreground" : "text-muted-foreground"}`}
                  />
                  {!isRevealed ? (
                    <Button variant="default" onClick={handleRevealRequest} className="gap-2">
                      <Eye className="w-4 h-4" /> Reveal
                    </Button>
                  ) : (
                    <Button variant="outline" size="icon" onClick={() => handleCopy(item.password || "", "Password")}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              {item.url && (
                <div className="space-y-2 pt-2 border-t border-border">
                  <Label className="text-muted-foreground">Website URL</Label>
                  <div className="flex items-center gap-2">
                    <Input value={item.url} readOnly className="bg-muted text-foreground" />
                    <Button variant="outline" size="icon" onClick={() => handleCopy(item.url, "URL")}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {item.notes && (
                <div className="space-y-2 pt-2 border-t border-border">
                  <Label className="text-muted-foreground">Secure Notes</Label>
                  <textarea 
                    value={item.notes} 
                    readOnly 
                    className="flex w-full rounded-md border border-input bg-muted px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none min-h-[80px]" 
                  />
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-primary" />
                Security Verification
              </DialogTitle>
              <DialogDescription>
                Please enter your Master Password to reveal the credentials for <b>{item.title}</b>.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="verify-pass">Master Password</Label>
                <Input 
                  id="verify-pass" 
                  type="password" 
                  placeholder="••••••••••••"
                  value={masterPassword}
                  onChange={(e) => setMasterPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleVerify()}
                  autoFocus
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <Button variant="ghost" onClick={() => setShowMasterPrompt(false)} disabled={isVerifying}>Cancel</Button>
                <Button onClick={handleVerify} disabled={isVerifying} className="min-w-[80px]">
                  {isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify"}
                </Button>
              </div>
            </div>
          </>
        )}

      </DialogContent>
    </Dialog>
  );
}
