"use client";

import { usePathname } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { User } from "lucide-react";

export function TopBar() {
  const pathname = usePathname();
  const { dbUser } = useAuth();

  if (pathname === "/login" || pathname === "/signup" || pathname === "/") return null;

  return (
    <header className="md:hidden sticky top-0 left-0 w-full bg-background/80 backdrop-blur-lg border-b border-border z-40 h-14 flex items-center px-4 justify-between">
      <div className="flex items-center gap-2 text-primary font-bold tracking-tight">
        <Image src="/CipherVault-logo.svg" alt="CipherVault Logo" width={24} height={24} className="w-6 h-6" />
        <span>CipherVault</span>
      </div>
      <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
        <User className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium text-primary">{dbUser?.fullName?.split(' ')[0] || "User"}</span>
      </div>
    </header>
  );
}
