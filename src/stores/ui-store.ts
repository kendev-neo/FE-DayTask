import { create } from "zustand";
import type { CalendarView } from "@/types";

interface UiState {
  sidebarOpen: boolean;
  activeView: CalendarView;
  selectedDate: Date;
  taskDialogOpen: boolean;
  editingTaskId: string | null;

  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setActiveView: (view: CalendarView) => void;
  setSelectedDate: (date: Date) => void;
  openTaskDialog: (taskId?: string) => void;
  closeTaskDialog: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: true,
  activeView: "month",
  selectedDate: new Date(),
  taskDialogOpen: false,
  editingTaskId: null,

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setActiveView: (view) => set({ activeView: view }),
  setSelectedDate: (date) => set({ selectedDate: date }),
  openTaskDialog: (taskId) =>
    set({ taskDialogOpen: true, editingTaskId: taskId || null }),
  closeTaskDialog: () => set({ taskDialogOpen: false, editingTaskId: null }),
}));
