"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragStartEvent,
  type DragOverEvent,
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
import { TaskCard } from "@/components/tasks/task-card";
import { SortableTaskCard } from "@/components/tasks/sortable-task-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { getWeekDays, isToday, format } from "@/lib/date-utils";
import { Plus, CheckCircle2 } from "lucide-react";
import type { Task, ReorderTaskItemInput } from "@/types";

interface WeekViewProps {
  tasks: Task[];
  isLoading: boolean;
}

interface DayColumnProps {
  day: Date;
  dateKey: string;
  tasks: Task[];
  isLoading: boolean;
  onQuickAdd: (day: Date) => void;
  onSelectDay: (day: Date) => void;
}

function DayColumn({
  day,
  dateKey,
  tasks,
  isLoading,
  onQuickAdd,
  onSelectDay,
}: DayColumnProps) {
  const { t } = useLanguage();
  const isCurrentDay = isToday(day);
  const colDroppableId = `col-${dateKey}`;
  const { setNodeRef, isOver } = useDroppable({
    id: colDroppableId,
    data: {
      type: "Column",
      dateKey,
      day,
    },
  });

  const doneCount = tasks.filter((t) => t.status === "done").length;
  const totalCount = tasks.length;

  const dayOfWeekStr = useMemo(() => {
    const weekdayIdx = (day.getDay() + 6) % 7;
    return t.calendar.weekdays[weekdayIdx]?.full || format(day, "EEEE");
  }, [day, t.calendar.weekdays]);

  return (
    <div
      className={`flex flex-col h-full rounded-2xl border transition-all duration-200 bg-card/60 backdrop-blur-md shadow-xs ${
        isCurrentDay
          ? "border-primary/50 ring-1 ring-primary/20 bg-primary/[0.02]"
          : "border-border/80"
      }`}
    >
      {/* Column Header */}
      <div
        className={`p-3 border-b flex items-center justify-between transition-colors ${
          isCurrentDay
            ? "border-primary/25 bg-primary/10"
            : "border-border/60 bg-muted/30"
        }`}
      >
        <div
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => onSelectDay(day)}
        >
          <div
            className={`h-7 w-7 rounded-lg flex items-center justify-center text-xs font-bold transition-transform group-hover:scale-110 shadow-xs ${
              isCurrentDay
                ? "bg-primary text-primary-foreground"
                : "bg-background text-foreground border border-border/70"
            }`}
          >
            {format(day, "dd")}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-bold text-foreground leading-tight group-hover:text-primary transition-colors">
                {dayOfWeekStr}
              </h4>
              {isCurrentDay && (
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              )}
            </div>
            <p className="text-[10px] text-muted-foreground font-mono">
              {format(day, "dd/MM")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {totalCount > 0 && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-mono font-medium bg-muted/80 text-muted-foreground border border-border/50">
              {doneCount > 0 && (
                <CheckCircle2 className="h-2.5 w-2.5 text-emerald-500 mr-0.5" />
              )}
              {doneCount}/{totalCount}
            </span>
          )}
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onQuickAdd(day)}
            className="h-6 w-6 rounded-lg text-muted-foreground hover:text-foreground hover:bg-background/80"
            title={t.calendar.addTask}
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Task List / Droppable Area */}
      <div
        ref={setNodeRef}
        className={`flex-1 p-2 space-y-2 overflow-y-auto transition-colors min-h-[160px] ${
          isOver ? "bg-primary/[0.04] ring-2 ring-primary/30 rounded-b-2xl" : ""
        }`}
      >
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-[88px] w-full rounded-xl" />
            <Skeleton className="h-[88px] w-full rounded-xl" />
          </div>
        ) : (
          <SortableContext
            id={colDroppableId}
            items={tasks.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            {tasks.map((task) => (
              <SortableTaskCard key={task.id} task={task} />
            ))}

            {tasks.length === 0 && (
              <div
                onClick={() => onQuickAdd(day)}
                className="h-[88px] border border-dashed border-border/70 rounded-xl flex flex-col items-center justify-center p-2 text-center text-muted-foreground/60 hover:border-primary/40 hover:text-primary hover:bg-primary/[0.02] transition-all cursor-pointer group"
              >
                <Plus className="h-4 w-4 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-medium">{t.calendar.addTask}</span>
              </div>
            )}
          </SortableContext>
        )}
      </div>
    </div>
  );
}

export function WeekView({ tasks, isLoading }: WeekViewProps) {
  const selectedDate = useUiStore((s) => s.selectedDate);
  const setSelectedDate = useUiStore((s) => s.setSelectedDate);
  const setActiveView = useUiStore((s) => s.setActiveView);
  const openTaskDialog = useUiStore((s) => s.openTaskDialog);
  const [columns, setColumns] = useState<Record<string, Task[]>>({});
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  // Cột NGUỒN thật lúc bắt đầu kéo. Phải ghi ở drag start: sau khi handleDragOver
  // di chuyển task sang cột đích (optimistic), findColumnOfTask(activeId) sẽ trả về
  // cột đích → khiến handleDragEnd nhầm là sắp xếp cùng ngày và bỏ gửi startTime,
  // server giữ ngày cũ → task văng về ngày cũ. Lưu cột nguồn bằng ref để phân biệt.
  const sourceColKeyRef = useRef<string | null>(null);
  const reorderMutation = useReorderTasks();

  const days = useMemo(() => getWeekDays(selectedDate), [selectedDate]);

  // Cấu hình PointerSensor và KeyboardSensor cho dnd-kit
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

  // Đồng bộ danh sách tasks vào từng cột ngày tương ứng
  useEffect(() => {
    const newCols: Record<string, Task[]> = {};
    days.forEach((d) => {
      const dateKey = format(d, "yyyy-MM-dd");
      const dayTasks = tasks
        .filter((t) => format(new Date(t.startTime), "yyyy-MM-dd") === dateKey)
        .sort((a, b) => {
          const orderA = a.order ?? 0;
          const orderB = b.order ?? 0;
          if (orderA !== orderB) return orderA - orderB;
          return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
        });
      newCols[dateKey] = dayTasks;
    });
    setColumns(newCols);
  }, [tasks, days]);

  // Helper tìm dateKey của task
  const findColumnOfTask = (taskId: string): string | null => {
    for (const [dateKey, colTasks] of Object.entries(columns)) {
      if (colTasks.some((t) => t.id === taskId)) {
        return dateKey;
      }
    }
    return null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeId = String(active.id);
    // Ghi lại cột nguồn thật (trước khi optimistic move xảy ra)
    sourceColKeyRef.current = findColumnOfTask(activeId);
    for (const colTasks of Object.values(columns)) {
      const found = colTasks.find((t) => t.id === activeId);
      if (found) {
        setActiveTask(found);
        break;
      }
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const activeColKey = findColumnOfTask(activeId);
    const overColKey = overId.startsWith("col-")
      ? overId.replace("col-", "")
      : findColumnOfTask(overId);

    if (!activeColKey || !overColKey || activeColKey === overColKey) {
      return;
    }

    setColumns((prev) => {
      const sourceList = [...(prev[activeColKey] || [])];
      const targetList = [...(prev[overColKey] || [])];

      const activeIndex = sourceList.findIndex((t) => t.id === activeId);
      if (activeIndex === -1) return prev;

      const [movedTask] = sourceList.splice(activeIndex, 1);
      if (!movedTask) return prev;

      let overIndex = targetList.findIndex((t) => t.id === overId);
      if (overIndex === -1) {
        overIndex = targetList.length;
      }

      targetList.splice(overIndex, 0, movedTask);

      return {
        ...prev,
        [activeColKey]: sourceList,
        [overColKey]: targetList,
      };
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) {
      sourceColKeyRef.current = null;
      return;
    }

    const activeId = String(active.id);
    const overId = String(over.id);

    // Cột nguồn = cột đã ghi lúc bắt đầu kéo (KHÔNG suy lại từ columns vì nó đã
    // bị optimistic-move đổi sang cột đích). Cột đích suy từ overId.
    const activeColKey = sourceColKeyRef.current;
    const overColKey = overId.startsWith("col-")
      ? overId.replace("col-", "")
      : findColumnOfTask(overId);

    sourceColKeyRef.current = null;

    if (!activeColKey || !overColKey) return;

    if (activeColKey === overColKey) {
      // Sắp xếp lại trong cùng 1 ngày
      const colList = [...(columns[activeColKey] || [])];
      const oldIndex = colList.findIndex((t) => t.id === activeId);
      const newIndex = colList.findIndex((t) => t.id === overId);

      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const reordered = arrayMove(colList, oldIndex, newIndex);
        setColumns((prev) => ({
          ...prev,
          [activeColKey]: reordered,
        }));

        reorderMutation.mutate({
          items: reordered.map((t, idx) => ({ id: t.id, order: idx })),
        });
      }
    } else {
      // Chuyển sang ngày khác
      const targetDayDate = days.find(
        (d) => format(d, "yyyy-MM-dd") === overColKey
      );
      const targetList = columns[overColKey] || [];
      const sourceList = columns[activeColKey] || [];

      if (targetDayDate) {
        const itemsToPersist: ReorderTaskItemInput[] = [];

        targetList.forEach((t, idx) => {
          if (t.id === activeId) {
            const oldDate = new Date(t.startTime);
            const newDate = new Date(targetDayDate);
            newDate.setHours(
              oldDate.getHours(),
              oldDate.getMinutes(),
              oldDate.getSeconds(),
              0
            );

            const item: ReorderTaskItemInput = {
              id: t.id,
              order: idx,
              startTime: newDate.toISOString(),
            };

            // Task cả ngày: endTime phải khớp ngày mới (23:59:59.999), tránh để
            // sót endTime ngày cũ làm đảo ngược khoảng (endTime < startTime).
            if (t.isAllDay) {
              const newEnd = new Date(targetDayDate);
              newEnd.setHours(23, 59, 59, 999);
              item.endTime = newEnd.toISOString();
            }

            itemsToPersist.push(item);
          } else {
            itemsToPersist.push({
              id: t.id,
              order: idx,
            });
          }
        });

        sourceList.forEach((t, idx) => {
          itemsToPersist.push({
            id: t.id,
            order: idx,
          });
        });

        reorderMutation.mutate({ items: itemsToPersist });
      }
    }
  };

  const handleQuickAdd = (day: Date) => {
    setSelectedDate(day);
    openTaskDialog();
  };

  const handleSelectDay = (day: Date) => {
    setSelectedDate(day);
    setActiveView("day");
  };

  return (
    <motion.div
      key={format(selectedDate, "yyyy-'W'ww")}
      initial={{ opacity: 0, scale: 0.99 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col h-full overflow-hidden"
    >
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveTask(null)}
      >
        {/* 7 Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3 h-full overflow-y-auto md:overflow-y-hidden md:overflow-x-auto pb-2">
          {days.map((day) => {
            const dateKey = format(day, "yyyy-MM-dd");
            const dayTasks = columns[dateKey] || [];

            return (
              <DayColumn
                key={dateKey}
                day={day}
                dateKey={dateKey}
                tasks={dayTasks}
                isLoading={isLoading}
                onQuickAdd={handleQuickAdd}
                onSelectDay={handleSelectDay}
              />
            );
          })}
        </div>

        {/* Drag Overlay */}
        <DragOverlay dropAnimation={null}>
          {activeTask ? (
            <div className="w-[280px] shadow-2xl rotate-2 opacity-95 pointer-events-none">
              <TaskCard task={activeTask} isDragging />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </motion.div>
  );
}
