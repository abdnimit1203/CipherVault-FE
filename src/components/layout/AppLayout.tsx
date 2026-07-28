import { BottomNav } from "./BottomNav";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { Toaster } from "sonner";

export function AppLayout({ children }: { children: React.ReactNode }) {
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
