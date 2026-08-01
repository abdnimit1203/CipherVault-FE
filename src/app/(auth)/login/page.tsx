"use client";

import Link from "next/link";
import Image from "next/image";
import { Mail, Lock, EyeOff, Eye, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { deriveMasterKey } from "@/lib/crypto";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Footer } from "@/components/layout/Footer";
import { useRouter } from "next/navigation";
import axios from "axios";
import { CipherLoader } from "@/components/ui/CipherLoader";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const { user, loading, setMasterKey } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [user, loading, router]);

  if (loading || user) {
    return <CipherLoader size="fullscreen" text="Opening Vault..." />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // 1. Sign in with Firebase
      await signInWithEmailAndPassword(auth, email, password);

      // 2. Derive Master Key
      const key = await deriveMasterKey(password, email);
      setMasterKey(key);

      toast.success("Vault unlocked!");
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error("Invalid email or master password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
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

        toast.success("Logged in with Google!");
        router.push("/dashboard");
      }
    } catch (error: any) {
      if (error?.code === "auth/popup-closed-by-user" || error?.code === "auth/cancelled-popup-request") {
        toast.info("Google sign-in canceled.");
      } else {
        console.error("Google Auth error:", error);
        toast.error(error.message || "Google sign-in failed.");
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error("Please enter your email address first.");
      return;
    }

    setIsResetting(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("Password reset email sent! Check your inbox.");
    } catch (error: any) {
      console.error("Reset password error:", error);
      toast.error(error.message || "Failed to send reset email.");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0b1728] relative selection:bg-cyan-500/30">
      <Link href="/" className="absolute top-6 left-6 md:top-8 md:left-8 flex items-center gap-2 font-bold tracking-tight hover:opacity-90 transition-opacity">
        <Image 
          src="/app-logo-icon.svg" 
          alt="ABD-CipherVault Logo" 
          width={28} 
          height={28} 
          className="w-7 h-7 filter drop-shadow-[0_0_8px_rgba(0,242,254,0.6)]" 
          priority 
        />
        <span className="font-orbitron font-extrabold text-base tracking-wider bg-gradient-to-r from-sky-400 via-cyan-300 to-indigo-300 bg-clip-text text-transparent">
          ABD-CipherVault
        </span>
      </Link>

      <div className="w-full max-w-md space-y-8 mt-12 md:mt-0 relative z-10">
        <div className="flex flex-col items-center justify-center space-y-3 text-center">
          <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 shadow-inner mb-1">
            <Image 
              src="/app-logo-icon.svg" 
              alt="ABD-CipherVault Logo" 
              width={48} 
              height={48} 
              className="w-12 h-12 filter drop-shadow-[0_0_12px_rgba(0,242,254,0.7)]" 
              priority 
            />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Welcome back</h1>
          <p className="text-sm text-slate-400">
            Enter your credentials to access your secure encrypted vault
          </p>
        </div>

        <Card className="glass-card border-white/15 shadow-2xl rounded-3xl">
          <form onSubmit={handleLogin}>
            <CardContent className="pt-6 space-y-4">
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-slate-300">Master Password</Label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={isResetting}
                    className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
                  >
                    {isResetting ? "Sending..." : "Forgot Password?"}
                  </button>
                </div>
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
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 pb-6 pt-2">
              <Button type="submit" variant="default" className="w-full h-11 rounded-full text-base font-semibold shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <CipherLoader size="sm" />
                    <span>Unlocking Vault...</span>
                  </>
                ) : (
                  "Unlock Vault"
                )}
              </Button>

              <div className="relative w-full py-1">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-[#0e1c2e] px-3 text-slate-400 font-medium">Or continue with</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full h-11 rounded-full border-white/15 bg-white/5 hover:bg-white/10 text-white font-medium flex items-center justify-center gap-2"
                onClick={handleGoogleLogin}
                disabled={isGoogleLoading}
              >
                {isGoogleLoading ? (
                  <>
                    <CipherLoader size="sm" />
                    <span>Connecting Google...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Continue with Google
                  </>
                )}
              </Button>

              <p className="text-center text-sm text-slate-400 mt-4">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="text-cyan-400 hover:text-cyan-300 font-semibold underline-offset-4 hover:underline">
                  Sign up
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
