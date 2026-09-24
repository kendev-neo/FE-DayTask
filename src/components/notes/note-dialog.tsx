"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Sparkles, Pin, Palette, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useNotes } from "@/hooks/use-notes";
import { useLanguage } from "@/hooks/use-language";
import { cn } from "@/lib/utils";
import type { Note } from "@/types";

const noteSchema = z.object({
  text: z.string().min(1, "Note content cannot be empty").max(5000, "Maximum 5000 characters"),
  color: z.string().default("default"),
  isPinned: z.boolean().default(false),
});

type NoteFormData = z.infer<typeof noteSchema>;

interface NoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  note?: Note | null;
}

const colorOptions = [
  { id: "default", name: "Default", swatch: "#64748b", bg: "bg-slate-500" },
  { id: "indigo", name: "Indigo", swatch: "#6366f1", bg: "bg-indigo-500" },
  { id: "emerald", name: "Emerald", swatch: "#10b981", bg: "bg-emerald-500" },
  { id: "blue", name: "Blue", swatch: "#3b82f6", bg: "bg-blue-500" },
  { id: "rose", name: "Rose", swatch: "#f43f5e", bg: "bg-rose-500" },
  { id: "violet", name: "Violet", swatch: "#8b5cf6", bg: "bg-violet-500" },
  { id: "amber", name: "Amber", swatch: "#f59e0b", bg: "bg-amber-500" },
  { id: "teal", name: "Teal", swatch: "#14b8a6", bg: "bg-teal-500" },
  { id: "orange", name: "Orange", swatch: "#f97316", bg: "bg-orange-500" },
  { id: "cyan", name: "Cyan", swatch: "#06b6d4", bg: "bg-cyan-500" },
];

/**
 * Tách nội dung text thành { title, content } để lưu vào database
 * - Dòng đầu tiên (hoặc 100 ký tự đầu) làm tiêu đề ngắn gọn
 * - Các dòng tiếp theo là nội dung chi tiết
 */
export function parseNoteText(rawText: string): { title: string; content?: string } {
  const trimmed = rawText.trim();
  const lines = trimmed.split("\n");
  const firstLine = lines[0]?.trim() || "";

  // Nếu dòng đầu quá dài (> 120 ký tự), lấy 100 ký tự đầu làm title, toàn bộ làm content
  if (firstLine.length > 120) {
    return {
      title: firstLine.slice(0, 100).trim() + "...",
      content: trimmed,
    };
  }

  // Tiêu đề là dòng đầu
  const title = firstLine;
  // Nội dung chi tiết là các dòng còn lại (nếu có)
  const remaining = lines.slice(1).join("\n").trim();
  const content = remaining || (lines.length > 1 ? "" : undefined);

  return {
    title,
    content: content || undefined,
  };
}

export function NoteDialog({ open, onOpenChange, note }: NoteDialogProps) {
  const { createNote, updateNote } = useNotes();
  const { t } = useLanguage();
  const [selectedColor, setSelectedColor] = useState("default");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!note;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<NoteFormData>({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      text: "",
      color: "default",
      isPinned: false,
    },
  });

  const isPinned = watch("isPinned");

  useEffect(() => {
    if (open) {
      if (note) {
        // Combine title and content into single textarea when editing
        const combinedText =
          note.content && note.content !== note.title
            ? `${note.title}\n${note.content}`
            : note.title;

        reset({
          text: combinedText,
          color: note.color || "default",
          isPinned: note.isPinned || false,
        });
        setSelectedColor(note.color || "default");
      } else {
        reset({
          text: "",
          color: "default",
          isPinned: false,
        });
        setSelectedColor("default");
      }
    }
  }, [open, note, reset]);

  const onSubmit = async (data: NoteFormData) => {
    try {
      setIsSubmitting(true);
      const { title, content } = parseNoteText(data.text);

      if (isEditing && note) {
        await updateNote({
          id: note.id,
          title,
          content,
          color: selectedColor,
          isPinned: data.isPinned,
        });
      } else {
        await createNote({
          title,
          content,
          color: selectedColor,
          isPinned: data.isPinned,
        });
      }
      onOpenChange(false);
    } catch {
      // Errors handled by mutation toast
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="w-5 h-5 text-primary" />
            {isEditing ? t.notes.editNote : t.notes.createNoteModalTitle}
          </DialogTitle>
          <DialogDescription>
            {t.notes.createNoteModalDesc}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-1">
          {/* Unified Note Content Textarea */}
          <div className="space-y-1.5">
            <Label htmlFor="note-text" className="text-sm font-medium">
              {t.notes.createNoteModalTitle} <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="note-text"
              rows={6}
              placeholder={t.notes.noteContentPlaceholder}
              {...register("text")}
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                  e.preventDefault();
                  handleSubmit(onSubmit)();
                }
              }}
              className={cn(
                "resize-none font-sans text-sm rounded-xl leading-relaxed",
                errors.text ? "border-destructive focus-visible:ring-destructive" : ""
              )}
              autoFocus
            />
            {errors.text && (
              <p className="text-xs text-destructive">{errors.text.message}</p>
            )}
            <p className="text-[11px] text-muted-foreground">
              {t.notes.pressEnterHint}
            </p>
          </div>

          {/* Color Picker */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5" />
              {t.notes.colorTag}
            </Label>
            <div className="flex flex-wrap gap-2 pt-0.5">
              {colorOptions.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  title={c.name}
                  onClick={() => {
                    setSelectedColor(c.id);
                    setValue("color", c.id);
                  }}
                  className={cn(
                    "w-6 h-6 rounded-full transition-transform flex items-center justify-center border",
                    c.bg,
                    selectedColor === c.id
                      ? "ring-2 ring-primary ring-offset-2 scale-110"
                      : "opacity-80 hover:opacity-100 hover:scale-105"
                  )}
                />
              ))}
            </div>
          </div>

          {/* Pin switch */}
          <div className="flex items-center justify-between rounded-xl border p-2.5 px-3">
            <div className="space-y-0.5">
              <Label htmlFor="isPinned" className="text-xs font-medium flex items-center gap-1.5 cursor-pointer">
                <Pin className="w-3.5 h-3.5 text-primary" />
                {t.notes.pinNote}
              </Label>
              <p className="text-[11px] text-muted-foreground">
                {t.notes.pinned}
              </p>
            </div>
            <Switch
              id="isPinned"
              checked={isPinned}
              onCheckedChange={(checked) => setValue("isPinned", checked)}
            />
          </div>

          {/* 7-day auto-expire notice */}
          <div className="flex items-center gap-2 rounded-xl bg-muted/50 p-2.5 px-3 text-xs text-muted-foreground border border-border/40">
            <Info className="w-4 h-4 text-primary shrink-0" />
            <div className="text-[11px] leading-tight">
              {t.notes.subtitle}
            </div>
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
              {isSubmitting
                ? t.notes.creatingNote
                : isEditing
                ? t.taskDialog.saveChanges
                : t.notes.saveNote}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
