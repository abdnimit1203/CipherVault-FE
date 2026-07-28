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
    <div className="md:hidden fixed bottom-0 left-0 w-full bg-background/80 backdrop-blur-lg border-t border-border z-50 pb-safe">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1 text-muted-foreground transition-colors",
                isActive && "text-primary"
              )}
            >
              <Icon className={cn("w-6 h-6", isActive && "fill-primary/20")} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
