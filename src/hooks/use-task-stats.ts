import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { ApiResponse, DashboardStatsResponse } from "@/types";

export function useTaskStats(year?: number) {
  return useQuery({
    queryKey: ["tasks", "stats", year],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<DashboardStatsResponse>>("/tasks/stats", {
        params: year ? { year } : undefined,
      });
      return data.data;
    },
    staleTime: 30 * 1000, // 30 seconds
  });
}
