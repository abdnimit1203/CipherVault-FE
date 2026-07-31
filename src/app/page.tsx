"use client";

import Link from "next/link";
import Image from "next/image";
import { User, LogOut, Settings, LayoutDashboard } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { Footer } from "@/components/layout/Footer";
import { ScrollCanvasAnimation } from "@/components/home/ScrollCanvasAnimation";
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
    <div className="min-h-screen flex flex-col bg-[#070f1e] text-slate-100 selection:bg-cyan-500/30 relative overflow-x-hidden">
      
      {/* Fixed Glass Pill Header / Navbar */}
      <header className="fixed top-3 sm:top-4 left-0 right-0 w-[94%] sm:w-[92%] max-w-6xl mx-auto rounded-full glass-nav border border-white/15 px-3.5 py-2 md:px-6 md:py-3 shadow-2xl flex items-center justify-between z-40 backdrop-blur-2xl bg-[#0c192c]/80">
        <Link href="/" className="flex items-center gap-1.5 sm:gap-2 hover:opacity-90 transition-all duration-200">
          <Image 
            src="/app-logo-icon.svg" 
            alt="ABD-CipherVault Symbol" 
            width={24} 
            height={24} 
            className="w-6 h-6 md:w-9 md:h-9 filter drop-shadow-[0_0_8px_rgba(0,242,254,0.6)]" 
            priority 
          />
          <span className="font-orbitron font-extrabold text-sm sm:text-base md:text-lg tracking-wider bg-gradient-to-r from-sky-400 via-cyan-300 to-indigo-300 bg-clip-text text-transparent">
            ABD-CipherVault
          </span>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-300">
          <a href="#features" className="hover:text-cyan-300 transition-colors">Features</a>
          <a href="#security" className="hover:text-cyan-300 transition-colors">Zero-Knowledge</a>
          <a href="#pwa" className="hover:text-cyan-300 transition-colors">PWA Native</a>
        </nav>

        <nav className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost", size: "default" }), "rounded-full bg-white/10 hover:bg-white/15 border border-white/15 px-2.5 py-1 md:px-3 md:py-1.5 flex items-center gap-2 backdrop-blur-md outline-none")}>
                {dbUser?.profilePictureUrl || user?.photoURL ? (
                  <img src={dbUser?.profilePictureUrl || user?.photoURL || ''} alt="User Avatar" className="w-6 h-6 md:w-7 md:h-7 rounded-full object-cover border border-cyan-400/50" />
                ) : (
                  <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs">
                    {dbUser?.fullName?.charAt(0) || user?.email?.charAt(0) || <User className="w-3.5 h-3.5 md:w-4 md:h-4 text-cyan-400" />}
                  </div>
                )}
                <span className="font-semibold text-xs sm:text-sm text-slate-200">{dbUser?.fullName?.split(' ')[0] || "User"}</span>
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
              <Link href="/login" className="text-xs sm:text-sm font-semibold text-slate-300 hover:text-cyan-300 transition-colors hidden sm:block px-1.5">
                Log in
              </Link>
              <Link href="/signup" className={cn(buttonVariants({ variant: "default" }), "rounded-full px-3.5 py-1.5 sm:px-5 sm:py-2 text-xs sm:text-sm font-bold shadow-lg shadow-cyan-500/25")}>
                Get Started
              </Link>
            </>
          )}
        </nav>
      </header>

      {/* Main Interactive Scroll Experience */}
      <main className="flex-1 w-full">
        <ScrollCanvasAnimation user={user} />
      </main>

      {/* Footer */}
      <div className="relative z-30 bg-[#070f1e]">
        <Footer />
      </div>

    </div>
  );
}
