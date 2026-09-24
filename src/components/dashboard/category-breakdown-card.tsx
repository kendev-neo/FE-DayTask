"use client";

import { motion } from "framer-motion";
import { Tag, FolderOpen } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import type { CategoryItemStats } from "@/types";

interface CategoryBreakdownCardProps {
  categoryBreakdown: CategoryItemStats[];
  delay?: number;
}

export function CategoryBreakdownCard({
  categoryBreakdown,
  delay = 0.25,
}: CategoryBreakdownCardProps) {
  const { t } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-2xl border border-border/60 bg-card/60 p-5 sm:p-6 backdrop-blur-xl shadow-xs flex flex-col justify-between"
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between gap-2 pb-4 border-b border-border/50">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary">
              <Tag className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold tracking-tight text-foreground">
                {t.dashboard.breakdown.categoryTitle}
              </h3>
              <p className="text-xs text-muted-foreground">
                {t.dashboard.breakdown.categorySubtitle}
              </p>
            </div>
          </div>
          <span className="text-xs font-mono text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md border border-border/50">
            {categoryBreakdown.length}
          </span>
        </div>

        {/* Categories list */}
        <div className="mt-5 space-y-3.5 max-h-[260px] overflow-y-auto pr-1 scrollbar-none">
          {categoryBreakdown.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
              <FolderOpen className="h-8 w-8 mb-2 opacity-40" />
              <p className="text-xs">{t.dashboard.breakdown.noCategories}</p>
            </div>
          ) : (
            categoryBreakdown.map((cat, idx) => {
              const rate =
                cat.total > 0 ? Math.round((cat.completed / cat.total) * 100) : 0;

              return (
                <div key={cat.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="h-2.5 w-2.5 rounded-full shrink-0 shadow-xs ring-1 ring-border/50"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="font-medium text-foreground truncate">
                        {cat.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 font-mono shrink-0 ml-2">
                      <span className="text-muted-foreground text-[11px]">
                        {cat.completed}/{cat.total}
                      </span>
                      <span className="font-semibold text-foreground text-xs w-9 text-right">
                        {rate}%
                      </span>
                    </div>
                  </div>

                  {/* Animated Progress Bar with Category Custom Color */}
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted/60 border border-border/40 p-[1px]">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${rate}%` }}
                      transition={{
                        duration: 0.8,
                        delay: delay + idx * 0.05,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="mt-5 pt-3 border-t border-border/40 text-[11px] text-muted-foreground flex items-center justify-between">
        <span>{t.dashboard.breakdown.categoryInsight}</span>
      </div>
    </motion.div>
  );
}
