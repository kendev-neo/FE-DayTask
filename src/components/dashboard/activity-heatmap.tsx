"use client";

import { useMemo, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Trophy, CalendarDays, Sparkles } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { cn } from "@/lib/utils";

interface ActivityHeatmapProps {
  activityMap: Record<string, number>;
  currentStreak: number;
  longestStreak: number;
  totalCompletedYear: number;
}

interface DayCell {
  date: Date;
  dateKey: string;
  count: number;
  level: number;
  monthIndex: number;
  isToday: boolean;
  dayOfWeek: number; // 0 (Mon) to 6 (Sun)
}

export function ActivityHeatmap({
  activityMap,
  currentStreak,
  longestStreak,
  totalCompletedYear,
}: ActivityHeatmapProps) {
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [hoveredCell, setHoveredCell] = useState<{
    dateKey: string;
    count: number;
    formattedDate: string;
    x: number;
    y: number;
  } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Generate 52/53 weeks of data (Monday-first grid matching ISO week)
  const { weeks, monthLabels } = useMemo(() => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    // End on upcoming Sunday or today
    const endDate = new Date(today);

    // Start ~52 weeks ago, aligned to Monday
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 364);

    // Align startDate to previous Monday
    const startDay = startDate.getDay();
    const distanceToMonday = (startDay + 6) % 7;
    startDate.setDate(startDate.getDate() - distanceToMonday);

    const generatedWeeks: DayCell[][] = [];
    const months: { label: string; colIndex: number }[] = [];
    let currentWeek: DayCell[] = [];
    let lastMonth = -1;

    const cursor = new Date(startDate);

    while (cursor <= endDate || currentWeek.length > 0) {
      const dayOfWeek = (cursor.getDay() + 6) % 7; // 0 = Mon, 6 = Sun
      const year = cursor.getFullYear();
      const month = cursor.getMonth();
      const dateNum = cursor.getDate();
      const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(dateNum).padStart(2, "0")}`;

      const count = activityMap[dateKey] || 0;
      let level = 0;
      if (count === 1) level = 1;
      else if (count === 2) level = 2;
      else if (count >= 3 && count <= 4) level = 3;
      else if (count >= 5) level = 4;

      const isToday =
        cursor.getDate() === today.getDate() &&
        cursor.getMonth() === today.getMonth() &&
        cursor.getFullYear() === today.getFullYear();

      const cell: DayCell = {
        date: new Date(cursor),
        dateKey,
        count,
        level,
        monthIndex: month,
        isToday,
        dayOfWeek,
      };

      currentWeek.push(cell);

      // Track month transitions
      if (month !== lastMonth && dayOfWeek === 0 && cursor <= endDate) {
        months.push({
          label: t.dashboard.heatmap.months[month] || `M${month + 1}`,
          colIndex: generatedWeeks.length,
        });
        lastMonth = month;
      }

      if (dayOfWeek === 6 || cursor > endDate) {
        generatedWeeks.push(currentWeek);
        currentWeek = [];
      }

      cursor.setDate(cursor.getDate() + 1);
      if (cursor > endDate && dayOfWeek === 6) break;
    }

    return { weeks: generatedWeeks, monthLabels: months };
  }, [activityMap, t]);

  // Color intensities matching primary theme (emerald/indigo/primary accents)
  const getCellClass = (level: number, isToday: boolean) => {
    const base = "transition-colors duration-150 rounded-[3px]";
    const ring = isToday ? "ring-1.5 ring-primary ring-offset-1 ring-offset-background" : "";
    switch (level) {
      case 0:
        return cn(base, "bg-muted/40 dark:bg-muted/30 border border-border/40 hover:border-primary/40", ring);
      case 1:
        return cn(base, "bg-primary/30 dark:bg-primary/25 border border-primary/40 hover:bg-primary/40", ring);
      case 2:
        return cn(base, "bg-primary/55 dark:bg-primary/50 border border-primary/60 hover:bg-primary/65", ring);
      case 3:
        return cn(base, "bg-primary/80 dark:bg-primary/75 border border-primary/85 hover:bg-primary/90", ring);
      case 4:
        return cn(base, "bg-primary dark:bg-primary text-primary-foreground shadow-xs hover:brightness-110", ring);
      default:
        return cn(base, "bg-muted/40", ring);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-2xl border border-border/60 bg-card/60 p-5 sm:p-6 backdrop-blur-xl shadow-xs"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/50">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary">
            <CalendarDays className="h-4.5 w-4.5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-2">
              {t.dashboard.heatmap.title}
              <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
            </h3>
            <p className="text-xs text-muted-foreground">
              {t.dashboard.heatmap.subtitle}
            </p>
          </div>
        </div>

        {/* Streaks and Summary Badges */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Current Streak */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold font-mono">
            <Flame className="h-3.5 w-3.5 fill-amber-500/40 text-amber-500" />
            <span>
              {currentStreak} {t.dashboard.heatmap.daysStreak}
            </span>
          </div>

          {/* Longest Streak */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-semibold font-mono">
            <Trophy className="h-3.5 w-3.5 text-primary" />
            <span>
              {t.dashboard.heatmap.longestStreak}: {longestStreak} {t.dashboard.heatmap.daysStreak}
            </span>
          </div>

          {/* Total Year Completed */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted/60 border border-border text-foreground text-xs font-medium font-mono">
            <span>
              {totalCompletedYear} {t.dashboard.heatmap.totalThisYear}
            </span>
          </div>
        </div>
      </div>

      {/* Heatmap Grid Area */}
      <div className="relative mt-5 overflow-x-auto pb-2 scrollbar-none">
        <div className="inline-block min-w-[720px] max-w-full">
          {/* Month labels header */}
          <div className="flex text-[10px] text-muted-foreground font-mono mb-1.5 pl-7 relative h-4">
            {monthLabels.map((m, idx) => (
              <span
                key={idx}
                className="absolute transform"
                style={{ left: `${m.colIndex * 13 + 28}px` }}
              >
                {m.label}
              </span>
            ))}
          </div>

          {/* Grid with Weekdays on left */}
          <div className="flex gap-1.5">
            {/* Weekday indicators (Mon, Wed, Fri) */}
            <div className="flex flex-col justify-between text-[9px] text-muted-foreground/70 font-mono pr-1 select-none h-[92px] py-[2px]">
              <span>{t.dashboard.heatmap.days.mon}</span>
              <span>{t.dashboard.heatmap.days.wed}</span>
              <span>{t.dashboard.heatmap.days.fri}</span>
            </div>

            {/* Matrix of Columns (Weeks) */}
            <div className="flex gap-[3px] flex-1">
              {weeks.map((week, weekIdx) => (
                <div key={weekIdx} className="flex flex-col gap-[3px]">
                  {week.map((day) => (
                    <motion.div
                      key={day.dateKey}
                      whileHover={{ scale: 1.3, zIndex: 10 }}
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setHoveredCell({
                          dateKey: day.dateKey,
                          count: day.count,
                          formattedDate: day.date.toLocaleDateString(
                            undefined,
                            {
                              weekday: "short",
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          ),
                          x: rect.left + rect.width / 2,
                          y: rect.top - 8,
                        });
                      }}
                      onMouseLeave={() => setHoveredCell(null)}
                      className={cn(
                        "h-[10px] w-[10px] sm:h-[11px] sm:w-[11px] cursor-pointer",
                        getCellClass(day.level, day.isToday)
                      )}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Tooltip via Portal to avoid transformed ancestor containing block & z-index issues */}
      {mounted &&
        typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {hoveredCell && (
              <motion.div
                initial={{ opacity: 0, y: 4, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                style={{
                  position: "fixed",
                  left: hoveredCell.x,
                  top: hoveredCell.y,
                  transform: "translate(-50%, -100%)",
                }}
                className="pointer-events-none z-[9999] rounded-lg border border-border bg-popover/95 px-2.5 py-1.5 text-xs shadow-xl backdrop-blur-md"
              >
                <p className="font-semibold text-foreground font-mono">
                  {hoveredCell.count === 0
                    ? t.dashboard.heatmap.noTasks
                    : `${hoveredCell.count} ${
                        hoveredCell.count === 1
                          ? t.dashboard.heatmap.oneTask
                          : t.dashboard.heatmap.tasksCompleted
                      }`}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {hoveredCell.formattedDate}
                </p>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}

      {/* Footer Legend */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/40 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5 text-[11px]">
          <span className="font-mono text-foreground font-medium">
            {totalCompletedYear}
          </span>{" "}
          {t.dashboard.heatmap.tasksCompletedPastYear}
        </div>

        <div className="flex items-center gap-1.5 text-[10px] font-mono">
          <span>{t.dashboard.heatmap.less}</span>
          <div className="flex gap-[3px]">
            <div className="h-2.5 w-2.5 rounded-[2px] bg-muted/40 border border-border/40" />
            <div className="h-2.5 w-2.5 rounded-[2px] bg-primary/30 border border-primary/40" />
            <div className="h-2.5 w-2.5 rounded-[2px] bg-primary/55 border border-primary/60" />
            <div className="h-2.5 w-2.5 rounded-[2px] bg-primary/80 border border-primary/85" />
            <div className="h-2.5 w-2.5 rounded-[2px] bg-primary shadow-xs" />
          </div>
          <span>{t.dashboard.heatmap.more}</span>
        </div>
      </div>
    </motion.div>
  );
}
