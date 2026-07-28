"use client";

import { BottomNav } from "./BottomNav";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { Toaster } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border border-primary/20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
          <p className="text-sm font-medium text-muted-foreground animate-pulse">Decrypting session...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex h-screen w-full bg-muted/30 overflow-hidden">
      {/* Desktop Sidebar */}
      <Sidebar />

      <div className="flex flex-col flex-1 w-full h-full overflow-hidden">
        {/* Mobile TopBar */}
        <TopBar />

        {/* Main Content Area */}
        <main className="flex-1 w-full overflow-y-auto pb-16 md:pb-0 relative">
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
