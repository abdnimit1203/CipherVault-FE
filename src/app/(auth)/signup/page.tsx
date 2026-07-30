"use client";

import Link from "next/link";
import Image from "next/image";
import { Mail, Lock, EyeOff, Eye, CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { deriveMasterKey } from "@/lib/crypto";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const { setMasterKey } = useAuth();
  const router = useRouter();

  // Simple mock password strength calculation
  const calculateStrength = (pass: string) => {
    let score = 0;
    if (pass.length > 8) score += 1;
    if (pass.length > 12) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return Math.min(5, score);
  };

  const strength = calculateStrength(password);

  const getStrengthColor = () => {
    if (strength === 0) return "bg-slate-700";
    if (strength <= 2) return "bg-rose-500";
    if (strength <= 4) return "bg-amber-500";
    return "bg-emerald-400";
  };

  const getStrengthText = () => {
    if (strength === 0) return "None";
    if (strength <= 2) return "Weak";
    if (strength <= 4) return "Good";
    return "Strong";
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (strength < 3) {
      toast.error("Please use a stronger Master Password.");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Create user in Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Register user in backend DB
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      await axios.post(`${apiUrl}/auth/register`, {
        firebaseUid: user.uid,
        email: user.email,
        fullName: fullName,
      });

      // 3. Derive Master Key
      const key = await deriveMasterKey(password, email);
      setMasterKey(key);

      toast.success("Vault created securely!");
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Signup error:", error);
      toast.error(error.message || "Failed to create account");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsGoogleLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (user && user.email) {
        // Sync user with backend
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        await axios.post(`${apiUrl}/auth/register`, {
          firebaseUid: user.uid,
          email: user.email,
          fullName: user.displayName || user.email.split('@')[0],
          profilePictureUrl: user.photoURL || ""
        });

        // Derive master key using uid/email fallback
        const key = await deriveMasterKey(user.uid, user.email);
        setMasterKey(key);

        toast.success("Account created via Google!");
        router.push("/dashboard");
      }
    } catch (error: any) {
      if (error?.code === "auth/popup-closed-by-user" || error?.code === "auth/cancelled-popup-request") {
        toast.info("Google sign-in canceled.");
      } else {
        console.error("Google Auth error:", error);
        toast.error(error.message || "Google sign-up failed.");
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0b1728] pb-20 md:pb-4 relative selection:bg-cyan-500/30">
      <Link href="/" className="absolute top-6 left-6 md:top-8 md:left-8 flex items-center hover:opacity-90 transition-opacity">
        <Image 
          src="/logo_v2.png" 
          alt="CipherVault by ABD Logo" 
          width={180} 
          height={48} 
          className="h-9 w-auto object-contain drop-shadow-[0_0_12px_rgba(0,242,254,0.35)]" 
          priority 
        />
      </Link>

      <div className="w-full max-w-md space-y-8 mt-12 md:mt-0 relative z-10">
        <div className="flex flex-col items-center justify-center space-y-3 text-center mt-6">
          <Image 
            src="/logo_v2.png" 
            alt="CipherVault by ABD Logo" 
            width={240} 
            height={60} 
            className="h-12 w-auto object-contain drop-shadow-[0_0_20px_rgba(0,242,254,0.45)] mb-1" 
            priority 
          />
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Create your Vault</h1>
          <p className="text-sm text-slate-400">
            Sign up to securely store and manage your passwords
          </p>
        </div>

        <Card className="glass-card border-white/15 shadow-2xl rounded-3xl">
          <form onSubmit={handleSignup}>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-slate-300">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Your Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300">Master Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••••"
                    className="pl-10 pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Password Strength Meter */}
              {password.length > 0 && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Password strength</span>
                    <span className={`font-semibold ${strength >= 4 ? 'text-emerald-400' : strength <= 2 ? 'text-rose-400' : 'text-amber-400'}`}>
                      {getStrengthText()}
                    </span>
                  </div>
                  <div className="flex gap-1.5 h-1.5 w-full">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`flex-1 rounded-full transition-all duration-300 ${level <= strength ? getStrengthColor() : 'bg-slate-700/60'
                          }`}
                      />
                    ))}
                  </div>
                  {strength >= 4 && (
                    <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Cryptographically strong
                    </p>
                  )}
                </div>
              )}
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4 pb-6 pt-2">
              <Button type="submit" variant="default" className="w-full h-11 rounded-full text-base font-semibold shadow-lg shadow-sky-500/25" disabled={isSubmitting}>
                {isSubmitting ? "Creating Vault..." : "Create Account"}
              </Button>

              <div className="relative w-full py-1">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-[#0e1c2e] px-3 text-slate-400 font-medium">Or</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleSignup}
                disabled={isGoogleLoading}
                className="w-full h-11 rounded-full text-base font-medium border-white/15 bg-white/5 hover:bg-white/10"
              >
                {isGoogleLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin text-cyan-400" />
                ) : (
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                )}
                Sign up with Google
              </Button>

              <p className="text-center text-sm text-slate-400 mt-4">
                Already have an account?{" "}
                <Link href="/login" className="text-cyan-400 hover:text-cyan-300 font-semibold underline-offset-4 hover:underline">
                  Log in
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
