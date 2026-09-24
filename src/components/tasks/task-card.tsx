"use client";

import { useMemo } from "react";
import { useUiStore } from "@/stores/ui-store";
import { useUpdateTaskStatus } from "@/hooks/use-tasks";
import { useCategories } from "@/hooks/use-categories";
import { formatTimeRange, formatDuration, formatTime } from "@/lib/date-utils";
import { format, parseISO } from "date-fns";
import {
  Check,
  Circle,
  Clock,
  Flame,
  Flag,
  CheckCircle2,
  GripVertical,
  History,
} from "lucide-react";
import { toast } from "sonner";
import type { Task, TaskPriority } from "@/types";

export interface TaskCardProps {
  task: Task;
  variant?: "compact" | "timed" | "default";
  dragHandleProps?: Record<string, any>;
  isDragging?: boolean;
}

const priorityConfig: Record<
  TaskPriority,
  {
    label: string;
    textColor: string;
    bgColor: string;
    borderColor: string;
    dotColor: string;
    icon: typeof Flag;
  }
> = {
  high: {
    label: "High",
    textColor: "text-rose-600 dark:text-rose-400",
    bgColor: "bg-rose-500/10 dark:bg-rose-500/20",
    borderColor: "border-rose-500/30",
    dotColor: "bg-rose-500",
    icon: Flame,
  },
  medium: {
    label: "Med",
    textColor: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-500/10 dark:bg-amber-500/20",
    borderColor: "border-amber-500/30",
    dotColor: "bg-amber-500",
    icon: Flag,
  },
  low: {
    label: "Low",
    textColor: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-500/10 dark:bg-blue-500/20",
    borderColor: "border-blue-500/30",
    dotColor: "bg-blue-500",
    icon: Flag,
  },
};

const nextStatusMap: Record<Task["status"], Task["status"]> = {
  todo: "in_progress",
  in_progress: "done",
  done: "todo",
};

export function TaskCard({
  task,
  variant = "default",
  dragHandleProps,
  isDragging,
}: TaskCardProps) {
  const openTaskDialog = useUiStore((s) => s.openTaskDialog);
  const { data: categories } = useCategories();
  const updateStatus = useUpdateTaskStatus();

  const category = categories?.find((c) => c.id === task.categoryId);
  const accentColor = category?.color || "#6366f1";
  const isDone = task.status === "done";
  const isInProgress = task.status === "in_progress";

  const priority = priorityConfig[task.priority] || priorityConfig.medium;
  const PriorityIcon = priority.icon;
  const durationStr = useMemo(
    () => formatDuration(task.startTime, task.endTime),
    [task.startTime, task.endTime]
  );

  const formattedOriginalDate = useMemo(() => {
    if (!task.originalDate) return null;
    try {
      return format(parseISO(task.originalDate), "dd/MM");
    } catch {
      return null;
    }
  }, [task.originalDate]);

  const handleStatusToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextStatus = nextStatusMap[task.status];

    // Prevent marking done if startTime is in the future
    if (nextStatus === "done") {
      const now = new Date();
      const startTime = new Date(task.startTime);
      if (startTime > now) {
        toast.warning("Cannot mark as completed yet", {
          description: "This task has not reached its start time.",
        });
        return;
      }
    }

    updateStatus.mutate({
      id: task.id,
      status: nextStatus,
    });
  };

  // ================= COMPACT VARIANT (Month View & Compact Lists) =================
  if (variant === "compact") {
    return (
      <div
        onClick={() => openTaskDialog(task.id)}
        className={`group relative flex items-center justify-between gap-1.5 rounded-lg px-2 py-1 text-xs cursor-pointer transition-all duration-150 border shadow-2xs hover:shadow-xs hover:scale-[1.01] select-none ${
          isDragging ? "opacity-50" : ""
        } ${
          isDone
            ? "bg-muted/40 dark:bg-muted/20 text-muted-foreground/70 line-through opacity-65 border-border/40"
            : isInProgress
            ? "bg-primary/[0.10] dark:bg-primary/[0.22] text-foreground font-semibold border-primary/45 shadow-xs ring-1 ring-primary/20"
            : "bg-white dark:bg-card hover:bg-accent/70 dark:hover:bg-accent/50 text-foreground font-medium border-border/90 dark:border-border/80 hover:border-primary/40 shadow-2xs"
        }`}
        style={{
          borderLeftWidth: "3.5px",
          borderLeftColor: accentColor,
        }}
        title={`${task.title}${task.description ? ` - ${task.description}` : ""}${
          formattedOriginalDate ? ` (Rolled over from ${formattedOriginalDate})` : ""
        }`}
      >
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          {/* Status quick toggle checkbox */}
          <button
            type="button"
            onClick={handleStatusToggle}
            className={`shrink-0 h-3.5 w-3.5 rounded-full flex items-center justify-center transition-all ${
              isDone
                ? "bg-emerald-500 text-white shadow-2xs"
                : isInProgress
                ? "border-2 border-primary text-primary bg-primary/10"
                : "border-[1.5px] border-muted-foreground/50 hover:border-primary text-transparent hover:text-primary/60 bg-background/50"
            }`}
            title={`Status: ${
              isDone ? "Done" : isInProgress ? "In Progress" : "To Do"
            } (Click to toggle)`}
          >
            {isDone ? (
              <Check className="h-2 w-2 stroke-[3]" />
            ) : isInProgress ? (
              <span className="h-1 w-1 rounded-full bg-primary animate-ping" />
            ) : (
              <Circle className="h-2 w-2" />
            )}
          </button>

          {/* Title */}
          <span className="truncate text-[11px] leading-tight font-medium">
            {task.title}
          </span>
        </div>

        {/* Right Info: Rollover / Priority / Time */}
        <div className="flex items-center gap-1 shrink-0">
          {formattedOriginalDate && (
            <span
              className="inline-flex items-center gap-0.5 text-[9px] font-medium text-amber-600 dark:text-amber-400 bg-amber-500/15 border border-amber-500/25 px-1 py-0.2 rounded"
              title={`Rolled over from ${formattedOriginalDate}`}
            >
              <History className="h-2.5 w-2.5 shrink-0" />
            </span>
          )}
          {task.priority === "high" && !isDone && (
            <span
              className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse"
              title="High Priority"
            />
          )}
          {!task.isAllDay && (
            <span className="text-[10px] font-mono font-medium text-muted-foreground bg-muted/60 dark:bg-muted/40 px-1 py-0.2 rounded border border-border/30">
              {formatTime(task.startTime)}
            </span>
          )}
        </div>
      </div>
    );
  }

  // ================= EQUAL-HEIGHT STANDARD VARIANT (Day View, Week View, Default) =================
  return (
    <div
      onClick={() => openTaskDialog(task.id)}
      className={`group relative h-[88px] min-h-[88px] max-h-[88px] w-full rounded-xl p-2.5 cursor-pointer transition-all duration-200 hover:shadow-md select-none flex flex-col justify-between border overflow-hidden ${
        isDragging ? "shadow-xl ring-2 ring-primary/40 z-50" : ""
      } ${
        isDone
          ? "bg-muted/35 dark:bg-muted/15 border-border/50 text-muted-foreground opacity-75 hover:opacity-100 hover:border-border"
          : isInProgress
          ? "bg-gradient-to-r from-primary/[0.08] via-white to-white dark:from-primary/[0.18] dark:via-card dark:to-card border-primary/55 ring-1 ring-primary/25 shadow-sm hover:border-primary hover:shadow-md"
          : "bg-white dark:bg-card border-border/90 dark:border-border/80 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.03)] dark:shadow-[0_2px_6px_rgba(0,0,0,0.25)] hover:border-primary/50 hover:shadow-md"
      }`}
      style={{
        borderLeftWidth: "4.5px",
        borderLeftColor: accentColor,
      }}
    >
      {/* Background Subtle Glow for active/in_progress tasks */}
      {isInProgress && (
        <div
          className="absolute -top-8 -right-8 w-24 h-24 rounded-full blur-xl pointer-events-none opacity-25 dark:opacity-35"
          style={{ backgroundColor: accentColor }}
        />
      )}

      {/* TOP ROW: Status Toggle, Title, Priority Badge, Drag Handle */}
      <div className="flex items-center justify-between gap-1.5 min-w-0">
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          {/* Status quick toggle button */}
          <button
            type="button"
            onClick={handleStatusToggle}
            className={`shrink-0 h-4 w-4 rounded-full flex items-center justify-center transition-all duration-150 hover:scale-110 active:scale-95 ${
              isDone
                ? "bg-emerald-500 text-white shadow-xs"
                : isInProgress
                ? "border-2 border-primary text-primary bg-primary/15 shadow-xs"
                : "border-[1.5px] border-muted-foreground/60 hover:border-primary text-muted-foreground/40 hover:text-primary bg-background/60 shadow-2xs"
            }`}
            title={`Status: ${
              isDone ? "Done" : isInProgress ? "In Progress" : "To Do"
            } (Click to toggle)`}
          >
            {isDone ? (
              <Check className="h-2.5 w-2.5 stroke-[3]" />
            ) : isInProgress ? (
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            ) : (
              <Circle className="h-2 w-2 opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </button>

          {/* Title */}
          <h4
            className={`font-semibold tracking-tight text-[13px] leading-tight truncate transition-colors ${
              isDone
                ? "line-through text-muted-foreground/75 font-normal"
                : isInProgress
                ? "text-foreground font-bold group-hover:text-primary"
                : "text-foreground font-semibold group-hover:text-primary"
            }`}
          >
            {task.title}
          </h4>
        </div>

        {/* Priority Badge, Active Badge & Drag Handle */}
        <div className="shrink-0 flex items-center gap-1">
          {isInProgress && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-primary/15 text-primary border border-primary/30 shadow-2xs animate-pulse">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span className="hidden sm:inline">Active</span>
            </span>
          )}

          <span
            className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-semibold border shadow-2xs ${priority.bgColor} ${priority.textColor} ${priority.borderColor}`}
            title={`Priority: ${priority.label}`}
          >
            <PriorityIcon className="h-2.5 w-2.5" />
            <span className="capitalize">{priority.label}</span>
          </span>

          {/* Grip Drag Handle */}
          <div
            {...dragHandleProps}
            onClick={(e) => e.stopPropagation()}
            className="cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-foreground p-0.5 -mr-1 rounded hover:bg-muted/60 transition-colors shrink-0 touch-none flex items-center justify-center"
            title="Drag to reorder"
          >
            <GripVertical className="h-3.5 w-3.5" />
          </div>
        </div>
      </div>

      {/* MIDDLE ROW: Description or Completion text */}
      <div className="min-w-0 overflow-hidden my-0.5">
        {task.description ? (
          <p className="text-[11px] text-muted-foreground line-clamp-1 truncate leading-tight">
            {task.description}
          </p>
        ) : isDone && task.endTime ? (
          <div className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
            <CheckCircle2 className="h-3 w-3 shrink-0" />
            <span className="truncate">
              Completed {format(parseISO(task.endTime), "MMM d")} at{" "}
              {formatTime(task.endTime)}
            </span>
          </div>
        ) : (
          <div className="h-3.5" />
        )}
      </div>

      {/* BOTTOM ROW: Category Badge, Rollover Badge, Time & Duration */}
      <div className="flex items-center justify-between gap-1.5 text-[10px] text-muted-foreground pt-1 border-t border-border/40">
        {/* Badges on left */}
        <div className="flex items-center gap-1.5 min-w-0 truncate">
          {/* Category Badge */}
          {category && (
            <div
              className="flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-semibold tracking-tight shrink-0 border shadow-2xs truncate max-w-[90px]"
              style={{
                backgroundColor: `${accentColor}20`,
                borderColor: `${accentColor}40`,
                color: accentColor,
              }}
              title={`Category: ${category.name}`}
            >
              <span
                className="h-1.5 w-1.5 rounded-full shrink-0 shadow-xs"
                style={{ backgroundColor: accentColor }}
              />
              <span className="truncate">{category.name}</span>
            </div>
          )}

          {/* Rollover Badge */}
          {formattedOriginalDate && (
            <div
              className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-medium tracking-tight shrink-0 border bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400 truncate max-w-[110px]"
              title={`Rolled over from ${formattedOriginalDate}`}
            >
              <History className="h-2.5 w-2.5 shrink-0" />
              <span className="truncate">Rolled over {formattedOriginalDate}</span>
            </div>
          )}
        </div>

        {/* Time info on right */}
        <div className="flex items-center gap-1 font-mono min-w-0 shrink-0 text-foreground/80">
          <Clock className="h-2.5 w-2.5 text-muted-foreground shrink-0" />
          <span className="bg-muted/60 dark:bg-muted/40 px-1.5 py-0.5 rounded-md border border-border/40 text-[10px] font-medium">
            {task.isAllDay
              ? "All Day"
              : formatTimeRange(task.startTime, task.endTime)}
          </span>
          {durationStr && !isDone && !task.isAllDay && (
            <span className="text-[9px] font-sans px-1 py-0.2 rounded bg-muted/60 dark:bg-muted/40 text-muted-foreground border border-border/30 hidden sm:inline-block">
              {durationStr}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
