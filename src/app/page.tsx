"use client";

import Link from "next/link";
import Image from "next/image";
import { Shield, Lock, KeyRound, Smartphone, User, LogOut, Settings, LayoutDashboard, ShieldCheck, Cpu, Layers, UserCheck, Sparkles, Image as ImageIcon } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { Footer } from "@/components/layout/Footer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function LandingPage() {
  const { user, dbUser, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-[#0b1728] text-slate-100 selection:bg-cyan-500/30 relative overflow-x-hidden scroll-smooth">
      {/* Background glowing mesh effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-500/10 via-background to-background z-0 pointer-events-none"></div>
      
      {/* Floating Glass Pill Navbar */}
      <header className="w-[92%] max-w-6xl mx-auto mt-4 md:mt-6 rounded-full glass-nav border border-white/15 px-4 md:px-6 py-3 shadow-2xl flex items-center justify-between relative z-20 backdrop-blur-2xl">
        <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-all duration-200">
          <Image 
            src="/app-logo-icon.svg" 
            alt="ABD-CipherVault Symbol" 
            width={34} 
            height={34} 
            className="w-8 h-8 md:w-9 md:h-9 filter drop-shadow-[0_0_8px_rgba(0,242,254,0.6)]" 
            priority 
          />
          <span className="font-orbitron font-extrabold text-base md:text-lg tracking-wider bg-gradient-to-r from-sky-400 via-cyan-300 to-indigo-300 bg-clip-text text-transparent">
            ABD-CipherVault
          </span>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-300">
          <a href="#features" className="hover:text-cyan-300 transition-colors">Features</a>
          <a href="#security" className="hover:text-cyan-300 transition-colors">Zero-Knowledge</a>
          <a href="#pwa" className="hover:text-cyan-300 transition-colors">PWA Native</a>
        </nav>

        <nav className="flex items-center gap-3">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost", size: "default" }), "rounded-full bg-white/10 hover:bg-white/15 border border-white/15 px-3 py-1.5 flex items-center gap-2.5 backdrop-blur-md outline-none")}>
                {dbUser?.profilePictureUrl || user?.photoURL ? (
                  <img src={dbUser?.profilePictureUrl || user?.photoURL || ''} alt="User Avatar" className="w-7 h-7 rounded-full object-cover border border-cyan-400/50" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs">
                    {dbUser?.fullName?.charAt(0) || user?.email?.charAt(0) || <User className="w-4 h-4 text-cyan-400" />}
                  </div>
                )}
                <span className="font-semibold text-sm text-slate-200">{dbUser?.fullName?.split(' ')[0] || "User"}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-[#0c192c]/95 border border-cyan-500/30 text-slate-100 backdrop-blur-2xl shadow-2xl rounded-2xl p-2 mt-2 z-50">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-slate-400 text-xs">My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem className="focus:bg-white/10 rounded-xl">
                    <Link href="/dashboard" className="cursor-pointer flex items-center w-full">
                      <LayoutDashboard className="mr-2 h-4 w-4 text-cyan-400" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="focus:bg-white/10 rounded-xl">
                    <Link href="/dashboard/settings" className="cursor-pointer flex items-center w-full">
                      <Settings className="mr-2 h-4 w-4 text-cyan-400" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem onClick={logout} className="cursor-pointer text-rose-300 focus:text-rose-200 focus:bg-rose-500/20 rounded-xl">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link href="/login" className="text-sm font-semibold text-slate-300 hover:text-cyan-300 transition-colors hidden sm:block px-2">
                Log in
              </Link>
              <Link href="/signup" className={cn(buttonVariants({ variant: "default" }), "rounded-full px-5 py-2 text-sm font-bold shadow-lg shadow-cyan-500/25")}>
                Get Started
              </Link>
            </>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 mt-8 md:mt-12 max-w-5xl mx-auto relative z-10">
        
        {/* Animated Hero Graphic */}
        <div className="relative mb-6 w-24 h-24 flex items-center justify-center mt-2">
          <div className="absolute inset-0 border-2 border-cyan-400/30 rounded-full border-dashed animate-[spin_10s_linear_infinite]"></div>
          <div className="absolute inset-2 border-2 border-sky-400/20 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>
          <div className="w-20 h-20 bg-cyan-500/20 rounded-full flex items-center justify-center backdrop-blur-md border border-cyan-400/50 shadow-[0_0_40px_-10px_rgba(0,242,254,0.6)]">
            <ShieldCheck className="w-10 h-10 text-cyan-300" />
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 text-cyan-300 text-xs font-semibold mb-8 border border-cyan-500/20 shadow-inner">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
          </span>
          Next-Generation Zero-Knowledge Architecture
        </div>
        
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight">
          Your digital secrets, <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-indigo-300">
            cryptographically secured.
          </span>
        </h1>
        
        <p className="text-lg sm:text-xl text-slate-300 mb-10 max-w-2xl leading-relaxed">
          A premium password manager built with zero-knowledge architecture. 
          Your credentials are encrypted locally on your device and never leave in plaintext.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-16">
          <Link 
            href={user ? "/dashboard" : "/signup"} 
            className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto rounded-full h-14 px-8 text-lg font-bold shadow-xl shadow-cyan-500/25")}
          >
            {user ? "Open Your Vault" : "Create your Vault"}
          </Link>
          <Link 
            href={user ? "/dashboard" : "/login"} 
            className={cn(buttonVariants({ size: "lg", variant: "outline" }), "w-full sm:w-auto rounded-full h-14 px-8 text-lg font-bold border-white/20 bg-white/5 hover:bg-white/10 text-white")}
          >
            {user ? "Go to Dashboard" : "Open Web Vault"}
          </Link>
        </div>

        {/* SECTION 1: Features (#features) */}
        <section id="features" className="w-full pt-16 pb-12 border-t border-white/10 text-left">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3 leading-snug">
              Key Features Built for <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-indigo-300">Maximum Security</span>
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto text-sm md:text-base">
              Everything you need to store, organize, and manage your credentials with confidence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            <div className="glass-card p-8 rounded-3xl border-white/15 hover:border-cyan-400/40 transition-all duration-300 group">
              <div className="w-12 h-12 bg-cyan-500/10 rounded-2xl flex items-center justify-center border border-cyan-500/20 mb-6 group-hover:scale-110 transition-transform">
                <Lock className="w-6 h-6 text-cyan-300" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Zero-Knowledge Architecture</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Client-side AES-256-GCM encryption means your master key never leaves your device.
              </p>
            </div>

            <div className="glass-card p-8 rounded-3xl border-white/15 hover:border-cyan-400/40 transition-all duration-300 group">
              <div className="w-12 h-12 bg-cyan-500/10 rounded-2xl flex items-center justify-center border border-cyan-500/20 mb-6 group-hover:scale-110 transition-transform">
                <UserCheck className="w-6 h-6 text-cyan-300" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Owner Radio Selector</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Organize credentials with glass pill radio selectors: Personal, Family, Friend, or Other.
              </p>
            </div>

            <div className="glass-card p-8 rounded-3xl border-white/15 hover:border-cyan-400/40 transition-all duration-300 group">
              <div className="w-12 h-12 bg-cyan-500/10 rounded-2xl flex items-center justify-center border border-cyan-500/20 mb-6 group-hover:scale-110 transition-transform">
                <KeyRound className="w-6 h-6 text-cyan-300" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Instant Generator</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Generate cryptographically strong, complex passwords for every account in a single tap.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 2: Security Deep Dive (#security) */}
        <section id="security" className="w-full pt-16 pb-12 border-t border-white/10 text-left">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3 leading-snug">
              Zero-Knowledge <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-indigo-300">Cryptographic Engine</span>
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto text-sm md:text-base">
              Your sensitive credentials remain encrypted even if servers are compromised.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-base shrink-0 mt-1">
                  1
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">Argon2id Key Derivation</h4>
                  <p className="text-slate-400 text-sm leading-relaxed mt-1">
                    Your master password is processed through Argon2id KDF to generate a 256-bit cryptographic encryption key inside your browser.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-base shrink-0 mt-1">
                  2
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">AES-256-GCM Encryption</h4>
                  <p className="text-slate-400 text-sm leading-relaxed mt-1">
                    Each field is encrypted with unique Initialization Vectors (IV). Plaintext data is never stored anywhere.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-base shrink-0 mt-1">
                  3
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">Local Decryption & Auto-Purge</h4>
                  <p className="text-slate-400 text-sm leading-relaxed mt-1">
                    Decryption occurs on-demand when you click Reveal. Master keys are kept in volatile memory and purged on logout.
                  </p>
                </div>
              </div>
            </div>

            <div className="glass-card p-8 rounded-3xl border-cyan-500/30 bg-cyan-950/20 space-y-4">
              <div className="flex items-center gap-3">
                <Cpu className="w-8 h-8 text-cyan-400" />
                <h4 className="text-lg font-bold text-white">Cryptographic Specification</h4>
              </div>
              <div className="font-mono text-xs text-cyan-300/90 space-y-2 bg-slate-950/60 p-4 rounded-2xl border border-white/10">
                <p>Algorithm: AES-256-GCM</p>
                <p>Key Length: 256 bits</p>
                <p>KDF: Argon2id (Memory: 64MB, Iterations: 3)</p>
                <p>Authentication: Web Crypto API SubtleCrypto</p>
                <p>Server Storage: Encrypted Ciphertext Only</p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: PWA Native (#pwa) */}
        <section id="pwa" className="w-full pt-16 pb-20 border-t border-white/10 text-left">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3 leading-snug">
              Progressive Web App <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-indigo-300">(PWA) Native</span>
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto text-sm md:text-base">
              Install ABD-CipherVault to your home screen for a fast native app experience on mobile and desktop.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card p-8 rounded-3xl border-white/15 text-center space-y-3">
              <Smartphone className="w-10 h-10 text-cyan-400 mx-auto" />
              <h4 className="text-lg font-bold text-white">1-Tap Install</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Add to Home Screen from Safari or Chrome for a full-screen, native application feel with offline service workers.
              </p>
            </div>

            <div className="glass-card p-8 rounded-3xl border-white/15 text-center space-y-3">
              <Layers className="w-10 h-10 text-cyan-400 mx-auto" />
              <h4 className="text-lg font-bold text-white">Poco X2 Thumb Friendly</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Tailored for one-handed mobile usage with large touch targets (&gt;= 44px) and floating bottom tab bar navigation.
              </p>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
