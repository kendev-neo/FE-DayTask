"use client";

import { useState, useMemo } from "react";
import {
  StickyNote,
  Plus,
  Search,
  Pin,
  Sparkles,
  ArrowUpDown,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NoteCard } from "@/components/notes/note-card";
import { NoteDialog } from "@/components/notes/note-dialog";
import { ConvertToTaskDialog } from "@/components/notes/convert-to-task-dialog";
import { useNotes } from "@/hooks/use-notes";
import { useLanguage } from "@/hooks/use-language";
import type { Note, NoteSortBy } from "@/types";

export default function NotesPage() {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [pinnedOnly, setPinnedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<NoteSortBy>("createdAt");

  // Dialog states
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const [convertingNote, setConvertingNote] = useState<Note | null>(null);

  const {
    notes,
    isLoading,
    deleteNote,
    togglePin,
  } = useNotes({
    search: search.trim() || undefined,
    isPinned: pinnedOnly ? true : undefined,
    sortBy,
  });

  // Separate pinned and regular notes for organized layout (when not searching/filtered)
  const { pinnedNotes, regularNotes } = useMemo(() => {
    const pinned: Note[] = [];
    const regular: Note[] = [];

    notes.forEach((note) => {
      if (note.isPinned) {
        pinned.push(note);
      } else {
        regular.push(note);
      }
    });

    return { pinnedNotes: pinned, regularNotes: regular };
  }, [notes]);

  const handleOpenCreate = () => {
    setEditingNote(null);
    setNoteDialogOpen(true);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setNoteDialogOpen(true);
  };

  const handleConvertToTask = (note: Note) => {
    setConvertingNote(note);
    setConvertDialogOpen(true);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
      {/* Header & Action Bar */}
      <div className="border-b border-border/60 bg-card/40 backdrop-blur-xs p-4 sm:px-6 shrink-0 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <StickyNote className="h-4 w-4" />
              </div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
                {t.notes.title}
              </h1>
              <Badge variant="secondary" className="text-xs font-mono">
                {notes.length}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t.notes.subtitle}
            </p>
          </div>

          <Button
            onClick={handleOpenCreate}
            className="h-9 rounded-xl gap-2 font-medium shadow-xs shrink-0 self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            {t.notes.newNoteButton}
          </Button>
        </div>

        {/* Filter Controls Toolbar */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.notes.searchPlaceholder}
              className="h-9 pl-9 pr-8 text-xs rounded-xl bg-background/60"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Pin Filter Toggle */}
          <Button
            type="button"
            variant={pinnedOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setPinnedOnly(!pinnedOnly)}
            className="h-9 rounded-xl gap-1.5 text-xs"
          >
            <Pin className={`h-3.5 w-3.5 ${pinnedOnly ? "fill-primary-foreground" : ""}`} />
            <span>{pinnedOnly ? t.notes.filterPinned : t.notes.pinned}</span>
          </Button>

          {/* Sort Selector */}
          <div className="w-[160px]">
            <Select
              value={sortBy}
              onValueChange={(val: NoteSortBy) => setSortBy(val)}
            >
              <SelectTrigger className="h-9 text-xs rounded-xl bg-background/60">
                <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground mr-1.5" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="createdAt" className="text-xs">
                  {t.notes.sortNewest}
                </SelectItem>
                <SelectItem value="expiresAt" className="text-xs">
                  {t.notes.sortExpiringSoon}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Main Content: Notes Grid */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-36 rounded-xl border border-border/50 bg-card/40 animate-pulse p-4 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-full" />
                </div>
                <div className="h-5 bg-muted rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : notes.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center min-h-[360px] text-center p-6 rounded-2xl border border-dashed border-border/80 bg-card/20">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-3">
              <Sparkles className="h-7 w-7" />
            </div>
            <h3 className="text-base font-semibold text-foreground mb-1">
              {search || pinnedOnly
                ? t.notes.emptyStateTitle
                : t.notes.emptyStateTitle}
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mb-4">
              {search || pinnedOnly
                ? t.notes.emptyStateFiltered
                : t.notes.emptyStateDefault}
            </p>
            <Button
              onClick={handleOpenCreate}
              className="rounded-xl gap-2 font-medium"
            >
              <Plus className="h-4 w-4" />
              {t.notes.newNoteButton}
            </Button>
          </div>
        ) : (
          /* Notes Cards Grid */
          <div className="space-y-6">
            {/* Pinned Section */}
            {!pinnedOnly && pinnedNotes.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <Pin className="h-3.5 w-3.5 fill-primary text-primary" />
                  <span>{t.notes.pinned} ({pinnedNotes.length})</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {pinnedNotes.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      onEdit={handleEditNote}
                      onConvertToTask={handleConvertToTask}
                      onDelete={deleteNote}
                      onTogglePin={(id, isPinned) => togglePin({ id, isPinned })}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Regular Notes Section */}
            <div className="space-y-3">
              {!pinnedOnly && pinnedNotes.length > 0 && regularNotes.length > 0 && (
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <StickyNote className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{t.notes.filterAll} ({regularNotes.length})</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {(pinnedOnly ? notes : regularNotes).map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onEdit={handleEditNote}
                    onConvertToTask={handleConvertToTask}
                    onDelete={deleteNote}
                    onTogglePin={(id, isPinned) => togglePin({ id, isPinned })}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Note Create/Edit Dialog */}
      <NoteDialog
        open={noteDialogOpen}
        onOpenChange={setNoteDialogOpen}
        note={editingNote}
      />

      {/* Convert to Task Dialog */}
      <ConvertToTaskDialog
        open={convertDialogOpen}
        onOpenChange={setConvertDialogOpen}
        note={convertingNote}
      />
    </div>
  );
}
