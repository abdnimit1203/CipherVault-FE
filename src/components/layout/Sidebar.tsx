"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Shield, Search, KeyRound, Settings, LogOut, Plus, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "All Vaults", href: "/dashboard", icon: Shield },
  { name: "Search", href: "/dashboard/search", icon: Search },
  { name: "Generator", href: "/dashboard/generator", icon: KeyRound },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, dbUser, logout } = useAuth();

  if (pathname === "/login" || pathname === "/signup" || pathname === "/") return null;

  const avatarUrl = dbUser?.profilePictureUrl || user?.photoURL;

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen border-r border-white/10 glass-nav sticky top-0 z-20">
      <div className="flex items-center h-20 px-6 border-b border-white/10">
        <Link href="/" className="flex items-center gap-3 font-bold text-xl tracking-tight hover:opacity-90 transition-opacity">
          <Image 
            src="/app-logo-icon.svg" 
            alt="ABD-CipherVault Logo" 
            width={32} 
            height={32} 
            className="w-8 h-8 filter drop-shadow-[0_0_8px_rgba(0,242,254,0.6)]" 
            priority 
          />
          <div className="flex flex-col">
            <span className="font-orbitron font-extrabold text-base tracking-wider bg-gradient-to-r from-sky-400 via-cyan-300 to-indigo-300 bg-clip-text text-transparent">
              ABD-CipherVault
            </span>
          </div>
        </Link>
      </div>

      <div className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
        <div className="space-y-2">
          <Link 
            href="/dashboard/add" 
            className={cn(buttonVariants({ variant: "default" }), "w-full justify-center gap-2 shadow-lg shadow-sky-500/20 text-white rounded-full py-3")}
          >
            <Plus className="w-5 h-5" />
            Add Password
          </Link>
        </div>

        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-sky-500/20 to-indigo-500/10 text-cyan-300 border border-cyan-500/30 shadow-md backdrop-blur-md"
                    : "text-slate-400 hover:bg-white/5 hover:text-white hover:border-white/10 border border-transparent"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive ? "text-cyan-400" : "text-slate-400")} strokeWidth={isActive ? 2.5 : 2} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-white/10 space-y-3">
        <div className="flex items-center gap-3 px-3 py-2 rounded-2xl bg-white/5 border border-white/10">
          {avatarUrl ? (
            <img src={avatarUrl} alt="User Avatar" className="w-8 h-8 rounded-full object-cover border border-cyan-400/50" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs border border-cyan-500/30">
              {dbUser?.fullName?.charAt(0) || user?.email?.charAt(0) || "U"}
            </div>
          )}
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-xs font-bold text-white truncate">{dbUser?.fullName || "User Account"}</span>
            <span className="text-[10px] text-slate-400 truncate">{dbUser?.email || user?.email}</span>
          </div>
        </div>

        <Button onClick={logout} variant="ghost" className="w-full justify-start gap-3 text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-2xl">
          <LogOut className="w-5 h-5" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
}
