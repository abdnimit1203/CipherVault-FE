"use client";

import Link from "next/link";
import Image from "next/image";
import { Shield, Lock, KeyRound, Smartphone, User, LogOut, Settings, LayoutDashboard } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
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
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20">
      
      {/* Navbar */}
      <header className="flex items-center justify-between p-6 max-w-7xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-2 text-primary font-bold text-xl tracking-tight">
          <Image src="/CipherVault-logo.svg" alt="CipherVault Logo" width={32} height={32} className="w-8 h-8" />
          <span>CipherVault</span>
        </Link>
        <nav className="flex items-center gap-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost", size: "default" }), "rounded-full bg-primary/10 hover:bg-primary/20 px-4 py-2 flex items-center gap-2")}>
                <User className="w-5 h-5 text-primary" />
                <span className="font-medium text-sm">{dbUser?.fullName?.split(' ')[0] || "User"}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Link href="/dashboard" className="cursor-pointer flex items-center w-full">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/dashboard/settings" className="cursor-pointer flex items-center w-full">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
                Log in
              </Link>
              <Link href="/signup" className={cn(buttonVariants({}), "rounded-full px-6")}>
                Get Started
              </Link>
            </>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 mt-16 md:mt-24 max-w-4xl mx-auto">
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-24 md:mt-32 w-full max-w-5xl text-left border-t border-border pt-16">
          
          <div className="flex flex-col gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Zero-Knowledge</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              We never see your master password. Everything is encrypted using AES-256-GCM before it ever reaches our servers.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
              <Smartphone className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Mobile First</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Designed as a Progressive Web App (PWA). Install it directly on your phone for a seamless native-like experience.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
              <KeyRound className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Instant Generator</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Create cryptographically strong, unique passwords for every site with a single tap.
            </p>
          </div>

        </div>
      </main>

      <footer className="mt-auto py-8 text-center text-sm text-muted-foreground border-t border-border/50">
        <p>&copy; {new Date().getFullYear()} CipherVault. All rights reserved.</p>
      </footer>
    </div>
  );
}
