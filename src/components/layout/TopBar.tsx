"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { User, LogOut } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function TopBar() {
  const pathname = usePathname();
  const { user, dbUser, logout } = useAuth();

  if (pathname === "/login" || pathname === "/signup" || pathname === "/") return null;

  const avatarUrl = dbUser?.profilePictureUrl || user?.photoURL;

  return (
    <header className="md:hidden sticky top-0 left-0 w-full glass-nav border-b border-white/10 z-40 h-16 flex items-center px-4 justify-between">
      <Link href="/" className="flex items-center gap-2 font-bold tracking-tight hover:opacity-90 transition-opacity">
        <Image 
          src="/app-logo-icon.svg" 
          alt="ABD-CipherVault Logo" 
          width={24} 
          height={24} 
          className="w-6 h-6 filter drop-shadow-[0_0_6px_rgba(0,242,254,0.6)]" 
          priority 
        />
        <span className="font-orbitron font-extrabold text-base tracking-wider bg-gradient-to-r from-sky-400 via-cyan-300 to-indigo-300 bg-clip-text text-transparent">
          ABD-CipherVault
        </span>
      </Link>
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 bg-white/10 hover:bg-white/15 px-3 py-1 rounded-full border border-white/15 backdrop-blur-md outline-none transition-all">
          {avatarUrl ? (
            <img src={avatarUrl} alt="User Avatar" className="w-6 h-6 rounded-full object-cover border border-cyan-400/50" />
          ) : (
            <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs">
              {dbUser?.fullName?.charAt(0) || user?.email?.charAt(0) || <User className="w-3.5 h-3.5 text-cyan-400" />}
            </div>
          )}
          <span className="text-xs font-semibold text-slate-200">{dbUser?.fullName?.split(' ')[0] || "User"}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 mt-2 glass-card border-white/15 text-slate-200">
          <DropdownMenuItem onClick={logout} className="cursor-pointer text-rose-300 focus:text-rose-200 focus:bg-rose-500/20 gap-2 rounded-xl">
            <LogOut className="w-4 h-4" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
