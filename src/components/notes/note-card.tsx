"use client";

import { Pin, CalendarPlus, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { NoteCountdownBadge } from "@/components/notes/note-countdown-badge";
import { useLanguage } from "@/hooks/use-language";
import type { Note } from "@/types";

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onConvertToTask: (note: Note) => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string, isPinned: boolean) => void;
}

const colorMap: Record<
  string,
  { bg: string; border: string; accent: string }
> = {
  default: {
    bg: "bg-card hover:bg-card/90",
    border: "border-border hover:border-primary/40",
    accent: "bg-muted-foreground/30",
  },
  indigo: {
    bg: "bg-indigo-50/40 dark:bg-indigo-950/20 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/30",
    border: "border-indigo-200 dark:border-indigo-800/50 hover:border-indigo-400",
    accent: "bg-indigo-500",
  },
  emerald: {
    bg: "bg-emerald-50/40 dark:bg-emerald-950/20 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/30",
    border: "border-emerald-200 dark:border-emerald-800/50 hover:border-emerald-400",
    accent: "bg-emerald-500",
  },
  blue: {
    bg: "bg-blue-50/40 dark:bg-blue-950/20 hover:bg-blue-50/60 dark:hover:bg-blue-950/30",
    border: "border-blue-200 dark:border-blue-800/50 hover:border-blue-400",
    accent: "bg-blue-500",
  },
  rose: {
    bg: "bg-rose-50/40 dark:bg-rose-950/20 hover:bg-rose-50/60 dark:hover:bg-rose-950/30",
    border: "border-rose-200 dark:border-rose-800/50 hover:border-rose-400",
    accent: "bg-rose-500",
  },
  violet: {
    bg: "bg-violet-50/40 dark:bg-violet-950/20 hover:bg-violet-50/60 dark:hover:bg-violet-950/30",
    border: "border-violet-200 dark:border-violet-800/50 hover:border-violet-400",
    accent: "bg-violet-500",
  },
  amber: {
    bg: "bg-amber-50/40 dark:bg-amber-950/20 hover:bg-amber-50/60 dark:hover:bg-amber-950/30",
    border: "border-amber-200 dark:border-amber-800/50 hover:border-amber-400",
    accent: "bg-amber-500",
  },
  teal: {
    bg: "bg-teal-50/40 dark:bg-teal-950/20 hover:bg-teal-50/60 dark:hover:bg-teal-950/30",
    border: "border-teal-200 dark:border-teal-800/50 hover:border-teal-400",
    accent: "bg-teal-500",
  },
  orange: {
    bg: "bg-orange-50/40 dark:bg-orange-950/20 hover:bg-orange-50/60 dark:hover:bg-orange-950/30",
    border: "border-orange-200 dark:border-orange-800/50 hover:border-orange-400",
    accent: "bg-orange-500",
  },
  cyan: {
    bg: "bg-cyan-50/40 dark:bg-cyan-950/20 hover:bg-cyan-50/60 dark:hover:bg-cyan-950/30",
    border: "border-cyan-200 dark:border-cyan-800/50 hover:border-cyan-400",
    accent: "bg-cyan-500",
  },
};

export function NoteCard({
  note,
  onEdit,
  onConvertToTask,
  onDelete,
  onTogglePin,
}: NoteCardProps) {
  const { t } = useLanguage();
  const theme = colorMap[note.color] || colorMap.default;

  return (
    <div
      onClick={() => onEdit(note)}
      className={cn(
        "group relative flex flex-col justify-between rounded-xl border p-4 shadow-xs transition-all duration-200 cursor-pointer hover:shadow-sm",
        theme.bg,
        theme.border,
        note.isPinned && "ring-1 ring-primary/30 shadow-xs"
      )}
    >
      {/* Top accent bar if color is chosen */}
      {note.color && note.color !== "default" && (
        <div
          className={cn(
            "absolute top-0 left-4 right-4 h-1 rounded-b-full opacity-80",
            theme.accent
          )}
        />
      )}

      {/* Header: Title + Pin Button */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-sm text-foreground leading-snug line-clamp-2">
            {note.title}
          </h3>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onTogglePin(note.id, !note.isPinned);
            }}
            title={note.isPinned ? t.notes.unpinNote : t.notes.pinNote}
            className={cn(
              "shrink-0 p-1 rounded-lg transition-colors",
              note.isPinned
                ? "text-primary bg-primary/10 hover:bg-primary/20"
                : "text-muted-foreground/60 hover:text-foreground hover:bg-muted opacity-80 group-hover:opacity-100"
            )}
          >
            {note.isPinned ? (
              <Pin className="w-3.5 h-3.5 fill-primary" />
            ) : (
              <Pin className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Content body */}
        {note.content && (
          <p className="text-xs text-muted-foreground whitespace-pre-wrap break-words line-clamp-5 mb-3 font-normal leading-relaxed">
            {note.content}
          </p>
        )}
      </div>

      {/* Footer: Expiration Countdown & Action Buttons */}
      <div
        className="pt-2 mt-2 border-t border-border/40 flex items-center justify-between gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        <NoteCountdownBadge expiresAt={note.expiresAt} />

        <div className="flex items-center gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            title={t.notes.convertToTask}
            onClick={(e) => {
              e.stopPropagation();
              onConvertToTask(note);
            }}
            className="h-7 w-7 text-primary hover:text-primary hover:bg-primary/10"
          >
            <CalendarPlus className="w-3.5 h-3.5" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            title={t.notes.editNote}
            onClick={(e) => {
              e.stopPropagation();
              onEdit(note);
            }}
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
          >
            <Pencil className="w-3.5 h-3.5" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            title={t.notes.deleteNote}
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm(`${t.notes.deleteConfirmTitle} ${t.notes.deleteConfirmDesc}`)) {
                onDelete(note.id);
              }
            }}
            className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
