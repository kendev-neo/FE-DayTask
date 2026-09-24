"use client";

import { CalendarHeader } from "@/components/calendar/calendar-header";
import { MonthView } from "@/components/calendar/month-view";
import { WeekView } from "@/components/calendar/week-view";
import { DayView } from "@/components/calendar/day-view";
import { TaskDialog } from "@/components/tasks/task-dialog";
import { useUiStore } from "@/stores/ui-store";
import { useTasks } from "@/hooks/use-tasks";

export default function CalendarPage() {
  const activeView = useUiStore((s) => s.activeView);
  const selectedDate = useUiStore((s) => s.selectedDate);
  const { data: tasks = [], isLoading } = useTasks(selectedDate, activeView);

  return (
    <div className="flex h-full flex-col">
      <CalendarHeader />

      <div className="flex-1 overflow-auto p-4">
        {activeView === "month" && (
          <MonthView tasks={tasks} isLoading={isLoading} />
        )}
        {activeView === "week" && (
          <WeekView tasks={tasks} isLoading={isLoading} />
        )}
        {activeView === "day" && (
          <DayView tasks={tasks} isLoading={isLoading} />
        )}
      </div>

      <TaskDialog />
    </div>
  );
}
