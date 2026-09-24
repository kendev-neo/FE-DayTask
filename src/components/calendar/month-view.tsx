"use client";

import { motion } from "framer-motion";
import { useUiStore } from "@/stores/ui-store";
import { useCategories } from "@/hooks/use-categories";
import { useLanguage } from "@/hooks/use-language";
import { TaskCard } from "@/components/tasks/task-card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getMonthDays,
  isSameDay,
  isSameMonth,
  isToday,
  format,
} from "@/lib/date-utils";
import { Plus } from "lucide-react";
import type { Task } from "@/types";

interface MonthViewProps {
  tasks: Task[];
  isLoading: boolean;
}

export function MonthView({ tasks, isLoading }: MonthViewProps) {
  const selectedDate = useUiStore((s) => s.selectedDate);
  const setSelectedDate = useUiStore((s) => s.setSelectedDate);
  const setActiveView = useUiStore((s) => s.setActiveView);
  const openTaskDialog = useUiStore((s) => s.openTaskDialog);
  const { data: categories } = useCategories();
  const { t } = useLanguage();
  const days = getMonthDays(selectedDate);
  const weekdayLabels = t.calendar.weekdays;

  const getTasksForDay = (day: Date) =>
    tasks.filter((t) => {
      const start = new Date(t.startTime);
      return isSameDay(start, day);
    });

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
    setActiveView("day");
  };

  const handleQuickAdd = (e: React.MouseEvent, day: Date) => {
    e.stopPropagation();
    setSelectedDate(day);
    openTaskDialog();
  };

  return (
    <motion.div
      key={format(selectedDate, "yyyy-MM")}
      initial={{ opacity: 0, scale: 0.99 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col h-full overflow-y-auto sm:overflow-hidden"
    >
      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1.5 sm:mb-2 px-0.5 sm:px-1 shrink-0">
        {weekdayLabels.map((d) => (
          <div
            key={d.short}
            className="py-1 sm:py-1.5 text-center text-[10px] sm:text-xs font-semibold uppercase text-muted-foreground/80 tracking-wider"
          >
            <span className="sm:hidden">{d.short}</span>
            <span className="hidden sm:inline">{d.full}</span>
          </div>
        ))}
      </div>

      {/* Day cells grid */}
      <div className="grid grid-cols-7 flex-1 auto-rows-[minmax(70px,1fr)] sm:auto-rows-[minmax(110px,1fr)] gap-1 sm:gap-2 bg-transparent pb-2 sm:pb-4">
        {days.map((day) => {
          const dayTasks = getTasksForDay(day);
          const inMonth = isSameMonth(day, selectedDate);
          const today = isToday(day);
          const inProgressCount = dayTasks.filter((t) => t.status === "in_progress").length;

          return (
            <div
              key={day.toISOString()}
              onClick={() => handleDayClick(day)}
              className={`group relative flex flex-col justify-between rounded-xl sm:rounded-2xl border p-1.5 sm:p-2.5 cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary/50 select-none min-h-0 ${
                today
                  ? "bg-primary/[0.04] border-primary/40 shadow-xs"
                  : inMonth
                  ? "bg-card/70 border-border/70 hover:bg-card/95 backdrop-blur-xs"
                  : "bg-muted/15 border-border/40 opacity-40 hover:opacity-80"
              }`}
            >
              {/* Day header: number, count, quick add button on hover */}
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`inline-flex h-5.5 w-5.5 sm:h-7 sm:w-7 items-center justify-center rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-transform group-hover:scale-105 ${
                    today
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-foreground group-hover:text-primary font-semibold"
                  }`}
                >
                  {format(day, "d")}
                </span>

                <div className="flex items-center gap-0.5 sm:gap-1">
                  {/* Quick Add Button on Hover (Desktop) */}
                  <button
                    onClick={(e) => handleQuickAdd(e, day)}
                    className="hidden sm:flex opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-primary/10 hover:text-primary text-muted-foreground"
                    title="Add task for this day"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>

                  {dayTasks.length > 0 && (
                    <span className="inline-flex items-center gap-0.5 sm:gap-1 text-[9px] sm:text-[10px] font-mono font-medium text-muted-foreground bg-muted/70 px-1 sm:px-1.5 py-0.5 rounded-md">
                      {inProgressCount > 0 && (
                        <span className="h-1 sm:h-1.5 w-1 sm:w-1.5 rounded-full bg-amber-400 animate-pulse" title="In progress" />
                      )}
                      {dayTasks.length}
                    </span>
                  )}
                </div>
              </div>

              {/* Tasks List for the day cell */}
              <div className="flex-1 space-y-1 sm:space-y-1.5 overflow-hidden">
                {isLoading ? (
                  <Skeleton className="h-3 sm:h-4 w-full rounded-md" />
                ) : (
                  <>
                    <div className="hidden sm:block space-y-1.5">
                      {dayTasks.slice(0, 3).map((task) => (
                        <TaskCard key={task.id} task={task} variant="compact" />
                      ))}
                      {dayTasks.length > 3 && (
                        <p className="text-[10px] font-semibold text-primary/90 pl-1 pt-0.5 hover:underline">
                          +{dayTasks.length - 3} more tasks...
                        </p>
                      )}
                    </div>
                    {/* Mobile compact indicators */}
                    <div className="sm:hidden flex flex-wrap gap-0.5 pt-0.5">
                      {dayTasks.slice(0, 4).map((task) => {
                        const cat = categories?.find((c) => c.id === task.categoryId);
                        const dotColor = task.status === "done"
                          ? "#10b981"
                          : cat?.color || (task.status === "in_progress" ? "#f59e0b" : "#6366f1");
                        return (
                          <span
                            key={task.id}
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ backgroundColor: dotColor }}
                          />
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
