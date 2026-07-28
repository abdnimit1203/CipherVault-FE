"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Shield, Search, KeyRound, Settings, LogOut, Plus, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";

const navItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "All Vaults", href: "/dashboard", icon: Shield },
  { name: "Search", href: "/dashboard/search", icon: Search },
  { name: "Generator", href: "/dashboard/generator", icon: KeyRound },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  if (pathname === "/login" || pathname === "/signup" || pathname === "/") return null;

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen border-r border-border bg-background sticky top-0">
      <div className="flex items-center h-16 px-6 border-b border-border">
        <Link href="/" className="flex items-center gap-2 text-primary font-bold text-xl tracking-tight px-2 hover:opacity-80 transition-opacity">
          <Image src="/CipherVault-logo.svg" alt="CipherVault Logo" width={28} height={28} className="w-7 h-7" />
          <span>CipherVault</span>
        </Link>
      </div>

      <div className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
        <div className="space-y-2">
          <Link 
            href="/dashboard/add" 
            className={cn(buttonVariants({ size: "lg" }), "w-full justify-start gap-2 shadow-sm")}
          >
            <Plus className="w-5 h-5" />
            Add Password
          </Link>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive && "fill-primary/20")} strokeWidth={isActive ? 2.5 : 2} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-border">
        <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground">
          <LogOut className="w-5 h-5" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
}
