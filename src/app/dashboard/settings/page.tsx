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

export default function SettingsPage() {
  const { dbUser, setDbUser, user, logout } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Security PIN State
  const [pinInput, setPinInput] = useState("");
  const [isSavingPin, setIsSavingPin] = useState(false);

  const avatarUrl = dbUser?.profilePictureUrl || user?.photoURL;

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

  const handleSavePin = async () => {
    if (!pinInput.trim() || pinInput.trim().length < 4) {
      toast.error("Security PIN must be at least 4 digits/characters long.");
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
            Set a 4-digit or 6-digit Private PIN code (e.g. <b className="text-cyan-300 font-mono">1655</b>). 
            This PIN code is required to reveal or edit passwords in your vault—protecting both Master Password and Google users from unauthorized reveals!
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 md:p-8 pt-0 space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Input 
              type="password"
              maxLength={8}
              placeholder="Enter PIN (e.g. 1655)"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              className="bg-white/5 border-white/15 text-white font-mono text-lg tracking-widest sm:max-w-xs focus-visible:ring-cyan-400/50"
            />
            <Button 
              onClick={handleSavePin} 
              disabled={isSavingPin || !pinInput.trim()}
              className="bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-slate-950 font-bold px-6 rounded-2xl shadow-lg shadow-cyan-500/20"
            >
              {isSavingPin ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Security PIN"}
            </Button>
          </div>
          {dbUser?.securityPin && (
            <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5 pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Security PIN is active and protecting your vault reveals.
            </p>
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
