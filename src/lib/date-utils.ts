import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addDays,
  addWeeks,
  addMonths,
  subDays,
  subWeeks,
  subMonths,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  eachDayOfInterval,
  eachHourOfInterval,
  getHours,
  getMinutes,
  parseISO,
  differenceInMinutes,
  setHours,
  setMinutes,
} from "date-fns";
import { toZonedTime, fromZonedTime } from "date-fns-tz";
import type { CalendarView } from "@/types";

// ====== Navigation ======

export function navigateDate(
  date: Date,
  view: CalendarView,
  direction: "prev" | "next"
): Date {
  const fn = direction === "next"
    ? { day: addDays, week: addWeeks, month: addMonths }
    : { day: subDays, week: subWeeks, month: subMonths };

  return fn[view](date, 1);
}

export function getViewTitle(date: Date, view: CalendarView): string {
  switch (view) {
    case "day":
      return format(date, "EEEE, MMMM d, yyyy");
    case "week": {
      const start = startOfWeek(date, { weekStartsOn: 1 });
      const end = endOfWeek(date, { weekStartsOn: 1 });
      if (start.getMonth() === end.getMonth()) {
        return `${format(start, "MMMM d")} – ${format(end, "d, yyyy")}`;
      }
      return `${format(start, "MMM d")} – ${format(end, "MMM d, yyyy")}`;
    }
    case "month":
      return format(date, "MMMM yyyy");
  }
}

// ====== Date Range for API queries ======

export function getDateRange(
  date: Date,
  view: CalendarView
): { startDate: string; endDate: string } {
  let start: Date;
  let end: Date;

  switch (view) {
    case "day":
      start = startOfDay(date);
      end = endOfDay(date);
      break;
    case "week":
      start = startOfWeek(date, { weekStartsOn: 1 });
      end = endOfWeek(date, { weekStartsOn: 1 });
      break;
    case "month":
      // Include days from prev/next month visible in the calendar grid
      start = startOfWeek(startOfMonth(date), { weekStartsOn: 1 });
      end = endOfWeek(endOfMonth(date), { weekStartsOn: 1 });
      break;
  }

  return {
    startDate: start.toISOString(),
    endDate: end.toISOString(),
  };
}

// ====== Calendar Grid Helpers ======

export function getMonthDays(date: Date): Date[] {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  return eachDayOfInterval({ start: gridStart, end: gridEnd });
}

export function getWeekDays(date: Date): Date[] {
  const weekStart = startOfWeek(date, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
  return eachDayOfInterval({ start: weekStart, end: weekEnd });
}

export function getHourSlots(date: Date): Date[] {
  return eachHourOfInterval({
    start: startOfDay(date),
    end: setMinutes(setHours(date, 23), 0),
  });
}

// ====== Task Position Calculations ======

export function getTaskTopPercent(startTime: string): number {
  const d = parseISO(startTime);
  return ((getHours(d) * 60 + getMinutes(d)) / (24 * 60)) * 100;
}

export function getTaskHeightPercent(
  startTime: string,
  endTime: string | null
): number {
  if (!endTime) return (60 / (24 * 60)) * 100; // default 1 hour
  const minutes = differenceInMinutes(parseISO(endTime), parseISO(startTime));
  return Math.max((minutes / (24 * 60)) * 100, (15 / (24 * 60)) * 100); // min 15min
}

// ====== Format Helpers ======

export function formatTime(dateStr: string): string {
  return format(parseISO(dateStr), "HH:mm");
}

export function formatTimeRange(
  startTime: string,
  endTime: string | null
): string {
  const start = formatTime(startTime);
  if (!endTime) return start;
  return `${start} – ${formatTime(endTime)}`;
}

export function formatDuration(
  startTime: string,
  endTime: string | null
): string | null {
  if (!endTime) return null;
  const start = parseISO(startTime);
  const end = parseISO(endTime);
  const totalMinutes = differenceInMinutes(end, start);
  if (totalMinutes <= 0) return null;

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (hours > 0) {
    return `${hours}h`;
  }
  return `${minutes}m`;
}

export function formatShortDate(date: Date): string {
  return format(date, "MMM d");
}

// ====== Re-exports ======

export {
  format,
  parseISO,
  isSameDay,
  isSameMonth,
  isToday,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  getHours,
  getMinutes,
  toZonedTime,
  fromZonedTime,
};
