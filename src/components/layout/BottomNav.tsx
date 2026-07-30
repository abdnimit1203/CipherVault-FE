"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Shield, Search, KeyRound, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Vault", href: "/dashboard", icon: Shield },
  { name: "Search", href: "/dashboard/search", icon: Search },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  // Do not show bottom nav on auth pages
  if (pathname === "/login" || pathname === "/signup" || pathname === "/") return null;

  return (
    <div className="md:hidden fixed bottom-3 left-1/2 -translate-x-1/2 w-[92%] max-w-md glass-nav border border-white/15 rounded-full z-50 shadow-2xl backdrop-blur-2xl px-2 py-1.5">
      <div className="flex items-center justify-around h-12">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center py-1 px-3 rounded-full transition-all duration-200",
                isActive 
                  ? "text-cyan-300 bg-white/10 border border-white/15 shadow-inner scale-105" 
                  : "text-slate-400 hover:text-slate-200"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive ? "text-cyan-300" : "text-slate-400")} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium tracking-tight mt-0.5">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
