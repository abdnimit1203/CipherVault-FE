"use client";

import { useState, useEffect } from "react";
import { Copy, Eye, Lock, ShieldCheck, Loader2, Edit3, Trash2, Save, X, RefreshCw, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { deriveMasterKey, encryptVaultItem } from "@/lib/crypto";
import { auth } from "@/lib/firebase";
import axios from "axios";

export function PasswordDetailsDialog({ 
  isOpen, 
  onClose, 
  item,
  onItemUpdated,
  onItemDeleted
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  item: any;
  onItemUpdated?: () => void;
  onItemDeleted?: () => void;
}) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [showSecurityPrompt, setShowSecurityPrompt] = useState(false);
  const [pinOrPassword, setPinOrPassword] = useState("");
  const [countdown, setCountdown] = useState(15);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [editOwner, setEditOwner] = useState("Personal");
  const [editNotes, setEditNotes] = useState("");

  const { user, masterKey, dbUser, setDbUser } = useAuth();
  const hasPinConfigured = Boolean(dbUser?.securityPin);

  // Reset state on item load
  useEffect(() => {
    if (item) {
      setEditTitle(item.title || "");
      setEditUsername(item.username || "");
      setEditPassword(item.password || "");
      setEditUrl(item.url || "");
      setEditOwner(item.owner || "Personal");
      setEditNotes(item.notes || "");
      setIsEditing(false);
      setIsRevealed(false);
      setShowSecurityPrompt(false);
      setPinOrPassword("");
    }
  }, [item]);

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
    if (isRevealed) return;
    setShowSecurityPrompt(true);
  };

  const handleStartEdit = () => {
    if (!isRevealed) {
      setShowSecurityPrompt(true);
    } else {
      setIsEditing(true);
    }
  };

  const handleVerifyOrSetPin = async () => {
    if (!pinOrPassword.trim()) {
      toast.error("Please enter your Security PIN or Master Password.");
      return;
    }

    if (!auth.currentUser) {
      toast.error("User session invalid.");
      return;
    }

    setIsVerifying(true);
    const token = await auth.currentUser.getIdToken();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

    try {
      // 1. If user has no Security PIN yet, set this as their new Security PIN!
      if (!hasPinConfigured && pinOrPassword.trim().length >= 4) {
        const pinRes = await axios.put(
          `${apiUrl}/auth/pin`,
          { pin: pinOrPassword.trim() },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (dbUser) setDbUser({ ...dbUser, securityPin: pinRes.data.user.securityPin });
        toast.success("Security PIN configured successfully!");
        setShowSecurityPrompt(false);
        setIsRevealed(true);
        setPinOrPassword("");
        setCountdown(15);
        return;
      }

      // 2. Try verifying PIN via API
      try {
        const verifyRes = await axios.post(
          `${apiUrl}/auth/verify-pin`,
          { pin: pinOrPassword.trim() },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (verifyRes.data.success) {
          setShowSecurityPrompt(false);
          setIsRevealed(true);
          setPinOrPassword("");
          setCountdown(15);
          toast.success("Private PIN code verified. Access granted!");
          return;
        }
      } catch (pinErr: any) {
        // Fallback to Master Password verification if PIN fails
        if (masterKey && dbUser?.email) {
          const derived = await deriveMasterKey(pinOrPassword.trim(), dbUser.email);
          const isValid = derived.length === masterKey.length && derived.every((val, i) => val === masterKey[i]);
          
          if (isValid) {
            setShowSecurityPrompt(false);
            setIsRevealed(true);
            setPinOrPassword("");
            setCountdown(15);
            toast.success("Master Password verified. Access granted!");
            return;
          }
        }
        
        toast.error(pinErr.response?.data?.error || "Incorrect Security PIN code.");
      }
    } catch (err) {
      console.error("Verification error:", err);
      toast.error("Verification failed.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleGeneratePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~";
    let pass = "";
    for (let i = 0; i < 18; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setEditPassword(pass);
    toast.success("Generated strong password!");
  };

  const handleSaveChanges = async () => {
    if (!editTitle.trim()) {
      toast.error("Title cannot be empty.");
      return;
    }
    if (!masterKey || !auth.currentUser) {
      toast.error("Encryption context missing.");
      return;
    }

    setIsSaving(true);
    try {
      const token = await auth.currentUser.getIdToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

      const payloadToEncrypt = {
        username: editUsername,
        password: editPassword,
        url: editUrl,
        owner: editOwner,
        notes: editNotes,
      };

      const { encryptedData, iv } = await encryptVaultItem(payloadToEncrypt, masterKey);

      await axios.put(`${apiUrl}/vault/${item.id}`, {
        title: editTitle,
        category: item.category || "Logins",
        encryptedData,
        iv
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success("Credential updated successfully!");
      setIsEditing(false);
      if (onItemUpdated) onItemUpdated();
      onClose();
    } catch (err) {
      console.error("Failed to update item:", err);
      toast.error("Failed to save changes.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${item.title}"? This cannot be undone.`)) return;

    if (!auth.currentUser) return;
    setIsDeleting(true);
    try {
      const token = await auth.currentUser.getIdToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

      await axios.delete(`${apiUrl}/vault/${item.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success("Credential deleted successfully.");
      if (onItemDeleted) onItemDeleted();
      onClose();
    } catch (err) {
      console.error("Failed to delete item:", err);
      toast.error("Failed to delete credential.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-[#0e1e34] border border-cyan-500/30 text-slate-100 rounded-3xl p-6 shadow-2xl backdrop-blur-2xl">
        
        {!showSecurityPrompt ? (
          <>
            {/* Dialog Header with Edit & Delete Actions */}
            <DialogHeader className="flex flex-row items-center justify-between gap-4 pb-2 border-b border-white/10">
              <DialogTitle className="flex items-center gap-3 text-white">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-500/20 to-indigo-500/20 text-cyan-300 flex items-center justify-center font-bold text-lg border border-white/15 shrink-0">
                  {item.icon}
                </div>
                <div>
                  {!isEditing ? (
                    <>
                      <h3 className="font-extrabold text-xl text-white tracking-wide">{item.title}</h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 mt-1">
                        Owner: {item.owner || "Personal"}
                      </span>
                    </>
                  ) : (
                    <span className="text-sm font-bold text-cyan-400 uppercase tracking-wider">
                      Edit Credential
                    </span>
                  )}
                </div>
              </DialogTitle>

              <div className="flex items-center gap-1.5 shrink-0">
                {!isEditing ? (
                  <>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={handleStartEdit}
                      className="w-9 h-9 rounded-xl bg-white/5 hover:bg-cyan-500/20 text-cyan-400 border border-white/10"
                      title="Edit Item"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="w-9 h-9 rounded-xl bg-white/5 hover:bg-rose-500/20 text-rose-400 border border-white/10"
                      title="Delete Item"
                    >
                      {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </Button>
                  </>
                ) : (
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setIsEditing(false)}
                    className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 border border-white/10"
                    title="Cancel Edit"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </DialogHeader>

            {/* Read-Only View vs Edit Form View */}
            {!isEditing ? (
              <div className="space-y-5 py-4">
                <div className="space-y-1.5">
                  <Label className="text-slate-300 font-semibold text-xs">Username / Account</Label>
                  <div className="flex items-center gap-2">
                    <Input 
                      value={item.username} 
                      readOnly 
                      className="bg-white/5 border-white/15 text-slate-100 font-medium focus-visible:ring-cyan-400/50" 
                    />
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => handleCopy(item.username, "Username")}
                      className="border-white/15 bg-white/5 hover:bg-white/10 text-slate-200 shrink-0"
                    >
                      <Copy className="w-4 h-4 text-cyan-300" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-slate-300 font-semibold text-xs">Password</Label>
                    {isRevealed && (
                      <span className="text-xs text-emerald-400 font-bold animate-pulse">Auto-hides in {countdown}s</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Input 
                      type={isRevealed ? "text" : "password"} 
                      value={isRevealed ? (item?.password || "") : "••••••••••••••••"} 
                      readOnly 
                      className={`font-mono bg-white/5 border-white/15 ${isRevealed ? "text-cyan-300 font-bold text-base" : "text-slate-400"}`}
                    />
                    {!isRevealed ? (
                      <Button 
                        onClick={handleRevealRequest} 
                        className="gap-2 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-slate-950 font-bold px-4 shrink-0 shadow-lg shadow-cyan-500/20"
                      >
                        <Eye className="w-4 h-4" /> Reveal
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => handleCopy(item.password || "", "Password")}
                        className="border-white/15 bg-white/5 hover:bg-white/10 text-slate-200 shrink-0"
                      >
                        <Copy className="w-4 h-4 text-cyan-300" />
                      </Button>
                    )}
                  </div>
                </div>

                {item.url && (
                  <div className="space-y-1.5 pt-2 border-t border-white/10">
                    <Label className="text-slate-300 font-semibold text-xs">Website URL</Label>
                    <div className="flex items-center gap-2">
                      <Input 
                        value={item.url} 
                        readOnly 
                        className="bg-white/5 border-white/15 text-slate-200" 
                      />
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => handleCopy(item.url, "URL")}
                        className="border-white/15 bg-white/5 hover:bg-white/10 text-slate-200 shrink-0"
                      >
                        <Copy className="w-4 h-4 text-cyan-300" />
                      </Button>
                    </div>
                  </div>
                )}

                {item.notes && (
                  <div className="space-y-1.5 pt-2 border-t border-white/10">
                    <Label className="text-slate-300 font-semibold text-xs">Secure Notes</Label>
                    <textarea 
                      value={item.notes} 
                      readOnly 
                      className="flex w-full rounded-2xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-slate-200 shadow-sm focus-visible:outline-none min-h-[80px]" 
                    />
                  </div>
                )}
              </div>
            ) : (
              /* EDIT MODE FORM */
              <div className="space-y-4 py-4">
                <div className="space-y-1.5">
                  <Label className="text-slate-300 font-semibold text-xs">Item Title</Label>
                  <Input 
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="bg-white/5 border-white/15 text-white" 
                    placeholder="e.g. Netflix, Github"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-slate-300 font-semibold text-xs">Username / Email</Label>
                  <Input 
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    className="bg-white/5 border-white/15 text-white" 
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-slate-300 font-semibold text-xs">Password</Label>
                    <button 
                      type="button" 
                      onClick={handleGeneratePassword} 
                      className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
                    >
                      <RefreshCw className="w-3 h-3" /> Generate
                    </button>
                  </div>
                  <Input 
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    className="bg-white/5 border-white/15 text-white font-mono" 
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-slate-300 font-semibold text-xs">Owner Tag</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {["Personal", "Family", "Friend", "Other"].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setEditOwner(tag)}
                        className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all ${
                          editOwner === tag 
                            ? "bg-cyan-500/20 border-cyan-400 text-cyan-300" 
                            : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-slate-300 font-semibold text-xs">Website URL</Label>
                  <Input 
                    value={editUrl}
                    onChange={(e) => setEditUrl(e.target.value)}
                    className="bg-white/5 border-white/15 text-white" 
                    placeholder="https://example.com"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-slate-300 font-semibold text-xs">Secure Notes</Label>
                  <textarea 
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    className="flex w-full rounded-2xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-slate-200 shadow-sm focus-visible:outline-none min-h-[70px]" 
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <Button 
                    variant="ghost" 
                    onClick={() => setIsEditing(false)} 
                    disabled={isSaving}
                    className="text-slate-400 hover:text-white hover:bg-white/5"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSaveChanges} 
                    disabled={isSaving}
                    className="bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-slate-950 font-bold gap-2"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Changes
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          /* SECURITY PIN / PRIVATE CODE VERIFICATION PROMPT */
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-white">
                <KeyRound className="w-5 h-5 text-cyan-400" />
                {hasPinConfigured ? "Security PIN Verification" : "Configure Private PIN Code"}
              </DialogTitle>
              <DialogDescription className="text-slate-300 text-xs leading-relaxed">
                {hasPinConfigured ? (
                  <>Enter your 4-digit Private PIN code or Master Password to reveal credentials for <b className="text-cyan-300">{item.title}</b>.</>
                ) : (
                  <>You haven&apos;t set a Private PIN yet! Enter a 4-digit or 6-digit PIN below to set it now and reveal credentials for <b className="text-cyan-300">{item.title}</b>.</>
                )}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="verify-pin" className="text-slate-300 font-semibold text-xs">
                  {hasPinConfigured ? "Security PIN / Master Password" : "Create Private Security PIN"}
                </Label>
                <Input 
                  id="verify-pin" 
                  type="password" 
                  placeholder={hasPinConfigured ? "••••••••" : "Enter new PIN (e.g. 4-digits)"}
                  value={pinOrPassword}
                  onChange={(e) => setPinOrPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleVerifyOrSetPin()}
                  autoFocus
                  maxLength={16}
                  className="bg-white/5 border-white/15 text-white font-mono text-center tracking-widest text-lg focus-visible:ring-cyan-400/50"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button 
                  variant="ghost" 
                  onClick={() => setShowSecurityPrompt(false)} 
                  disabled={isVerifying}
                  className="text-slate-400 hover:text-white hover:bg-white/5"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleVerifyOrSetPin} 
                  disabled={isVerifying || !pinOrPassword.trim()} 
                  className="min-w-[100px] bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-slate-950 font-bold shadow-lg shadow-cyan-500/20"
                >
                  {isVerifying ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : hasPinConfigured ? (
                    "Verify & Reveal"
                  ) : (
                    "Set PIN & Reveal"
                  )}
                </Button>
              </div>
            </div>
          </>
        )}

      </DialogContent>
    </Dialog>
  );
}
