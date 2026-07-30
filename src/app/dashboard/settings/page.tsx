"use client";

import { useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, LogOut, Image as ImageIcon, Loader2, Camera, ShieldCheck, KeyRound, Lock } from "lucide-react";
import { compressAndDownscaleImage } from "@/lib/imageUtils";
import { uploadToImgBB } from "@/lib/imgbb";
import { auth } from "@/lib/firebase";
import axios from "axios";
import { toast } from "sonner";

import { deriveMasterKey } from "@/lib/crypto";

export default function SettingsPage() {
  const { dbUser, setDbUser, user, masterKey, logout } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Security PIN State
  const [pinInput, setPinInput] = useState("");
  const [confirmPinInput, setConfirmPinInput] = useState("");
  const [currentVerificationInput, setCurrentVerificationInput] = useState("");
  
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [isVerifyingCurrent, setIsVerifyingCurrent] = useState(false);
  const [isCurrentVerified, setIsCurrentVerified] = useState(false);
  const [isSavingPin, setIsSavingPin] = useState(false);

  const avatarUrl = dbUser?.profilePictureUrl || user?.photoURL;
  const hasPin = Boolean(dbUser?.securityPin);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    toast.info("Downscaling and compressing image...");

    try {
      const compressedFile = await compressAndDownscaleImage(file);
      toast.info("Uploading avatar to ImgBB...");
      const imageUrl = await uploadToImgBB(compressedFile);

      const token = await auth.currentUser?.getIdToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      
      const response = await axios.put(
        `${apiUrl}/auth/profile-picture`,
        { profilePictureUrl: imageUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (dbUser) {
        setDbUser({ ...dbUser, profilePictureUrl: imageUrl });
      } else if (response.data.user) {
        setDbUser(response.data.user);
      }
      toast.success("Profile picture updated successfully!");
    } catch (error: any) {
      console.error("Avatar upload error:", error);
      toast.error(error.message || "Failed to update profile picture.");
    } finally {
      setIsUploading(false);
    }
  };

  // 1. Verify Current PIN or Master Password before allowing PIN update
  const handleVerifyCurrentPin = async () => {
    const input = currentVerificationInput.trim();
    if (!input) {
      toast.error("Please enter your current PIN or Master Password.");
      return;
    }
    if (!auth.currentUser) return;

    setIsVerifyingCurrent(true);
    try {
      const token = await auth.currentUser.getIdToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

      // Try verifying PIN via backend
      try {
        const verifyRes = await axios.post(
          `${apiUrl}/auth/verify-pin`,
          { pin: input },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (verifyRes.data.success) {
          setIsCurrentVerified(true);
          toast.success("Identity verified! Set your new Security PIN below.");
          setCurrentVerificationInput("");
          return;
        }
      } catch (pinErr: any) {
        // Fallback to checking Master Password if PIN check failed
        const userEmail = dbUser?.email || user?.email;
        if (masterKey && userEmail) {
          const derived = await deriveMasterKey(input, userEmail);
          const isValidMasterPassword =
            derived.length === masterKey.length &&
            derived.every((val, i) => val === masterKey[i]);

          if (isValidMasterPassword) {
            setIsCurrentVerified(true);
            toast.success("Master Password verified! Set your new Security PIN below.");
            setCurrentVerificationInput("");
            return;
          }
        }

        toast.error(pinErr.response?.data?.error || "Incorrect Security PIN or Master Password.");
      }
    } catch (error: any) {
      console.error("Verification error:", error);
      toast.error("Failed to verify identity.");
    } finally {
      setIsVerifyingCurrent(false);
    }
  };

  // 2. Save / Update Security PIN
  const handleSavePin = async () => {
    if (!pinInput.trim() || pinInput.trim().length < 4) {
      toast.error("Security PIN must be at least 4 digits/characters long.");
      return;
    }

    if (pinInput.trim() !== confirmPinInput.trim()) {
      toast.error("New PIN and Confirm PIN do not match.");
      return;
    }

    if (!auth.currentUser) return;
    setIsSavingPin(true);
    try {
      const token = await auth.currentUser.getIdToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

      const response = await axios.put(
        `${apiUrl}/auth/pin`,
        { pin: pinInput.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (dbUser) {
        setDbUser({ ...dbUser, securityPin: response.data.user.securityPin });
      }
      toast.success("Security PIN updated successfully! It is now required to reveal passwords.");
      setPinInput("");
      setConfirmPinInput("");
      setIsChangingPin(false);
      setIsCurrentVerified(false);
    } catch (error: any) {
      console.error("Error setting PIN:", error);
      toast.error(error.response?.data?.error || "Failed to set Security PIN.");
    } finally {
      setIsSavingPin(false);
    }
  };

  return (
    <div className="flex-1 p-4 md:p-8 space-y-8 max-w-3xl mx-auto">
      <section className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
          <span>Settings & Security</span>
        </h1>
        <p className="text-slate-400 text-sm md:text-base">
          Manage your CipherVault user profile, Private Security PIN, and active sessions.
        </p>
      </section>

      {/* Profile Details Card */}
      <Card className="glass-card border-white/15 shadow-2xl rounded-3xl">
        <CardHeader className="p-6 md:p-8 pb-4">
          <CardTitle className="text-xl font-bold text-white">Profile Details</CardTitle>
          <CardDescription className="text-slate-400">
            Click on your profile avatar to upload and compress a custom photo.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 md:p-8 pt-0 space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div className="w-28 h-28 rounded-full bg-slate-900 flex items-center justify-center overflow-hidden border-2 border-cyan-400/40 shadow-xl relative">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Profile Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-cyan-400" />
                )}

                {isUploading && (
                  <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center text-cyan-300">
                    <Loader2 className="w-7 h-7 animate-spin mb-1" />
                    <span className="text-[10px] font-bold">Uploading</span>
                  </div>
                )}
              </div>
              <button 
                type="button" 
                disabled={isUploading}
                className="absolute inset-0 bg-slate-950/70 text-white rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 border border-cyan-400/50"
              >
                <Camera className="w-6 h-6 mb-1 text-cyan-300" />
                <span className="text-xs font-semibold">Upload Photo</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            
            <div className="flex-1 w-full space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-slate-300 font-semibold">Full Name</Label>
                <Input 
                  id="fullName" 
                  defaultValue={dbUser?.fullName || user?.displayName || "User"} 
                  readOnly 
                  className="bg-white/5 border-white/10 text-slate-200 font-medium"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300 font-semibold">Email Address</Label>
                <Input 
                  id="email" 
                  defaultValue={dbUser?.email || user?.email || ""} 
                  readOnly 
                  className="bg-white/5 border-white/10 text-slate-200 font-medium"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security PIN Card */}
      <Card className="glass-card border-cyan-500/30 bg-cyan-950/20 shadow-2xl rounded-3xl">
        <CardHeader className="p-6 md:p-8">
          <CardTitle className="text-cyan-300 flex items-center gap-2 text-xl font-bold">
            <KeyRound className="w-5 h-5 text-cyan-400" />
            Security PIN / Private Reveal Code
          </CardTitle>
          <CardDescription className="text-slate-300 text-sm leading-relaxed">
            Set a 4-digit or 6-digit Private PIN code. 
            This PIN code is required to reveal or edit passwords in your vault—protecting both Master Password and Google users from unauthorized reveals!
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 md:p-8 pt-0 space-y-4">
          {hasPin && !isChangingPin ? (
            /* STATE 1: PIN ALREADY SET - SHOW STATUS & "CHANGE PIN" BUTTON */
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-emerald-300">Security PIN is Active (••••)</p>
                  <p className="text-xs text-slate-300">Your vault reveals and edits require PIN verification.</p>
                </div>
              </div>

              <Button 
                onClick={() => setIsChangingPin(true)}
                variant="outline"
                className="border-cyan-500/40 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 font-bold px-6 rounded-2xl"
              >
                Change Security PIN
              </Button>
            </div>
          ) : hasPin && isChangingPin && !isCurrentVerified ? (
            /* STATE 2: RE-ENTER CURRENT PIN OR MASTER PASSWORD VERIFICATION */
            <div className="space-y-4 bg-slate-900/60 p-5 rounded-2xl border border-cyan-500/20">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Lock className="w-4 h-4 text-cyan-400" />
                  Step 1 of 2: Verify Your Identity
                </h4>
                <p className="text-xs text-slate-300">
                  Enter your <b>Current Security PIN</b> or <b>Master Password</b> to unlock PIN modification.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <Input 
                  type="password"
                  placeholder="Enter current PIN or Password"
                  value={currentVerificationInput}
                  onChange={(e) => setCurrentVerificationInput(e.target.value)}
                  className="bg-white/5 border-white/15 text-white font-mono text-base sm:max-w-xs focus-visible:ring-cyan-400/50"
                />
                <div className="flex gap-2">
                  <Button 
                    onClick={handleVerifyCurrentPin} 
                    disabled={isVerifyingCurrent || !currentVerificationInput.trim()}
                    className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-5 rounded-2xl"
                  >
                    {isVerifyingCurrent ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify & Unlock"}
                  </Button>
                  <Button 
                    onClick={() => { setIsChangingPin(false); setCurrentVerificationInput(""); }}
                    variant="ghost" 
                    className="text-slate-400 hover:text-white rounded-2xl"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            /* STATE 3: SET NEW PIN (Unlocked or First Time Setup) */
            <div className="space-y-4">
              {hasPin && isCurrentVerified && (
                <div className="p-3 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-semibold flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                  Identity verified! Set your new 4-digit Private PIN code below.
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-2 max-w-md">
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-300 font-semibold">New Security PIN</Label>
                  <Input 
                    type="password"
                    maxLength={8}
                    placeholder="e.g. 1655"
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    className="bg-white/5 border-white/15 text-white font-mono text-base tracking-widest focus-visible:ring-cyan-400/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-300 font-semibold">Confirm New PIN</Label>
                  <Input 
                    type="password"
                    maxLength={8}
                    placeholder="Confirm PIN"
                    value={confirmPinInput}
                    onChange={(e) => setConfirmPinInput(e.target.value)}
                    className="bg-white/5 border-white/15 text-white font-mono text-base tracking-widest focus-visible:ring-cyan-400/50"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button 
                  onClick={handleSavePin} 
                  disabled={isSavingPin || !pinInput.trim() || !confirmPinInput.trim()}
                  className="bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-slate-950 font-bold px-6 rounded-2xl shadow-lg shadow-cyan-500/20"
                >
                  {isSavingPin ? <Loader2 className="w-4 h-4 animate-spin" /> : hasPin ? "Update Security PIN" : "Save Security PIN"}
                </Button>

                {hasPin && (
                  <Button 
                    onClick={() => { setIsChangingPin(false); setIsCurrentVerified(false); setPinInput(""); setConfirmPinInput(""); }}
                    variant="ghost" 
                    className="text-slate-400 hover:text-white rounded-2xl"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Session Security */}
      <Card className="glass-card border-rose-500/30 bg-rose-950/20 shadow-2xl rounded-3xl">
        <CardHeader className="p-6 md:p-8">
          <CardTitle className="text-rose-400 flex items-center gap-2 text-xl font-bold">
            <LogOut className="w-5 h-5 text-rose-400" />
            Active Session Security
          </CardTitle>
          <CardDescription className="text-slate-300">
            Clicking log out will terminate your 30-day session token and purge your Master Key from browser memory.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 md:p-8 pt-0">
          <Button variant="destructive" onClick={logout} className="w-full sm:w-auto rounded-full font-bold px-8 shadow-lg shadow-rose-900/30">
            Log Out Now
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
