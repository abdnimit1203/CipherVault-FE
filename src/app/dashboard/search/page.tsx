"use client";

import { useEffect, useState } from "react";
import { Search, ShieldCheck, Filter, KeyRound, Globe, User, Tag, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useVault } from "@/context/VaultContext";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { VaultItemSkeleton } from "@/components/ui/VaultItemSkeleton";

const PasswordDetailsDialog = dynamic(
  () => import("@/components/PasswordDetailsDialog").then(mod => mod.PasswordDetailsDialog),
  { ssr: false }
);

export default function SearchPage() {
  const { vaultItems, isLoading, refetchVaultItems } = useVault();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Dialog State
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Filter items dynamically
  const filteredItems = vaultItems.filter((item) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !query ||
      item.title?.toLowerCase().includes(query) ||
      item.username?.toLowerCase().includes(query) ||
      item.category?.toLowerCase().includes(query) ||
      item.owner?.toLowerCase().includes(query) ||
      item.url?.toLowerCase().includes(query);

    const matchesCategory =
      selectedCategory === "All" ||
      item.category?.toLowerCase() === selectedCategory.toLowerCase() ||
      item.owner?.toLowerCase() === selectedCategory.toLowerCase();

    return matchesQuery && matchesCategory;
  });

  const categories = ["All", "General", "Personal", "Family", "Work", "Social"];

  return (
    <div className="flex-1 p-4 md:p-8 space-y-6 max-w-5xl mx-auto">
      <section className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
          <Search className="w-7 h-7 text-cyan-400" />
          <span>Vault Search</span>
        </h1>
        <p className="text-slate-400 text-sm md:text-base">
          Instant real-time search across your decrypted vault credentials.
        </p>
      </section>

      {/* Search Input Bar */}
      <div className="relative w-full">
        <Search className="absolute left-4 top-4 h-5 w-5 text-cyan-400" />
        <Input
          type="text"
          placeholder="Search by title, username, category, owner, or URL..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 pr-4 h-14 bg-white/5 border-white/15 text-white placeholder:text-slate-500 rounded-2xl text-base focus-visible:ring-cyan-400/50 shadow-2xl"
          autoFocus
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-4 top-4 text-xs font-bold text-slate-400 hover:text-white bg-white/10 px-2 py-1 rounded-lg"
          >
            Clear
          </button>
        )}
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 shrink-0 mr-1">
          <Filter className="w-3.5 h-3.5" /> Filter:
        </span>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 shrink-0 ${
              selectedCategory === cat
                ? "bg-gradient-to-r from-sky-500 to-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                : "bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Results List */}
      <div className="space-y-3 pt-2">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Results ({filteredItems.length})
        </p>

        {isLoading ? (
          <VaultItemSkeleton count={3} />
        ) : filteredItems.length === 0 ? (
          <div className="text-center p-10 glass-card rounded-3xl border border-dashed border-white/15">
            <Search className="w-8 h-8 text-slate-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">No matching vault items found</h3>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your search query or category filter.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {filteredItems.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: idx * 0.04 }}
                onClick={() => {
                  setSelectedItem(item);
                  setIsDialogOpen(true);
                }}
                className="glass-card p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/10 transition-all duration-200 cursor-pointer border border-white/10 group shadow-lg"
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-sky-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-300 font-extrabold text-base shrink-0 group-hover:scale-105 transition-transform shadow-inner">
                    {item.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-white text-base truncate group-hover:text-cyan-300 transition-colors max-w-[180px] sm:max-w-none">
                        {item.title}
                      </h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shrink-0">
                        {item.owner}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 truncate flex items-center gap-1.5 mt-0.5 font-medium">
                      <span className="truncate">{item.username || "No username"}</span>
                      {item.url && (
                        <span className="text-slate-500 truncate hidden sm:inline">
                          • {item.url.replace(/^https?:\/\//, '')}
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="w-full sm:w-auto flex justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-white/10">
                  <button className="w-full sm:w-auto px-4 py-2 sm:py-1.5 rounded-xl bg-cyan-500/10 group-hover:bg-cyan-500/20 text-cyan-300 text-xs font-bold text-center transition-all border border-cyan-500/25">
                    View Details &rsaquo;
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Password Details Modal */}
      {selectedItem && (
        <PasswordDetailsDialog
          item={selectedItem}
          isOpen={isDialogOpen}
          onClose={() => {
            setIsDialogOpen(false);
            setSelectedItem(null);
          }}
          onItemDeleted={() => {
            refetchVaultItems();
            setSelectedItem(null);
            setIsDialogOpen(false);
          }}
          onItemUpdated={() => {
            refetchVaultItems();
            setIsDialogOpen(false);
          }}
        />
      )}
    </div>
  );
}
