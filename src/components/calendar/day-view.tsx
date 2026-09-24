"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useUiStore } from "@/stores/ui-store";
import { useLanguage } from "@/hooks/use-language";
import { useReorderTasks } from "@/hooks/use-tasks";
import { SortableTaskCard } from "@/components/tasks/sortable-task-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { format, isToday } from "@/lib/date-utils";
import {
  CalendarDays,
  Plus,
  Sparkles,
  ListTodo,
  CheckCircle2,
  Clock,
} from "lucide-react";
import type { Task } from "@/types";

interface DayViewProps {
  tasks: Task[];
  isLoading: boolean;
}

export function DayView({ tasks, isLoading }: DayViewProps) {
  const selectedDate = useUiStore((s) => s.selectedDate);
  const openTaskDialog = useUiStore((s) => s.openTaskDialog);
  const { t, language } = useLanguage();
  const [taskList, setTaskList] = useState<Task[]>([]);
  const reorderMutation = useReorderTasks();

  const isCurrentDay = isToday(selectedDate);

  // Cấu hình PointerSensor với activationConstraint để không chặn click event mở dialog/checkbox
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Đồng bộ taskList từ tasks prop, sắp xếp theo order (hoặc startTime nếu bằng nhau)
  useEffect(() => {
    const sorted = [...tasks].sort((a, b) => {
      const orderA = a.order ?? 0;
      const orderB = b.order ?? 0;
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
    });
    setTaskList(sorted);
  }, [tasks]);

  // Xử lý kéo thả hoàn tất
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setTaskList((prev) => {
        const oldIndex = prev.findIndex((item) => item.id === active.id);
        const newIndex = prev.findIndex((item) => item.id === over.id);
        if (oldIndex === -1 || newIndex === -1) return prev;

        const updatedList = arrayMove(prev, oldIndex, newIndex);
        reorderMutation.mutate({
          items: updatedList.map((t, idx) => ({ id: t.id, order: idx })),
        });
        return updatedList;
      });
    }
  };

  // Thống kê nhanh trong ngày
  const totalCount = taskList.length;
  const todoCount = useMemo(
    () => taskList.filter((t) => t.status === "todo").length,
    [taskList]
  );
  const inProgressCount = useMemo(
    () => taskList.filter((t) => t.status === "in_progress").length,
    [taskList]
  );
  const doneCount = useMemo(
    () => taskList.filter((t) => t.status === "done").length,
    [taskList]
  );

  const progressPercent =
    totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  // Format localized day string
  const formattedDayString = useMemo(() => {
    const weekdayIdx = (selectedDate.getDay() + 6) % 7;
    const weekdayName = t.calendar.weekdays[weekdayIdx]?.full || format(selectedDate, "EEEE");
    if (language === "vi") {
      return `${weekdayName}, ${format(selectedDate, "dd/MM/yyyy")}`;
    }
    return format(selectedDate, "EEEE, MMMM d, yyyy");
  }, [selectedDate, language, t.calendar.weekdays]);

  return (
    <motion.div
      key={format(selectedDate, "yyyy-MM-dd")}
      initial={{ opacity: 0, scale: 0.99 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col h-full rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md overflow-hidden shadow-xs"
    >
      {/* ================= HEADER STATS ================= */}
      <div className="border-b border-border/70 p-3 sm:p-5 bg-card/70 backdrop-blur-md space-y-2.5 sm:space-y-3.5 shrink-0">
        {/* Row 1: Title & Add button */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-3">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div
              className={`h-8 w-8 sm:h-10 sm:w-10 rounded-xl flex items-center justify-center shadow-xs border shrink-0 ${
                isCurrentDay
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted text-muted-foreground border-border/60"
              }`}
            >
              <CalendarDays className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h3 className="text-sm sm:text-lg font-bold tracking-tight text-foreground truncate">
                  {formattedDayString}
                </h3>
                {isCurrentDay && (
                  <span className="px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-semibold bg-primary/15 text-primary border border-primary/25 shrink-0">
                    {t.calendar.todayButton}
                  </span>
                )}
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">
                {t.calendar.dragToReorder}
              </p>
            </div>
          </div>

          <Button
            size="sm"
            onClick={() => openTaskDialog()}
            className="rounded-xl h-8 sm:h-9 px-3 sm:px-4 text-xs font-semibold shadow-xs hover:shadow-md transition-all active:scale-[0.98] shrink-0"
          >
            <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-1.5" />
            <span className="hidden sm:inline">{t.nav.newTask}</span>
            <span className="sm:hidden">{t.common.create}</span>
          </Button>
        </div>

        {/* Row 2: Badges & Progress Bar */}
        <div className="pt-2 border-t border-border/40 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-2">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg text-[11px] sm:text-xs font-semibold bg-muted/70 text-foreground border border-border/60">
                <ListTodo className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground" />
                {t.calendar.totalTasks}: <span className="font-mono">{totalCount}</span>
              </span>

              <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg text-[11px] sm:text-xs font-medium bg-slate-500/10 text-slate-700 dark:text-slate-300 border border-slate-500/20">
                <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-slate-500" />
                {t.calendar.todo}: <span className="font-mono font-semibold">{todoCount}</span>
              </span>

              <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg text-[11px] sm:text-xs font-medium bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-amber-500 animate-pulse" />
                {t.calendar.inProgress}: <span className="font-mono font-semibold">{inProgressCount}</span>
              </span>

              <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg text-[11px] sm:text-xs font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-emerald-500" />
                {t.calendar.done}: <span className="font-mono font-semibold">{doneCount}</span>
              </span>
            </div>

            {/* Percentage text */}
            <div className="text-[11px] sm:text-xs font-semibold text-muted-foreground">
              {t.calendar.progress}: <span className="text-foreground font-mono font-bold">{progressPercent}%</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-muted/60 h-1.5 sm:h-2 rounded-full overflow-hidden p-0.5 border border-border/40">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-500"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      {/* ================= TASK LIST (SORTABLE LIST) ================= */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-2.5 sm:space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-[88px] w-full rounded-xl" />
            <Skeleton className="h-[88px] w-full rounded-xl" />
            <Skeleton className="h-[88px] w-full rounded-xl" />
            <Skeleton className="h-[88px] w-full rounded-xl" />
          </div>
        ) : taskList.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center min-h-[300px] p-8 text-center rounded-2xl border border-dashed border-border/80 bg-muted/10">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-3.5 shadow-sm">
              <Sparkles className="h-7 w-7" />
            </div>
            <h4 className="text-base font-bold text-foreground">
              {t.calendar.noTasksScheduled}
            </h4>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm leading-relaxed">
              {t.calendar.noTasksSub}
            </p>
            <Button
              size="sm"
              onClick={() => openTaskDialog()}
              className="mt-4 rounded-xl h-9 px-4 text-xs font-semibold shadow-xs"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              {t.nav.newTask}
            </Button>
          </div>
        ) : (
          /* DndContext & Sortable List */
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={taskList.map((t) => t.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2.5">
                {taskList.map((task) => (
                  <SortableTaskCard key={task.id} task={task} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </motion.div>
  );
}
