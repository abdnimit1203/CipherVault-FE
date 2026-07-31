"use client";

interface VaultItemSkeletonProps {
  count?: number;
}

export function VaultItemSkeleton({ count = 3 }: VaultItemSkeletonProps) {
  return (
    <div className="grid gap-3.5" data-testid="vault-item-skeleton">
      {Array.from({ length: count }).map((_, i) => (
        <div 
          key={i} 
          className="glass-card p-4 rounded-3xl flex items-center justify-between animate-pulse border border-white/10 bg-white/[0.03]"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 shrink-0" />
            <div className="space-y-2">
              <div className="h-4 w-32 md:w-44 bg-white/15 rounded-md" />
              <div className="h-3 w-24 md:w-32 bg-white/10 rounded-md" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:block h-6 w-20 bg-white/10 rounded-full" />
            <div className="w-8 h-8 rounded-full bg-white/10" />
          </div>
        </div>
      ))}
    </div>
  );
}
