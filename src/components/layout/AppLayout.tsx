"use client";

import { BottomNav } from "./BottomNav";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { Toaster } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

import { usePathname } from "next/navigation";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#0b1728]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/20">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          </div>
          <p className="text-sm font-medium text-slate-400 animate-pulse">Decrypting session...</p>
        </div>
      </div>
    );
  }

  const isPublicPage = pathname === "/" || pathname === "/login" || pathname === "/signup";

  if (isPublicPage) {
    return (
      <div className="min-h-screen w-full bg-[#0b1728] text-slate-100 relative selection:bg-cyan-500/30 flex flex-col justify-between">
        {/* Ambient background light orbs */}
        <div className="pointer-events-none fixed -top-40 -left-40 w-96 h-96 bg-sky-500/15 rounded-full blur-3xl" />
        <div className="pointer-events-none fixed top-1/3 -right-40 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl" />
        <div className="pointer-events-none fixed -bottom-40 left-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />

        {children}

        {/* Global Toaster for notifications */}
        <Toaster richColors position="top-center" />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-[#0b1728] text-slate-100 overflow-hidden relative selection:bg-cyan-500/30">
      {/* Ambient background light orbs */}
      <div className="pointer-events-none absolute -top-40 -left-40 w-96 h-96 bg-sky-500/15 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-40 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 left-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />

      {/* Desktop Sidebar */}
      <Sidebar />

      <div className="flex flex-col flex-1 w-full h-full overflow-hidden relative z-10">
        {/* Mobile TopBar */}
        <TopBar />

        {/* Main Content Area */}
        <main className="flex-1 w-full overflow-y-auto pb-20 md:pb-6 relative">
          {children}
        </main>

        {/* Mobile BottomNav */}
        <BottomNav />
      </div>

      {/* Global Toaster for notifications */}
      <Toaster richColors position="top-center" />
    </div>
  );
}
