"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Plus, Search, MoreVertical, Key, AlertTriangle, ShieldAlert } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { PasswordDetailsDialog } from "@/components/PasswordDetailsDialog";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";
import { decryptVaultItem } from "@/lib/crypto";
import axios from "axios";
import { toast } from "sonner";

export default function DashboardPage() {
  const [greeting, setGreeting] = useState("Good Day");
  const [greetingIcon, setGreetingIcon] = useState("👋");
  
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
  }, []);

  const { masterKey } = useAuth();
  const [vaultItems, setVaultItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch Vault Items
  useEffect(() => {
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

    fetchItems();
  }, [masterKey]);

  return (
    <div className="flex-1 p-4 md:p-8 space-y-8 max-w-5xl mx-auto">
      
      {/* Header Section */}
      <section className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          {greetingIcon} {greeting}
        </h1>
        <p className="text-muted-foreground flex items-center gap-1.5 text-sm md:text-base">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          Your digital life is protected.
        </p>
      </section>

      {/* Security Score Card */}
      <Card className="bg-gradient-to-br from-primary/10 via-background to-background border-primary/20 shadow-sm">
        <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-background border-[3px] border-emerald-500">
              <span className="text-xl font-bold text-emerald-500">92</span>
            </div>
            <div>
              <h3 className="font-semibold text-lg tracking-tight">Vault Health</h3>
              <p className="text-sm text-muted-foreground">Excellent! Your passwords are secure.</p>
            </div>
          </div>
          <div className="flex gap-4 md:border-l md:border-border md:pl-6 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            <div className="flex flex-col gap-1 min-w-[80px]">
              <span className="text-xs text-muted-foreground flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-amber-500"/> Weak</span>
              <span className="font-semibold text-lg">0</span>
            </div>
            <div className="flex flex-col gap-1 min-w-[80px]">
              <span className="text-xs text-muted-foreground flex items-center gap-1"><ShieldAlert className="w-3 h-3 text-destructive"/> Reused</span>
              <span className="font-semibold text-lg">2</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vault Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between mt-8 mb-2">
          <h2 className="text-xl md:text-2xl font-semibold tracking-tight">Recent Passwords</h2>
          <Link href="/dashboard/add" className={cn(buttonVariants({}), "hidden md:flex gap-2")}>
            <Plus className="w-5 h-5" /> Add Item
          </Link>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search your vault..." className="pl-9 bg-card" />
        </div>

        {/* Password List */}
        <div className="grid gap-3">
          {isLoading ? (
            <div className="text-center p-8 text-muted-foreground animate-pulse">
              Decrypting vault...
            </div>
          ) : vaultItems.length === 0 ? (
            <div className="text-center p-8 border border-dashed border-border rounded-xl">
              <ShieldCheck className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-50" />
              <h3 className="text-lg font-medium text-foreground">Your vault is empty</h3>
              <p className="text-sm text-muted-foreground mb-4 mt-1">Add your first password to securely store it.</p>
              <Link href="/dashboard/add" className={cn(buttonVariants({ variant: "outline" }))}>
                <Plus className="w-4 h-4 mr-2" /> Add Item
              </Link>
            </div>
          ) : (
            vaultItems.map((item) => (
              <Card 
                key={item.id} 
                className="group hover:border-primary/50 transition-colors cursor-pointer bg-card shadow-sm hover:shadow-md"
                onClick={() => {
                  setSelectedItem(item);
                  setIsDialogOpen(true);
                }}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg border border-primary/20">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground leading-none">{item.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1.5 truncate max-w-[180px] md:max-w-xs">{item.username}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="hidden md:inline-flex text-xs font-medium px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
                      {item.category}
                    </span>
                    <Button variant="ghost" size="icon" className="text-muted-foreground group-hover:text-foreground">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </section>
      
      {/* Mobile FAB */}
      <div className="md:hidden fixed bottom-20 right-4 z-40">
        <Link href="/dashboard/add" className={cn(buttonVariants({ size: "icon" }), "w-14 h-14 rounded-full shadow-lg flex items-center justify-center")}>
          <Plus className="w-6 h-6" />
        </Link>
      </div>

      <PasswordDetailsDialog 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)} 
        item={selectedItem} 
      />
    </div>
  );
}
