"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Plus, Search, MoreVertical, Key, AlertTriangle, ShieldAlert, Clock } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";

const PasswordDetailsDialog = dynamic(
  () => import("@/components/PasswordDetailsDialog").then(mod => mod.PasswordDetailsDialog),
  { ssr: false }
);
import { useAuth } from "@/context/AuthContext";
import { useVault } from "@/context/VaultContext";
import { auth } from "@/lib/firebase";
import { toast } from "sonner";
import { VaultItemSkeleton } from "@/components/ui/VaultItemSkeleton";

export default function DashboardPage() {
  const { user, dbUser } = useAuth();
  const { vaultItems, isLoading, refetchVaultItems } = useVault();

  const [greeting, setGreeting] = useState("Good Day");
  const [greetingIcon, setGreetingIcon] = useState("👋");
  const [currentTime, setCurrentTime] = useState<string>("");
  const [currentDate, setCurrentDate] = useState<string>("");
  const [isMounted, setIsMounted] = useState(false);
  
  // Dialog state
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const updateTimeAndGreeting = () => {
      const now = new Date();
      const hour = now.getHours();
      if (hour >= 0 && hour < 5) {
        setGreeting("Good Late Night");
        setGreetingIcon("🌙");
      } else if (hour >= 5 && hour < 12) {
        setGreeting("Good Morning");
        setGreetingIcon("🌅");
      } else if (hour >= 12 && hour < 18) {
        setGreeting("Good Afternoon");
        setGreetingIcon("☀️");
      } else {
        setGreeting("Good Evening");
        setGreetingIcon("🌆");
      }
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setCurrentDate(now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }));
    };

    updateTimeAndGreeting();
    const timer = setInterval(updateTimeAndGreeting, 1000);
    return () => clearInterval(timer);
  }, []);

  const getFirstName = () => {
    if (dbUser?.fullName?.trim()) {
      return dbUser.fullName.trim().split(" ")[0];
    }
    if (user?.displayName?.trim()) {
      return user.displayName.trim().split(" ")[0];
    }
    if (user?.email) {
      const prefix = user.email.split("@")[0];
      const clean = prefix.split(".")[0].split("_")[0].split("-")[0];
      if (clean) return clean.charAt(0).toUpperCase() + clean.slice(1);
    }
    return "User";
  };
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<'all' | 'weak' | 'reused'>('all');

  // Dynamic Security Calculations
  const isWeakPassword = (pass?: string) => {
    if (!pass) return true;
    if (pass.length < 10) return true;
    const hasUpper = /[A-Z]/.test(pass);
    const hasNum = /[0-9]/.test(pass);
    const hasSpecial = /[^A-Za-z0-9]/.test(pass);
    return !(hasUpper && (hasNum || hasSpecial));
  };

  const weakCount = vaultItems.filter(item => isWeakPassword(item.password)).length;

  const passwordCounts = vaultItems.reduce((acc, item) => {
    if (item.password) {
      acc[item.password] = (acc[item.password] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const reusedCount = vaultItems.filter(item => item.password && passwordCounts[item.password] > 1).length;

  const healthScore = vaultItems.length === 0 ? 100 : Math.max(0, Math.min(100, Math.round(100 - (weakCount * 15) - (reusedCount * 25))));

  // Filtered Vault Items based on Search Query & Active Metric Filter
  const filteredVaultItems = vaultItems.filter(item => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query ||
      item.title?.toLowerCase().includes(query) ||
      item.username?.toLowerCase().includes(query) ||
      item.category?.toLowerCase().includes(query) ||
      item.owner?.toLowerCase().includes(query);

    if (activeFilter === 'weak') {
      return matchesSearch && isWeakPassword(item.password);
    }
    if (activeFilter === 'reused') {
      return matchesSearch && item.password && passwordCounts[item.password] > 1;
    }
    return matchesSearch;
  });

  return (
    <div className="flex-1 p-4 md:p-8 space-y-8 max-w-5xl mx-auto">
      
      {/* Floating Greeting Card Section */}
      <motion.section 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-card p-6 md:p-8 rounded-3xl relative overflow-hidden border border-cyan-500/20 shadow-2xl bg-gradient-to-r from-cyan-950/20 via-sky-950/10 to-indigo-950/20"
      >
        <div className="absolute top-0 right-0 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                <span>{greetingIcon}</span>
                <span className="bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  {greeting}, {getFirstName()}!
                </span>
              </h1>
              {currentTime && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-medium shadow-inner">
                  <Clock className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  <span>{currentTime}</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-300">{currentDate}</span>
                </div>
              )}
            </div>
            <p className="text-slate-300 text-xs md:text-sm font-medium flex items-center gap-1.5 pt-0.5">
              <ShieldCheck className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <span>Your vault is protected with zero-knowledge AES-256-GCM encryption.</span>
            </p>
          </div>
          <Link href="/dashboard/add" className={cn(buttonVariants({ variant: "default", size: "lg" }), "hidden md:flex gap-2 rounded-full shadow-lg shadow-sky-500/25 shrink-0")}>
            <Plus className="w-5 h-5" /> Add Password
          </Link>
        </div>
      </motion.section>

      {/* Vault Health Card - Compact, Dynamic & Filterable */}
      <div className="glass-card-light p-5 md:p-6 rounded-3xl relative overflow-hidden transition-all duration-300 hover:shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative z-10">
          <div className="flex items-center gap-4">
            <div className={`relative flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-900 text-white border-2 shadow-lg shrink-0 ${
              healthScore >= 80 ? 'border-emerald-400' : healthScore >= 50 ? 'border-amber-400' : 'border-rose-500'
            }`}>
              <span className={`text-xl font-black ${
                healthScore >= 80 ? 'text-emerald-400' : healthScore >= 50 ? 'text-amber-400' : 'text-rose-400'
              }`}>
                {isLoading ? "..." : healthScore}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                  healthScore >= 80 ? 'bg-emerald-500/15 text-emerald-700' : healthScore >= 50 ? 'bg-amber-500/15 text-amber-700' : 'bg-rose-500/15 text-rose-700'
                }`}>
                  {healthScore >= 80 ? 'Optimal' : healthScore >= 50 ? 'Warning' : 'Critical'}
                </span>
                <h3 className="font-extrabold text-lg text-slate-900 tracking-tight">Vault Health</h3>
              </div>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                {weakCount === 0 && reusedCount === 0 
                  ? "All credentials have strong & unique passwords." 
                  : `${weakCount} weak and ${reusedCount} reused credentials detected.`}
              </p>
            </div>
          </div>

          {/* Interactive Metric Filter Buttons */}
          <div className="flex items-center gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 sm:border-l border-slate-300/60 sm:pl-6">
            <button 
              onClick={() => setActiveFilter(activeFilter === 'weak' ? 'all' : 'weak')}
              className={cn(
                "flex flex-col gap-0.5 p-2.5 px-4 rounded-2xl border transition-all text-left flex-1 sm:flex-none cursor-pointer",
                activeFilter === 'weak' 
                  ? 'bg-amber-500/20 border-amber-500/50 shadow-md ring-2 ring-amber-400/40' 
                  : 'bg-white/70 hover:bg-white/90 border-slate-200'
              )}
            >
              <span className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500"/> Weak
              </span>
              <span className="font-extrabold text-lg text-slate-900">{weakCount}</span>
            </button>

            <button 
              onClick={() => setActiveFilter(activeFilter === 'reused' ? 'all' : 'reused')}
              className={cn(
                "flex flex-col gap-0.5 p-2.5 px-4 rounded-2xl border transition-all text-left flex-1 sm:flex-none cursor-pointer",
                activeFilter === 'reused' 
                  ? 'bg-rose-500/20 border-rose-500/50 shadow-md ring-2 ring-rose-400/40' 
                  : 'bg-white/70 hover:bg-white/90 border-slate-200'
              )}
            >
              <span className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-500"/> Reused
              </span>
              <span className="font-extrabold text-lg text-slate-900">{reusedCount}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Vault Section */}
      <section className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-1">
          <div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>Vault Passwords</span>
              {activeFilter !== 'all' && (
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Filter: {activeFilter}
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Showing {filteredVaultItems.length} of {vaultItems.length} items
            </p>
          </div>

          {/* Real-time Search Input Bar */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-cyan-400" />
            <Input 
              type="text"
              placeholder="Search vault items..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 bg-white/5 border-white/15 text-white placeholder:text-slate-500 rounded-xl text-xs focus-visible:ring-cyan-400/50"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-2.5 text-[10px] font-bold text-slate-400 hover:text-white bg-white/10 px-1.5 py-0.5 rounded"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Password List */}
        <div className="grid gap-3.5">
          {isLoading ? (
            <VaultItemSkeleton count={4} />
          ) : filteredVaultItems.length === 0 ? (
            <div className="text-center p-10 glass-card rounded-3xl border border-dashed border-white/20">
              <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4 text-cyan-400">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-white">
                {vaultItems.length === 0 ? "Your vault is empty" : "No matching items found"}
              </h3>
              <p className="text-sm text-slate-400 mb-6 mt-1 max-w-sm mx-auto">
                {vaultItems.length === 0 
                  ? "Start building your secure encrypted vault by adding your first credential." 
                  : "Try clearing search keywords or active filters."}
              </p>
              {vaultItems.length === 0 ? (
                <Link href="/dashboard/add" className={cn(buttonVariants({ variant: "default" }), "rounded-full shadow-lg shadow-sky-500/25 px-6")}>
                  <Plus className="w-4 h-4 mr-2" /> Add Item
                </Link>
              ) : (
                <Button 
                  onClick={() => { setSearchQuery(""); setActiveFilter('all'); }} 
                  variant="outline"
                  className="rounded-full px-6 border-white/20 text-white"
                >
                  Reset Search & Filters
                </Button>
              )}
            </div>
          ) : (
            filteredVaultItems.map((item) => (
              <div 
                key={item.id} 
                className="glass-card p-4 rounded-3xl flex items-center justify-between cursor-pointer hover:border-cyan-400/40 hover:bg-white/[0.1] transition-all duration-200 group shadow-lg"
                onClick={() => {
                  setSelectedItem(item);
                  setIsDialogOpen(true);
                }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500/20 to-indigo-500/20 text-cyan-300 flex items-center justify-center font-bold text-xl border border-white/15 shadow-inner">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base group-hover:text-cyan-300 transition-colors leading-snug">{item.title}</h3>
                    <p className="text-xs text-slate-400 mt-1 truncate max-w-[180px] md:max-w-xs font-medium">{item.username || "No username"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="hidden md:inline-flex text-xs font-semibold px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 backdrop-blur-md">
                    {item.owner || "Personal"}
                  </span>
                  <Button variant="ghost" size="icon" className="text-slate-400 group-hover:text-white rounded-full">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
      
      {/* Mobile FAB */}
      <div className="md:hidden fixed bottom-20 right-5 z-40">
        <Link href="/dashboard/add" className="w-14 h-14 rounded-full bg-gradient-to-r from-sky-400 to-indigo-600 text-white shadow-xl shadow-cyan-500/40 flex items-center justify-center border border-white/30 active:scale-95 transition-transform">
          <Plus className="w-7 h-7" />
        </Link>
      </div>

      <PasswordDetailsDialog 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)} 
        item={selectedItem} 
        onItemUpdated={refetchVaultItems}
        onItemDeleted={refetchVaultItems}
      />
    </div>
  );
}
