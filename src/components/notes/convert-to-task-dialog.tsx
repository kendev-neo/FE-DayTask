"use client";

import { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Calendar, Clock, Flag, Tag, CalendarPlus, Trash2, ArrowRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategories } from "@/hooks/use-categories";
import { useNotes } from "@/hooks/use-notes";
import { useLanguage } from "@/hooks/use-language";
import { format } from "date-fns";
import type { Note, TaskPriority } from "@/types";

interface ConvertToTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  note: Note | null;
}

export function ConvertToTaskDialog({
  open,
  onOpenChange,
  note,
}: ConvertToTaskDialogProps) {
  const { data: categories = [] } = useCategories();
  const { convertToTask } = useNotes();
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const todayStr = format(new Date(), "yyyy-MM-dd");

  const convertSchema = useMemo(
    () =>
      z.object({
        startDate: z.string().min(1, t.notes.convertDate),
        startTimeVal: z.string().min(1, t.notes.convertTime),
        isAllDay: z.boolean().default(false),
        categoryId: z.string().optional(),
        priority: z.enum(["low", "medium", "high"]).default("medium"),
        deleteNoteAfter: z.boolean().default(true),
      }),
    [t.notes.convertDate, t.notes.convertTime]
  );

  type ConvertFormData = z.infer<typeof convertSchema>;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ConvertFormData>({
    resolver: zodResolver(convertSchema),
    defaultValues: {
      startDate: todayStr,
      startTimeVal: "09:00",
      isAllDay: false,
      categoryId: "",
      priority: "medium",
      deleteNoteAfter: true,
    },
  });

  const isAllDay = watch("isAllDay");
  const priority = watch("priority");
  const categoryId = watch("categoryId");
  const deleteNoteAfter = watch("deleteNoteAfter");

  useEffect(() => {
    if (open) {
      reset({
        startDate: format(new Date(), "yyyy-MM-dd"),
        startTimeVal: "09:00",
        isAllDay: false,
        categoryId: "",
        priority: "medium",
        deleteNoteAfter: true,
      });
    }
  }, [open, reset]);

  if (!note) return null;

  const onSubmit = async (data: ConvertFormData) => {
    try {
      setIsSubmitting(true);
      const startTime = data.isAllDay
        ? `${data.startDate}T00:00:00.000Z`
        : `${data.startDate}T${data.startTimeVal}:00.000Z`;

      const endTime = data.isAllDay
        ? `${data.startDate}T23:59:59.999Z`
        : undefined;

      await convertToTask({
        id: note.id,
        startTime,
        endTime,
        isAllDay: data.isAllDay,
        categoryId: data.categoryId || undefined,
        priority: data.priority as TaskPriority,
        deleteNoteAfter: data.deleteNoteAfter,
      });

      onOpenChange(false);
    } catch {
      // Handled by mutation toast
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <CalendarPlus className="w-5 h-5 text-primary" />
            {t.notes.convertModalTitle}
          </DialogTitle>
          <DialogDescription>
            {t.notes.convertModalDesc}
          </DialogDescription>
        </DialogHeader>

        {/* Note preview snippet */}
        <div className="rounded-xl border bg-muted/40 p-3 space-y-1 my-1">
          <div className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <span>{t.notes.sourceNoteContent}</span>
            <ArrowRight className="w-3 h-3 text-muted-foreground" />
          </div>
          <p className="font-semibold text-sm text-foreground">{note.title}</p>
          {note.content && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {note.content}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Date & Time Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                {t.notes.convertDate}
              </Label>
              <Input
                type="date"
                {...register("startDate")}
                className="h-10 rounded-xl"
              />
              {errors.startDate && (
                <p className="text-xs text-destructive">{errors.startDate.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-primary" />
                {t.notes.convertTime}
              </Label>
              <Input
                type="time"
                disabled={isAllDay}
                {...register("startTimeVal")}
                className="h-10 rounded-xl disabled:opacity-50"
              />
            </div>
          </div>

          {/* All Day Toggle */}
          <div className="flex items-center justify-between rounded-xl border p-2.5 px-3">
            <Label htmlFor="isAllDay" className="text-xs font-medium cursor-pointer">
              {t.taskDialog.allDayTask}
            </Label>
            <Switch
              id="isAllDay"
              checked={isAllDay}
              onCheckedChange={(checked) => setValue("isAllDay", checked)}
            />
          </div>

          {/* Category & Priority Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-primary" />
                {t.notes.convertCategory}
              </Label>
              <Select
                value={categoryId || "none"}
                onValueChange={(val) => setValue("categoryId", val === "none" ? "" : val)}
              >
                <SelectTrigger className="h-10 rounded-xl">
                  <SelectValue placeholder={t.taskDialog.noCategoryAssigned} />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="none">{t.taskDialog.noCategory}</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <span className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: cat.color || "#6366f1" }}
                        />
                        {cat.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Flag className="w-3.5 h-3.5 text-primary" />
                {t.notes.convertPriority}
              </Label>
              <Select
                value={priority}
                onValueChange={(val: TaskPriority) => setValue("priority", val)}
              >
                <SelectTrigger className="h-10 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="low">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      {t.taskDialog.lowPriority}
                    </span>
                  </SelectItem>
                  <SelectItem value="medium">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      {t.taskDialog.mediumPriority}
                    </span>
                  </SelectItem>
                  <SelectItem value="high">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      {t.taskDialog.highPriority}
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Auto delete note checkbox */}
          <div className="flex items-center justify-between rounded-xl border p-3 bg-muted/30">
            <div className="space-y-0.5">
              <Label htmlFor="deleteNoteAfter" className="text-xs font-medium cursor-pointer flex items-center gap-1.5">
                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                {t.notes.deleteNoteAfterTitle}
              </Label>
              <p className="text-[11px] text-muted-foreground">
                {t.notes.deleteNoteAfterDesc}
              </p>
            </div>
            <Switch
              id="deleteNoteAfter"
              checked={deleteNoteAfter}
              onCheckedChange={(checked) => setValue("deleteNoteAfter", checked)}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              {t.common.cancel}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t.notes.converting : t.notes.convertButton}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
