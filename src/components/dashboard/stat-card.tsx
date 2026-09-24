"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  badge?: {
    text: string;
    variant?: "success" | "warning" | "info" | "default";
  };
  suffix?: string;
  delay?: number;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = "text-primary",
  iconBg = "bg-primary/10 border-primary/20",
  badge,
  suffix,
  delay = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/60 p-5 backdrop-blur-xl shadow-xs transition-shadow hover:shadow-md hover:border-border"
    >
      {/* Subtle background glow effect on hover */}
      <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-primary/5 blur-2xl transition-all group-hover:bg-primary/10 group-hover:scale-125" />

      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {title}
        </span>
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-xl border transition-transform duration-300 group-hover:scale-110",
            iconBg,
            iconColor
          )}
        >
          <Icon className="h-4.5 w-4.5" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-1.5">
        <motion.span
          key={String(value)}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-mono"
        >
          {value}
        </motion.span>
        {suffix && (
          <span className="text-sm font-semibold text-muted-foreground">
            {suffix}
          </span>
        )}
      </div>

      {(subtitle || badge) && (
        <div className="mt-2 flex items-center justify-between gap-2 text-xs">
          {subtitle && (
            <span className="text-muted-foreground truncate">{subtitle}</span>
          )}
          {badge && (
            <span
              className={cn(
                "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium font-mono shrink-0",
                badge.variant === "success" &&
                  "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
                badge.variant === "warning" &&
                  "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
                badge.variant === "info" &&
                  "bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20",
                (!badge.variant || badge.variant === "default") &&
                  "bg-primary/10 text-primary border border-primary/20"
              )}
            >
              {badge.text}
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
}
