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
import { auth } from "@/lib/firebase";
import { decryptVaultItem } from "@/lib/crypto";
import axios from "axios";
import { toast } from "sonner";

export default function DashboardPage() {
  const [greeting, setGreeting] = useState("Good Day");
  const [greetingIcon, setGreetingIcon] = useState("👋");
  const [currentTime, setCurrentTime] = useState<string>("");
  const [currentDate, setCurrentDate] = useState<string>("");
  
  // Dialog state
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting("Good Morning");
      setGreetingIcon("🌅");
    } else if (hour < 18) {
      setGreeting("Good Afternoon");
      setGreetingIcon("☀️");
    } else {
      setGreeting("Good Evening");
      setGreetingIcon("🌇");
    }

    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setCurrentDate(now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }));
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  const { user, dbUser, masterKey } = useAuth();
  const [vaultItems, setVaultItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch Vault Items
  const fetchItems = async () => {
    if (!masterKey || !auth.currentUser) return;
    
    try {
      const token = await auth.currentUser.getIdToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const response = await axios.get(`${apiUrl}/vault`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const encryptedItems = response.data.items;
      
      // Decrypt all items
      const decryptedItems = await Promise.all(
        encryptedItems.map(async (item: any) => {
          try {
            const decryptedData = await decryptVaultItem(item.encryptedData, item.iv, masterKey);
            return {
              id: item._id,
              title: item.title,
              category: item.category,
              icon: item.title.charAt(0).toUpperCase(),
              ...decryptedData
            };
          } catch (err) {
            console.error("Failed to decrypt item:", item._id, err);
            return {
              id: item._id,
              title: item.title,
              category: item.category,
              icon: '?',
              username: "Encryption Error",
              password: "",
              url: "",
              notes: ""
            };
          }
        })
      );
      
      setVaultItems(decryptedItems);
    } catch (error) {
      console.error("Error fetching vault items:", error);
      toast.error("Failed to load vault items.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [masterKey]);

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
                  {greeting}, {dbUser?.fullName?.split(' ')[0] || user?.displayName?.split(' ')[0] || 'Member'}!
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

      {/* Security Score Card - Light Glass Highlight Container (Inspired by Reference UI Statistics panel) */}
      <div className="glass-card-light p-6 md:p-8 rounded-3xl relative overflow-hidden transition-all duration-300 hover:shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-400/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-slate-900 text-white border-[3px] border-emerald-400 shadow-xl">
              <span className="text-2xl font-black text-emerald-400">92</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-700 uppercase tracking-wider">Optimal</span>
                <h3 className="font-extrabold text-xl text-slate-900 tracking-tight">Vault Health</h3>
              </div>
              <p className="text-sm text-slate-600 font-medium mt-1">Excellent overall security score across all credentials.</p>
            </div>
          </div>
          <div className="flex gap-4 border-t md:border-t-0 md:border-l border-slate-300/60 pt-4 md:pt-0 md:pl-8 w-full md:w-auto">
            <div className="flex flex-col gap-1 min-w-[90px] bg-white/60 p-3 rounded-2xl border border-white/80 shadow-sm">
              <span className="text-xs text-slate-500 font-semibold flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5 text-amber-500"/> Weak</span>
              <span className="font-extrabold text-xl text-slate-900">0</span>
            </div>
            <div className="flex flex-col gap-1 min-w-[90px] bg-white/60 p-3 rounded-2xl border border-white/80 shadow-sm">
              <span className="text-xs text-slate-500 font-semibold flex items-center gap-1"><ShieldAlert className="w-3.5 h-3.5 text-rose-500"/> Reused</span>
              <span className="font-extrabold text-xl text-slate-900">2</span>
            </div>
          </div>
        </div>
      </div>

      {/* Vault Section */}
      <section className="space-y-4 pt-2">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">Recent Passwords</h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Quick access to your encrypted vault items</p>
          </div>
          <Link href="/dashboard" className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors">
            View All &rsaquo;
          </Link>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden relative">
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
          <Input placeholder="Search your vault..." className="pl-11" />
        </div>

        {/* Password List */}
        <div className="grid gap-3.5">
          {isLoading ? (
            <div className="text-center p-12 glass-card rounded-3xl text-slate-400 animate-pulse font-medium">
              Decrypting vault items with Master Key...
            </div>
          ) : vaultItems.length === 0 ? (
            <div className="text-center p-10 glass-card rounded-3xl border border-dashed border-white/20">
              <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4 text-cyan-400">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-white">Your vault is empty</h3>
              <p className="text-sm text-slate-400 mb-6 mt-1 max-w-sm mx-auto">Start building your secure encrypted vault by adding your first credential.</p>
              <Link href="/dashboard/add" className={cn(buttonVariants({ variant: "default" }), "rounded-full shadow-lg shadow-sky-500/25 px-6")}>
                <Plus className="w-4 h-4 mr-2" /> Add Item
              </Link>
            </div>
          ) : (
            vaultItems.map((item) => (
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
        onItemUpdated={fetchItems}
        onItemDeleted={fetchItems}
      />
    </div>
  );
}
