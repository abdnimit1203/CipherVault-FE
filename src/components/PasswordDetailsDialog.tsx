"use client";

import { useState, useEffect } from "react";
import { Copy, Eye, Lock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

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

  const handleVerify = () => {
    if (masterPassword === "password") { // Mock check
      setShowMasterPrompt(false);
      setIsRevealed(true);
      setMasterPassword("");
      toast.success("Identity verified. Password revealed.");
    } else {
      toast.error("Incorrect master password.");
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        
        {!showMasterPrompt ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-sm border border-primary/20">
                  {item.icon}
                </div>
                {item.title}
              </DialogTitle>
              <DialogDescription>
                {item.category} • Owned by {item.owner || "Personal"}
              </DialogDescription>
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
                    value={isRevealed ? "MockSuperSecretPassword123!" : "••••••••••••••••"} 
                    readOnly 
                    className={`bg-muted font-mono ${isRevealed ? "text-foreground" : "text-muted-foreground"}`}
                  />
                  {!isRevealed ? (
                    <Button variant="default" onClick={handleRevealRequest} className="gap-2">
                      <Eye className="w-4 h-4" /> Reveal
                    </Button>
                  ) : (
                    <Button variant="outline" size="icon" onClick={() => handleCopy("MockSuperSecretPassword123!", "Password")}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
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
                <br/> <span className="text-xs text-muted-foreground mt-2 inline-block">(Mock hint: type "password")</span>
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
                <Button variant="ghost" onClick={() => setShowMasterPrompt(false)}>Cancel</Button>
                <Button onClick={handleVerify}>Verify</Button>
              </div>
            </div>
          </>
        )}

      </DialogContent>
    </Dialog>
  );
}
