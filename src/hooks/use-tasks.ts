import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { toast } from "sonner";
import type {
  ApiResponse,
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  ReorderTasksInput,
  CalendarView,
} from "@/types";
import { getDateRange } from "@/lib/date-utils";

// ====== Query Keys ======

export const taskKeys = {
  all: ["tasks"] as const,
  byRange: (startDate: string, endDate: string) =>
    [...taskKeys.all, startDate, endDate] as const,
};

// ====== Queries ======

export function useTasks(date: Date, view: CalendarView) {
  const { startDate, endDate } = getDateRange(date, view);

  return useQuery({
    queryKey: taskKeys.byRange(startDate, endDate),
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Task[]>>("/tasks", {
        params: { startDate, endDate },
      });
      return data.data;
    },
  });
}

// ====== Mutations ======

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateTaskInput) => {
      const { data } = await api.post<ApiResponse<Task>>("/tasks", input);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
      toast.success("Task created");
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || "Failed to create task";
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...input
    }: UpdateTaskInput & { id: string }) => {
      const { data } = await api.patch<ApiResponse<Task>>(`/tasks/${id}`, input);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
      toast.success("Task updated");
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || "Failed to update task";
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    },
  });
}

export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: Task["status"];
    }) => {
      const { data } = await api.patch<ApiResponse<Task>>(
        `/tasks/${id}/status`,
        { status }
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || "Failed to update status";
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/tasks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
      toast.success("Task deleted");
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || "Failed to delete task";
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    },
  });
}

export function useReorderTasks() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: ReorderTasksInput) => {
      const { data } = await api.patch<ApiResponse<{ success: boolean; updatedCount: number }>>(
        "/tasks/reorder",
        input
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || "Failed to reorder tasks";
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    },
  });
}
