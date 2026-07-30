"use client";

import Link from "next/link";
import Image from "next/image";
import { Shield, Lock, KeyRound, Smartphone, User, LogOut, Settings, LayoutDashboard } from "lucide-react";
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
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20 relative overflow-hidden">
      {/* Background glowing mesh effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background z-0 pointer-events-none"></div>
      
      {/* Navbar */}
      <header className="flex items-center justify-between p-6 max-w-7xl mx-auto w-full relative z-10">
        <Link href="/" className="flex items-center hover:opacity-90 transition-opacity">
          <Image 
            src="/logo_v2.png" 
            alt="CipherVault by ABD Logo" 
            width={220} 
            height={56} 
            className="h-11 w-auto object-contain drop-shadow-[0_0_15px_rgba(0,242,254,0.4)]" 
            priority 
          />
        </Link>
        <nav className="flex items-center gap-4">
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
              <DropdownMenuContent align="end" className="w-56 glass-card border-white/15 text-slate-200">
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
              <Link href="/login" className="text-sm font-semibold text-slate-300 hover:text-cyan-300 transition-colors hidden sm:block">
                Log in
              </Link>
              <Link href="/signup" className={cn(buttonVariants({ variant: "default" }), "rounded-full px-6 shadow-lg shadow-sky-500/25")}>
                Get Started
              </Link>
            </>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 mt-8 md:mt-12 max-w-4xl mx-auto relative z-10">
        
        {/* Animated Hero Graphic */}
        <div className="relative mb-6 w-24 h-24 flex items-center justify-center mt-2">
          <div className="absolute inset-0 border-2 border-primary/30 rounded-full border-dashed animate-[spin_10s_linear_infinite]"></div>
          <div className="absolute inset-2 border-2 border-cyan-400/20 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>
          <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center backdrop-blur-md border border-primary/50 shadow-[0_0_40px_-10px_rgba(var(--primary),0.8)]">
            <Shield className="w-10 h-10 text-primary" />
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-8 border border-primary/20">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          Next-Generation Security
        </div>
        
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-foreground mb-6 leading-tight">
          Your digital life, <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-300">
            cryptographically secured.
          </span>
        </h1>
        
        <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl leading-relaxed">
          A premium password manager built with zero-knowledge architecture. 
          Your secrets are encrypted on your device and never leave in plaintext.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link href="/signup" className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto rounded-full h-14 px-8 text-lg")}>
            Create your Vault
          </Link>
          <Link href="/login" className={cn(buttonVariants({ size: "lg", variant: "outline" }), "w-full sm:w-auto rounded-full h-14 px-8 text-lg")}>
            Open Web Vault
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 md:mt-20 w-full max-w-5xl text-left relative z-10 mb-16">
          
          <div className="group relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-8 hover:border-primary/50 hover:shadow-[0_0_30px_-5px_rgba(var(--primary),0.3)] transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 mb-6 group-hover:scale-110 transition-transform">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3 tracking-tight">Zero-Knowledge</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              We never see your master password. Everything is encrypted using military-grade <span className="text-foreground font-mono text-xs bg-muted px-1 py-0.5 rounded">AES-256-GCM</span> before it ever leaves your device.
            </p>
          </div>

          <div className="group relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-8 hover:border-primary/50 hover:shadow-[0_0_30px_-5px_rgba(var(--primary),0.3)] transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 mb-6 group-hover:scale-110 transition-transform">
              <Smartphone className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3 tracking-tight">Mobile First</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Designed as a Progressive Web App (PWA). Install it directly on your phone for a seamless, blazing-fast native-like experience anywhere.
            </p>
          </div>

          <div className="group relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-8 hover:border-primary/50 hover:shadow-[0_0_30px_-5px_rgba(var(--primary),0.3)] transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 mb-6 group-hover:scale-110 transition-transform">
              <KeyRound className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3 tracking-tight">Instant Generator</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Create cryptographically strong, mathematically complex passwords for every site with a single tap. Never reuse a password again.
            </p>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
