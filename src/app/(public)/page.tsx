"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  Circle,
  ArrowRight,
  Sparkles,
  Layers,
  Zap,
  Shield,
  ChevronRight,
  Repeat,
  MousePointerClick,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { AnimatedGridBackground } from "@/components/ui/animated-grid-background";
import { useAuthStore } from "@/stores/auth-store";
import { useLanguage } from "@/hooks/use-language";

// Mock interactive tasks for the live preview widget
interface MockTask {
  id: string;
  time: string;
  color: string;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
}

const INITIAL_TASK_CONFIGS: MockTask[] = [
  {
    id: "1",
    time: "09:00 - 10:30",
    color: "#6366f1",
    status: "done",
    priority: "high",
  },
  {
    id: "2",
    time: "11:00 - 12:30",
    color: "#ec4899",
    status: "in_progress",
    priority: "medium",
  },
  {
    id: "3",
    time: "14:00 - 14:45",
    color: "#6366f1",
    status: "todo",
    priority: "medium",
  },
  {
    id: "4",
    time: "17:30 - 18:30",
    color: "#10b981",
    status: "todo",
    priority: "low",
  },
];

export default function LandingPage() {
  const user = useAuthStore((s) => s.user);
  const { t } = useLanguage();
  const [tasks, setTasks] = useState<MockTask[]>(INITIAL_TASK_CONFIGS);
  const [activeTab, setActiveTab] = useState<"day" | "week" | "month">("day");

  const toggleTaskStatus = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const nextStatus: Record<MockTask["status"], MockTask["status"]> = {
          todo: "in_progress",
          in_progress: "done",
          done: "todo",
        };
        return { ...t, status: nextStatus[t.status] };
      })
    );
  };

  const getTaskContent = (id: string) => {
    switch (id) {
      case "1":
        return {
          title: t.landing.previewMockTask1,
          category: t.landing.previewCategoryWork,
        };
      case "2":
        return {
          title: t.landing.previewMockTask2,
          category: t.landing.previewCategoryDesign,
        };
      case "3":
        return {
          title: t.landing.previewMockTask3,
          category: t.landing.previewCategoryWork,
        };
      case "4":
        return {
          title: t.landing.previewMockTask4,
          category: t.landing.previewCategoryPersonal,
        };
      default:
        return {
          title: "",
          category: "",
        };
    }
  };

  const completedCount = tasks.filter((t) => t.status === "done").length;
  const progressPercent = Math.round((completedCount / tasks.length) * 100);

  return (
    <div className="relative min-h-[100dvh] bg-background text-foreground flex flex-col selection:bg-primary/20 selection:text-primary overflow-x-hidden isolate">
      {/* Animated Grid & Glow Background */}
      <AnimatedGridBackground intensity="medium" />

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-105 group-hover:border-primary/40 transition-all shadow-xs">
              <CalendarIcon className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-primary-600 via-primary-500 to-indigo-400 bg-clip-text text-transparent">
              DayTask
            </span>
          </Link>

          <nav className="flex items-center gap-2 sm:gap-3">
            <LanguageToggle />
            <ThemeToggle className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground" />

            {user ? (
              <Link href="/dashboard">
                <Button size="sm" className="rounded-xl shadow-sm">
                  {t.landing.goToDashboard}
                  <ArrowRight className="h-4 w-4 ml-1.5" />
                </Button>
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="rounded-xl hover:bg-accent/60">
                    {t.landing.signIn}
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="rounded-xl shadow-sm bg-primary hover:bg-primary/90">
                    {t.landing.getStarted}
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="flex-1 relative z-10">
        <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-6">
              {/* Eyebrow badge with glow */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-md text-xs font-medium text-primary shadow-xs"
              >
                <Sparkles className="h-3.5 w-3.5 text-primary animate-spin-slow" />
                <span>{t.landing.heroBadge}</span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
              </motion.div>

              {/* Main Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1]"
              >
                {t.landing.heroTitleLine1}
                <span className="bg-gradient-to-r from-primary via-indigo-500 to-cyan-400 bg-clip-text text-transparent">
                  {t.landing.heroTitleHighlight}
                </span>
              </motion.h1>

              {/* Subtext */}
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
                className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-[55ch] mx-auto"
              >
                {t.landing.heroSubtitle}
              </motion.p>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="flex flex-wrap items-center justify-center gap-3 pt-2"
              >
                <Link href="/register">
                  <Button size="lg" className="rounded-xl px-7 h-12 text-sm font-medium shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/25 transition-all active:scale-[0.98]">
                    {t.landing.heroCtaFree}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button
                    variant="outline"
                    size="lg"
                    className="rounded-xl px-7 h-12 text-sm font-medium border-border/80 hover:bg-accent/80 backdrop-blur-sm active:scale-[0.98]"
                  >
                    {t.landing.heroCtaDemo}
                  </Button>
                </Link>
              </motion.div>

              {/* Feature Highlights Badges */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-wrap items-center justify-center gap-4 pt-4 text-xs text-muted-foreground"
              >
                <span className="flex items-center gap-1.5 bg-card/60 border border-border/60 px-3 py-1 rounded-lg backdrop-blur-xs">
                  <Repeat className="h-3.5 w-3.5 text-primary" /> {t.landing.badgeRollover}
                </span>
                <span className="flex items-center gap-1.5 bg-card/60 border border-border/60 px-3 py-1 rounded-lg backdrop-blur-xs">
                  <MousePointerClick className="h-3.5 w-3.5 text-indigo-400" /> {t.landing.badgeDragDrop}
                </span>
                <span className="flex items-center gap-1.5 bg-card/60 border border-border/60 px-3 py-1 rounded-lg backdrop-blur-xs">
                  <Zap className="h-3.5 w-3.5 text-amber-500" /> {t.landing.badgeRealtime}
                </span>
              </motion.div>
            </div>

            {/* Interactive Live App Preview Widget */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="relative mt-12 max-w-4xl mx-auto rounded-2xl border border-border/80 bg-card/80 backdrop-blur-xl shadow-2xl overflow-hidden ring-1 ring-primary/10"
            >
              {/* Subtle top edge glow on widget */}
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

              {/* Mock App Window Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 bg-muted/40 backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-rose-500/80" />
                  <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                  <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 text-xs font-mono text-muted-foreground">
                    {t.landing.previewTitle}
                  </span>
                </div>

                {/* View switcher tabs */}
                <div className="flex items-center bg-background/80 rounded-lg p-0.5 border border-border/60 text-xs">
                  {(["day", "week", "month"] as const).map((view) => (
                    <button
                      key={view}
                      onClick={() => setActiveTab(view)}
                      className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                        activeTab === view
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {view === "day"
                        ? t.landing.previewDay
                        : view === "week"
                        ? t.landing.previewWeek
                        : t.landing.previewMonth}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mock App Content */}
              <div className="p-4 sm:p-6 space-y-6">
                {/* Stats Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 p-3.5 rounded-xl bg-primary/5 border border-primary/15 backdrop-blur-xs">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center font-bold text-sm border border-primary/20">
                      {completedCount}/{tasks.length}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{t.landing.previewFocusTitle}</p>
                      <p className="text-xs text-muted-foreground">
                        {completedCount === tasks.length
                          ? t.landing.previewFocusAllDone
                          : `${tasks.length - completedCount} ${t.landing.previewFocusRemaining}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="h-2.5 w-32 bg-muted/80 rounded-full overflow-hidden flex-1 sm:flex-initial">
                      <motion.div
                        className="h-full bg-gradient-to-r from-primary to-indigo-500"
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <span className="text-xs font-mono font-medium text-muted-foreground">
                      {progressPercent}%
                    </span>
                  </div>
                </div>

                {/* Interactive Task Cards List */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                    <span>{t.landing.previewHint}</span>
                    <span>4 {t.landing.previewScheduledItems}</span>
                  </div>

                  <AnimatePresence>
                    {tasks.map((task) => {
                      const isDone = task.status === "done";
                      const isInProgress = task.status === "in_progress";
                      const content = getTaskContent(task.id);

                      return (
                        <motion.div
                          key={task.id}
                          layout
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`group flex items-center justify-between gap-3 p-3.5 rounded-xl border transition-all ${
                            isDone
                              ? "bg-muted/20 border-border/40 opacity-70"
                              : isInProgress
                              ? "bg-primary/5 border-primary/30 shadow-xs"
                              : "bg-card/90 border-border/80 hover:border-primary/40 hover:shadow-xs"
                          }`}
                          style={{
                            borderLeftWidth: "4px",
                            borderLeftColor: task.color,
                          }}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <button
                              onClick={() => toggleTaskStatus(task.id)}
                              className="shrink-0 text-muted-foreground hover:text-primary transition-colors focus:outline-none"
                              title={t.landing.previewHint}
                            >
                              {isDone ? (
                                <CheckCircle2 className="h-5 w-5 text-emerald-500 fill-emerald-500/20" />
                              ) : isInProgress ? (
                                <Clock className="h-5 w-5 text-primary animate-pulse" />
                              ) : (
                                <Circle className="h-5 w-5 hover:scale-110 transition-transform" />
                              )}
                            </button>

                            <div className="min-w-0">
                              <p
                                className={`text-sm font-medium truncate ${
                                  isDone
                                    ? "line-through text-muted-foreground"
                                    : "text-foreground"
                                }`}
                              >
                                {content.title}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                                <span>{task.time}</span>
                                <span>•</span>
                                <span
                                  className="inline-block h-2 w-2 rounded-full"
                                  style={{ backgroundColor: task.color }}
                                />
                                <span>{content.category}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[11px] font-medium capitalize ${
                                task.priority === "high"
                                  ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                                  : task.priority === "medium"
                                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                                  : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                              }`}
                            >
                              {task.priority === "high"
                                ? t.taskDialog.highPriority
                                : task.priority === "medium"
                                ? t.taskDialog.mediumPriority
                                : t.taskDialog.lowPriority}
                            </span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Feature Bento Grid Section */}
        <section className="py-16 md:py-20 border-t border-border/50 bg-muted/20 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <h2 className="text-3xl font-bold tracking-tight">
                {t.landing.featuresSectionTitle}
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base">
                {t.landing.featuresSectionSubtitle}
              </p>
            </div>

            {/* 3 Bento Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-2xl border border-border/80 bg-card/80 backdrop-blur-md p-6 space-y-3 hover:shadow-lg hover:border-primary/30 transition-all group">
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Layers className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold">{t.landing.feature1Title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t.landing.feature1Desc}
                </p>
              </div>

              <div className="rounded-2xl border border-border/80 bg-card/80 backdrop-blur-md p-6 space-y-3 hover:shadow-lg hover:border-pink-500/30 transition-all group">
                <div className="h-10 w-10 rounded-xl bg-pink-500/10 text-pink-500 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Zap className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold">{t.landing.feature2Title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t.landing.feature2Desc}
                </p>
              </div>

              <div className="rounded-2xl border border-border/80 bg-card/80 backdrop-blur-md p-6 space-y-3 hover:shadow-lg hover:border-emerald-500/30 transition-all group">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Shield className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold">{t.landing.feature3Title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t.landing.feature3Desc}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to action banner */}
        <section className="py-16 bg-gradient-to-b from-background via-primary/5 to-background border-t border-border/50 relative">
          <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">
              {t.landing.ctaSectionTitle}
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
              {t.landing.ctaSectionSubtitle}
            </p>
            <div className="pt-2">
              <Link href="/register">
                <Button size="lg" className="rounded-xl px-8 h-12 text-sm font-medium shadow-md shadow-primary/25 hover:shadow-lg transition-all">
                  {t.landing.ctaButton}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 bg-card/40 backdrop-blur-md text-xs text-muted-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-primary" />
            <span className="font-semibold text-foreground">DayTask</span>
            <span>- {t.landing.footerTagline}</span>
          </div>
          <p>{t.landing.footerCopyright}</p>
        </div>
      </footer>
    </div>
  );
}
