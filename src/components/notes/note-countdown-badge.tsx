"use client";

import { useMemo } from "react";
import { Clock, AlertTriangle, AlertCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/use-language";

interface NoteCountdownBadgeProps {
  expiresAt: string | Date;
  className?: string;
  showIcon?: boolean;
}

export function NoteCountdownBadge({
  expiresAt,
  className,
  showIcon = true,
}: NoteCountdownBadgeProps) {
  const { language, t } = useLanguage();

  const countdown = useMemo(() => {
    const target = new Date(expiresAt).getTime();
    const now = new Date().getTime();
    const diffMs = target - now;

    if (diffMs <= 0) {
      return {
        label: language === "vi" ? "Đã hết hạn" : "Expired",
        detail: language === "vi" ? "Sẽ được tự động dọn dẹp" : "Scheduled for cleanup",
        status: "expired" as const,
        variantClass:
          "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",
        icon: AlertCircle,
      };
    }

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.min(7, Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24))));

    if (diffHours < 24) {
      const label =
        language === "vi"
          ? diffHours > 0
            ? `Còn ${diffHours}h (hết hạn 23:00)`
            : "Hết hạn tối nay 23:00"
          : diffHours > 0
          ? `${diffHours}h left (expires 23:00)`
          : "Expires tonight at 23:00";

      return {
        label,
        detail: language === "vi" ? "Hết hạn trong vòng 24 giờ" : "Expires in less than 24 hours",
        status: "critical" as const,
        variantClass:
          "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30 animate-pulse",
        icon: AlertTriangle,
      };
    }

    const dayUnit =
      language === "vi"
        ? "ngày"
        : diffDays === 1
        ? t.notes.dayLeft
        : t.notes.daysLeft;

    const label =
      language === "vi"
        ? `Còn ${diffDays} ${dayUnit}`
        : `${diffDays} ${dayUnit}`;

    if (diffDays <= 2) {
      return {
        label,
        detail:
          language === "vi"
            ? `Hết hạn lúc 23:00 sau ${diffDays} ngày`
            : `Expires at 23:00 in ${diffDays} days`,
        status: "warning" as const,
        variantClass:
          "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
        icon: Clock,
      };
    }

    return {
      label,
      detail:
        language === "vi"
          ? "Lưu trữ tạm 7 ngày (xóa lúc 23:00)"
          : "7-day ephemeral storage (expires 23:00)",
      status: "good" as const,
      variantClass:
        "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
      icon: Sparkles,
    };
  }, [expiresAt, language, t.notes.dayLeft, t.notes.daysLeft]);

  const Icon = countdown.icon;

  return (
    <span
      title={countdown.detail}
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors",
        countdown.variantClass,
        className
      )}
    >
      {showIcon && <Icon className="w-3.5 h-3.5 shrink-0" />}
      <span>{countdown.label}</span>
    </span>
  );
}
