"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Trash2, Calendar, Clock, Tag, Flag, Lock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useUiStore } from "@/stores/ui-store";
import {
  useTasks,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
} from "@/hooks/use-tasks";
import { useCategories } from "@/hooks/use-categories";
import { useLanguage } from "@/hooks/use-language";
import { TimePicker24h } from "@/components/ui/time-picker-24h";
import { format } from "@/lib/date-utils";
import { parseISO } from "date-fns";
import { toast } from "sonner";

const taskSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().optional(),
  status: z.enum(["todo", "in_progress", "done"]),
  priority: z.enum(["low", "medium", "high"]),
  startDate: z.string().min(1, "Start date is required"),
  startTimeVal: z.string().min(1, "Start time is required"),
  isAllDay: z.boolean(),
  categoryId: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

export function TaskDialog() {
  const taskDialogOpen = useUiStore((s) => s.taskDialogOpen);
  const editingTaskId = useUiStore((s) => s.editingTaskId);
  const closeTaskDialog = useUiStore((s) => s.closeTaskDialog);
  const selectedDate = useUiStore((s) => s.selectedDate);
  const activeView = useUiStore((s) => s.activeView);
  const { t } = useLanguage();

  const { data: tasks = [] } = useTasks(selectedDate, activeView);
  const { data: categories = [] } = useCategories();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const editingTask = useMemo(
    () => (editingTaskId ? tasks.find((t) => t.id === editingTaskId) : null),
    [editingTaskId, tasks]
  );

  const isEditing = !!editingTask;
  const isCompletedTask = isEditing && editingTask?.status === "done";

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "todo",
      priority: "medium",
      startDate: format(selectedDate, "yyyy-MM-dd"),
      startTimeVal: "09:00",
      isAllDay: false,
      categoryId: "",
    },
  });

  const isAllDay = watch("isAllDay");
  const currentPriority = watch("priority");
  const currentStatus = watch("status");
  const startDate = watch("startDate");
  const startTimeVal = watch("startTimeVal");

  // Thông tin thời gian hoàn thành hiển thị khi task ở trạng thái Done
  const doneCompletionInfo = useMemo(() => {
    if (currentStatus !== "done") return null;
    // Đang sửa một task đã hoàn thành → hiển thị thời gian/ngày đã lưu
    if (editingTask?.status === "done" && editingTask.endTime) {
      return {
        label: "Completed",
        time: parseISO(editingTask.endTime),
      };
    }
    // Vừa chọn Done → hiển thị thời điểm hoàn thành sẽ được ghi nhận khi bấm Lưu
    return { label: "Will record at", time: new Date() };
  }, [currentStatus, editingTask]);

  // Kiểm tra xem task đã bắt đầu chưa (startTime <= now)
  const isStarted = useMemo(() => {
    if (!startDate) return true;
    const now = new Date();
    const start = isAllDay
      ? new Date(`${startDate}T00:00:00`)
      : new Date(`${startDate}T${startTimeVal || "00:00"}:00`);
    return now >= start;
  }, [startDate, startTimeVal, isAllDay]);

  // Reset form when dialog opens
  useEffect(() => {
    if (taskDialogOpen) {
      if (editingTask) {
        const start = new Date(editingTask.startTime);
        reset({
          title: editingTask.title,
          description: editingTask.description || "",
          status: editingTask.status,
          priority: editingTask.priority,
          startDate: format(start, "yyyy-MM-dd"),
          startTimeVal: format(start, "HH:mm"),
          isAllDay: editingTask.isAllDay,
          categoryId: editingTask.categoryId || "",
        });
      } else {
        const currentHour = selectedDate.getHours();
        const startHour = currentHour === 0 && selectedDate.getMinutes() === 0 ? 9 : currentHour;
        const defaultStart = `${String(startHour).padStart(2, "0")}:00`;

        reset({
          title: "",
          description: "",
          status: "todo",
          priority: "medium",
          startDate: format(selectedDate, "yyyy-MM-dd"),
          startTimeVal: defaultStart,
          isAllDay: false,
          categoryId: "",
        });
      }
    }
  }, [taskDialogOpen, editingTask, selectedDate, reset]);

  const onSubmit = (data: TaskFormData) => {
    const isDone = data.status === "done";
    const now = new Date();

    const startTime = data.isAllDay
      ? `${data.startDate}T00:00:00.000Z`
      : `${data.startDate}T${data.startTimeVal}:00.000Z`;

    // Validate: không cho phép chọn Done nếu chưa đến startTime
    if (isDone && new Date(startTime) > now) {
      toast.error(t.taskDialog.cannotMarkDone, {
        description: t.taskDialog.cannotMarkDoneDesc,
      });
      return;
    }

    let endTime: string | undefined;

    if (isDone) {
      // Khi lưu task ở trạng thái Hoàn thành (Done), tự động ghi nhận thời gian hoàn thành (endTime) chính là thời gian bấm Save
      endTime = now.toISOString();
    } else if (data.isAllDay) {
      // Cả ngày (All Day): từ 00:00 đến 23:59:59.999 của ngày start
      endTime = `${data.startDate}T23:59:59.999Z`;
    }
    // Không all-day → endTime để trống (undefined), không gửi

    const payload = {
      title: isCompletedTask ? editingTask.title : data.title,
      description: isCompletedTask
        ? editingTask.description || undefined
        : data.description || undefined,
      status: data.status,
      priority: data.priority,
      startTime,
      endTime,
      isAllDay: data.isAllDay,
      categoryId: data.categoryId || undefined,
    };

    if (isEditing) {
      updateTask.mutate(
        { id: editingTask!.id, ...payload },
        { onSuccess: () => closeTaskDialog() }
      );
    } else {
      createTask.mutate(payload, { onSuccess: () => closeTaskDialog() });
    }
  };

  const handleDelete = () => {
    if (editingTask) {
      deleteTask.mutate(editingTask.id, {
        onSuccess: () => closeTaskDialog(),
      });
    }
  };

  return (
    <Dialog open={taskDialogOpen} onOpenChange={(open) => !open && closeTaskDialog()}>
      <DialogContent className="max-w-md sm:max-w-lg w-[95vw] sm:w-full max-h-[90dvh] overflow-y-auto rounded-2xl border-border/80 bg-card/95 backdrop-blur-xl p-4 sm:p-6 shadow-2xl">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-xl font-bold tracking-tight">
            {isEditing ? t.taskDialog.editTitle : t.taskDialog.createTitle}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {isEditing
              ? t.taskDialog.editDesc
              : t.taskDialog.createDesc}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          {/* Completed Task Lock Notice */}
          {isCompletedTask && (
            <div className="flex items-start gap-2.5 px-3.5 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs">
              <Lock className="h-4 w-4 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-semibold">{t.taskDialog.completedLockedNotice}</p>
                <p className="text-[11px] opacity-90">{t.taskDialog.completedLockedDesc}</p>
              </div>
            </div>
          )}

          {/* Title */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="title" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                {t.taskDialog.taskTitle} <span className="text-destructive">*</span>
              </Label>
              {isCompletedTask && (
                <span className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground/80">
                  <Lock className="h-3 w-3" />
                  {t.taskDialog.completedLockedNotice}
                </span>
              )}
            </div>
            <Input
              id="title"
              placeholder={t.taskDialog.titlePlaceholder}
              disabled={isCompletedTask}
              className={`h-10 rounded-xl bg-background/50 border-border/80 focus:border-primary focus:ring-primary/20 text-sm ${
                isCompletedTask ? "opacity-75 cursor-not-allowed bg-muted/30" : ""
              }`}
              {...register("title")}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="description" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                {t.taskDialog.description}
              </Label>
              {isCompletedTask && (
                <span className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground/80">
                  <Lock className="h-3 w-3" />
                </span>
              )}
            </div>
            <Textarea
              id="description"
              placeholder={t.taskDialog.descPlaceholder}
              rows={2}
              disabled={isCompletedTask}
              className={`rounded-xl bg-background/50 border-border/80 focus:border-primary focus:ring-primary/20 text-xs resize-none ${
                isCompletedTask ? "opacity-75 cursor-not-allowed bg-muted/30" : ""
              }`}
              {...register("description")}
            />
          </div>

          {/* Status + Priority Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                {t.taskDialog.status}
              </Label>
              <Select
                value={currentStatus}
                onValueChange={(v: TaskFormData["status"]) => setValue("status", v)}
              >
                <SelectTrigger className="h-10 rounded-xl bg-background/50 border-border/80">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border/80">
                  <SelectItem value="todo">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-muted-foreground/60" />
                      {t.calendar.todo}
                    </span>
                  </SelectItem>
                  <SelectItem value="in_progress">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                      {t.calendar.inProgress}
                    </span>
                  </SelectItem>
                  <SelectItem value="done" disabled={!isStarted}>
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      {t.calendar.done} {!isStarted && t.taskDialog.notStartedYet}
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Flag className="h-3.5 w-3.5 text-primary" />
                {t.taskDialog.priority}
              </Label>
              <Select
                value={currentPriority}
                onValueChange={(v: TaskFormData["priority"]) => setValue("priority", v)}
              >
                <SelectTrigger className="h-10 rounded-xl bg-background/50 border-border/80">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border/80">
                  <SelectItem value="low">
                    <span className="text-blue-500 font-medium">{t.taskDialog.lowPriority}</span>
                  </SelectItem>
                  <SelectItem value="medium">
                    <span className="text-amber-500 font-medium">{t.taskDialog.mediumPriority}</span>
                  </SelectItem>
                  <SelectItem value="high">
                    <span className="text-rose-500 font-medium">{t.taskDialog.highPriority}</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Completion notice when status is Done */}
          {currentStatus === "done" && doneCompletionInfo && (
            <div className="flex items-start gap-2.5 px-3.5 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0 mt-1" />
              <p className="leading-relaxed">
                <strong>{doneCompletionInfo.label}:</strong>{" "}
                <span className="font-mono font-semibold">
                  {format(doneCompletionInfo.time, "yyyy-MM-dd HH:mm")}
                </span>
                {doneCompletionInfo.label === "Will record at" && (
                  <span> (upon saving)</span>
                )}
              </p>
            </div>
          )}

          {/* Category Selector */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5 text-primary" />
              {t.taskDialog.category}
            </Label>
            <Select
              value={watch("categoryId") || "none"}
              onValueChange={(v) => setValue("categoryId", v === "none" ? "" : v)}
            >
              <SelectTrigger className="h-10 rounded-xl bg-background/50 border-border/80">
                <SelectValue placeholder={t.taskDialog.noCategoryAssigned} />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border/80">
                <SelectItem value="none">{t.taskDialog.noCategory}</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <span className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full shadow-xs shrink-0"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="font-medium">{cat.name}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* All Day Toggle Card */}
          <div className="flex items-center justify-between rounded-xl border border-border/70 bg-muted/20 px-3.5 py-2.5">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="all-day-switch" className="text-xs font-medium cursor-pointer">
                {t.taskDialog.allDayTask}
              </Label>
            </div>
            <Switch
              id="all-day-switch"
              checked={isAllDay}
              onCheckedChange={(v) => setValue("isAllDay", v)}
            />
          </div>

          {/* Date & Time Pickers */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-1.5">
                <Label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-primary" /> {t.taskDialog.startDate}
                </Label>
                <Input
                  type="date"
                  className="h-9 rounded-xl bg-background/50 border-border/80 text-xs font-mono"
                  {...register("startDate")}
                />
                {errors.startDate && (
                  <p className="text-xs text-destructive">{errors.startDate.message}</p>
                )}
              </div>
              {!isAllDay && (
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-semibold text-muted-foreground flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-primary" /> {t.taskDialog.startTime}
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground/70">HH : mm</span>
                  </Label>
                  <TimePicker24h
                    value={startTimeVal || "09:00"}
                    onChange={(v) => setValue("startTimeVal", v)}
                  />
                </div>
              )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-border/60">
            {isEditing ? (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={deleteTask.isPending}
                className="rounded-xl h-9 text-xs font-medium"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                {t.common.delete}
              </Button>
            ) : (
              <div />
            )}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={closeTaskDialog}
                className="rounded-xl h-9 text-xs font-medium border-border/80"
              >
                {t.common.cancel}
              </Button>
              <Button
                type="submit"
                disabled={createTask.isPending || updateTask.isPending}
                className="rounded-xl h-9 px-5 text-xs font-medium shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
              >
                {createTask.isPending || updateTask.isPending
                  ? t.common.saving
                  : isEditing
                  ? t.taskDialog.saveChanges
                  : t.common.create}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
