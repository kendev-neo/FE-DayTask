import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { toast } from "sonner";
import type {
  ApiResponse,
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "@/types";

// ====== Query Keys ======

export const categoryKeys = {
  all: ["categories"] as const,
};

// ====== Queries ======

export function useCategories() {
  return useQuery({
    queryKey: categoryKeys.all,
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Category[]>>("/categories");
      return data.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// ====== Mutations ======

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateCategoryInput) => {
      const { data } = await api.post<ApiResponse<Category>>(
        "/categories",
        input
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      toast.success("Category created");
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || "Failed to create category";
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...input
    }: UpdateCategoryInput & { id: string }) => {
      const { data } = await api.patch<ApiResponse<Category>>(
        `/categories/${id}`,
        input
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      toast.success("Category updated");
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || "Failed to update category";
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      toast.success("Category deleted");
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || "Failed to delete category";
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    },
  });
}
