"use client";

import { motion } from "framer-motion";
import { AlertTriangle, AlertCircle, ArrowDownCircle, Layers } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import type { PriorityBreakdown } from "@/types";
import { cn } from "@/lib/utils";

interface PriorityBreakdownCardProps {
  priorityBreakdown: PriorityBreakdown;
  delay?: number;
}

export function PriorityBreakdownCard({
  priorityBreakdown,
  delay = 0.2,
}: PriorityBreakdownCardProps) {
  const { t } = useLanguage();

  const items = [
    {
      key: "high" as const,
      label: t.dashboard.breakdown.highPriority,
      stats: priorityBreakdown.high,
      icon: AlertTriangle,
      color: "text-rose-500 dark:text-rose-400",
      bg: "bg-rose-500/10 border-rose-500/20",
      barBg: "bg-rose-500 dark:bg-rose-500",
    },
    {
      key: "medium" as const,
      label: t.dashboard.breakdown.mediumPriority,
      stats: priorityBreakdown.medium,
      icon: AlertCircle,
      color: "text-amber-500 dark:text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/20",
      barBg: "bg-amber-500 dark:bg-amber-500",
    },
    {
      key: "low" as const,
      label: t.dashboard.breakdown.lowPriority,
      stats: priorityBreakdown.low,
      icon: ArrowDownCircle,
      color: "text-sky-500 dark:text-sky-400",
      bg: "bg-sky-500/10 border-sky-500/20",
      barBg: "bg-sky-500 dark:bg-sky-500",
    },
  ];

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
              <Layers className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold tracking-tight text-foreground">
                {t.dashboard.breakdown.priorityTitle}
              </h3>
              <p className="text-xs text-muted-foreground">
                {t.dashboard.breakdown.prioritySubtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Priority items list */}
        <div className="mt-5 space-y-4">
          {items.map((item) => {
            const { total, completed } = item.stats;
            const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
            const Icon = item.icon;

            return (
              <div key={item.key} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-md border",
                        item.bg,
                        item.color
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <span className="font-medium text-foreground">
                      {item.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-muted-foreground text-[11px]">
                      {completed}/{total}
                    </span>
                    <span className="font-semibold text-foreground text-xs w-9 text-right">
                      {rate}%
                    </span>
                  </div>
                </div>

                {/* Animated Progress Bar */}
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted/60 border border-border/40 p-[1px]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${rate}%` }}
                    transition={{
                      duration: 0.8,
                      delay: delay + 0.1,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className={cn("h-full rounded-full", item.barBg)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-5 pt-3 border-t border-border/40 text-[11px] text-muted-foreground flex items-center justify-between">
        <span>{t.dashboard.breakdown.priorityInsight}</span>
      </div>
    </motion.div>
  );
}
