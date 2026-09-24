"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { toast } from "sonner";
import { getSocket } from "@/lib/socket";
import { useEffect, useCallback } from "react";
import type {
  ApiResponse,
  Note,
  CreateNoteInput,
  UpdateNoteInput,
  ConvertNoteToTaskInput,
  NoteSortBy,
} from "@/types";

// ====== Query Keys ======

export const noteKeys = {
  all: ["notes"] as const,
};

// ====== Bundle hook: query + realtime + mutations ======

export interface UseNotesOptions {
  search?: string;
  tag?: string;
  isPinned?: boolean;
  sortBy?: NoteSortBy;
}

export function useNotes(options: UseNotesOptions = {}) {
  const queryClient = useQueryClient();

  // ====== Query ======
  const query = useQuery({
    queryKey: [...noteKeys.all, options],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Note[]>>("/notes", {
        params: {
          search: options.search || undefined,
          tag: options.tag || undefined,
          isPinned: options.isPinned === undefined ? undefined : options.isPinned,
          sortBy: options.sortBy || undefined,
        },
      });
      return data.data;
    },
  });

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: noteKeys.all });
  }, [queryClient]);

  // ====== Realtime sync via Socket.IO ======
  useEffect(() => {
    let cancelled = false;
    let sock: Awaited<ReturnType<typeof getSocket>> = null;

    getSocket().then((s) => {
      if (cancelled || !s) return;
      sock = s;
      s.on("note:created", handleChanged);
      s.on("note:updated", handleChanged);
      s.on("note:deleted", handleChanged);
    });

    const handleChanged = () => {
      invalidate();
    };

    return () => {
      cancelled = true;
      if (sock) {
        sock.off("note:created", handleChanged);
        sock.off("note:updated", handleChanged);
        sock.off("note:deleted", handleChanged);
      }
    };
  }, [queryClient, invalidate]);

  // ====== Mutations ======

  const createMutation = useMutation({
    mutationFn: async (input: CreateNoteInput) => {
      const { data } = await api.post<ApiResponse<Note>>("/notes", input);
      return data.data;
    },
    onSuccess: () => {
      invalidate();
      toast.success("Note created");
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || "Failed to create note";
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...input }: UpdateNoteInput & { id: string }) => {
      const { data } = await api.patch<ApiResponse<Note>>(`/notes/${id}`, input);
      return data.data;
    },
    onSuccess: () => {
      invalidate();
      toast.success("Note updated");
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || "Failed to update note";
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    },
  });

  const togglePinMutation = useMutation({
    mutationFn: async ({ id, isPinned }: { id: string; isPinned: boolean }) => {
      const { data } = await api.patch<ApiResponse<Note>>(`/notes/${id}`, {
        isPinned,
      });
      return data.data;
    },
    onSuccess: () => {
      invalidate();
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || "Failed to toggle pin";
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/notes/${id}`);
    },
    onSuccess: () => {
      invalidate();
      toast.success("Note deleted");
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || "Failed to delete note";
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    },
  });

  const convertMutation = useMutation({
    mutationFn: async ({
      id,
      ...input
    }: ConvertNoteToTaskInput & { id: string }) => {
      const { data } = await api.post<
        ApiResponse<{ task: any; noteDeleted: boolean }>
      >(`/notes/${id}/convert-to-task`, input);
      return data.data;
    },
    onSuccess: () => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Converted to task");
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || "Failed to convert note to task";
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    },
  });

  return {
    notes: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    createNote: createMutation.mutateAsync,
    updateNote: updateMutation.mutateAsync,
    togglePin: togglePinMutation.mutateAsync,
    deleteNote: deleteMutation.mutateAsync,
    convertToTask: convertMutation.mutateAsync,
    pendingCount: (query.data ?? []).length,
  };
}