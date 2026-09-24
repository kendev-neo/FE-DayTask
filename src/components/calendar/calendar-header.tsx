"use client";

import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  CalendarDays,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUiStore } from "@/stores/ui-store";
import { useLanguage } from "@/hooks/use-language";
import { navigateDate, getViewTitle } from "@/lib/date-utils";
import type { CalendarView } from "@/types";

export function CalendarHeader() {
  const activeView = useUiStore((s) => s.activeView);
  const selectedDate = useUiStore((s) => s.selectedDate);
  const setActiveView = useUiStore((s) => s.setActiveView);
  const setSelectedDate = useUiStore((s) => s.setSelectedDate);
  const openTaskDialog = useUiStore((s) => s.openTaskDialog);
  const { t } = useLanguage();

  const title = getViewTitle(selectedDate, activeView);

  const handlePrev = () => {
    setSelectedDate(navigateDate(selectedDate, activeView, "prev"));
  };

  const handleNext = () => {
    setSelectedDate(navigateDate(selectedDate, activeView, "next"));
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-4 border-b border-border/70 px-3 sm:px-6 py-2.5 sm:py-3.5 bg-card/40 backdrop-blur-md shrink-0">
      {/* Left: Navigation and Date Title */}
      <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
        <Button
          variant="outline"
          size="sm"
          onClick={handleToday}
          className="rounded-xl h-8 sm:h-9 px-2 sm:px-3 text-xs font-medium border-border/80 hover:bg-accent shrink-0"
        >
          <CalendarDays className="h-3.5 w-3.5 sm:mr-1.5 text-primary" />
          <span className="hidden sm:inline">{t.calendar.todayButton}</span>
        </Button>

        <div className="flex items-center rounded-xl border border-border/80 bg-background/50 p-0.5 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-6.5 w-6.5 sm:h-7 sm:w-7 rounded-lg text-muted-foreground hover:text-foreground"
            onClick={handlePrev}
            title="Previous"
          >
            <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6.5 w-6.5 sm:h-7 sm:w-7 rounded-lg text-muted-foreground hover:text-foreground"
            onClick={handleNext}
            title="Next"
          >
            <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Button>
        </div>

        <motion.h2
          key={title}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="text-sm sm:text-base md:text-lg font-bold tracking-tight text-foreground truncate"
        >
          {title}
        </motion.h2>
      </div>

      {/* Right: View switcher tabs & Add Task CTA */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        <Tabs
          value={activeView}
          onValueChange={(v) => setActiveView(v as CalendarView)}
        >
          <TabsList className="bg-muted/60 p-0.5 sm:p-1 rounded-xl h-8 sm:h-9">
            <TabsTrigger
              value="day"
              className="rounded-lg text-[11px] sm:text-xs font-medium px-2 sm:px-3 data-[state=active]:bg-background data-[state=active]:shadow-xs"
            >
              {t.calendar.day}
            </TabsTrigger>
            <TabsTrigger
              value="week"
              className="rounded-lg text-[11px] sm:text-xs font-medium px-2 sm:px-3 data-[state=active]:bg-background data-[state=active]:shadow-xs"
            >
              {t.calendar.week}
            </TabsTrigger>
            <TabsTrigger
              value="month"
              className="rounded-lg text-[11px] sm:text-xs font-medium px-2 sm:px-3 data-[state=active]:bg-background data-[state=active]:shadow-xs"
            >
              {t.calendar.month}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Button
          size="sm"
          onClick={() => openTaskDialog()}
          className="rounded-xl h-8 sm:h-9 px-2.5 sm:px-4 text-xs font-medium shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
        >
          <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-1.5" />
          <span className="hidden sm:inline">{t.nav.newTask}</span>
        </Button>
      </div>
    </div>
  );
}
