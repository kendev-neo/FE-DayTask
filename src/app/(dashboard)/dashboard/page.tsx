"use client";

import { useState } from "react";
import { motion, type Variants } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  CheckSquare,
  TrendingUp,
  RotateCw,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/stat-card";
import { ActivityHeatmap } from "@/components/dashboard/activity-heatmap";
import { PriorityBreakdownCard } from "@/components/dashboard/priority-breakdown-card";
import { CategoryBreakdownCard } from "@/components/dashboard/category-breakdown-card";
import { useTaskStats } from "@/hooks/use-task-stats";
import { useAuthStore } from "@/stores/auth-store";
import { useLanguage } from "@/hooks/use-language";

export default function DashboardPage() {
  const { data: stats, isLoading, refetch, isRefetching } = useTaskStats();
  const user = useAuthStore((s) => s.user);
  const { t } = useLanguage();
  const [refreshSpin, setRefreshSpin] = useState(false);

  const handleRefresh = async () => {
    setRefreshSpin(true);
    await refetch();
    setTimeout(() => setRefreshSpin(false), 600);
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.05,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {t.dashboard.greeting.hello},{" "}
              <span className="bg-gradient-to-r from-primary via-primary/80 to-indigo-400 bg-clip-text text-transparent">
                {user?.displayName || t.dashboard.greeting.user}
              </span>{" "}
              👋
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-primary shrink-0" />
            {t.dashboard.greeting.subtitle}
          </p>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefetching}
            className="h-9 rounded-xl border-border/70 hover:bg-accent text-xs font-medium gap-1.5 shadow-xs"
          >
            <RotateCw
              className={`h-3.5 w-3.5 ${
                refreshSpin || isRefetching ? "animate-spin" : ""
              }`}
            />
            <span>{t.dashboard.actions.refresh}</span>
          </Button>
        </div>
      </div>

      {isLoading ? (
        /* Loading Skeleton View */
        <div className="space-y-6 animate-pulse">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-32 rounded-2xl bg-muted/40 border border-border/40"
              />
            ))}
          </div>
          <div className="h-64 rounded-2xl bg-muted/40 border border-border/40" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-72 rounded-2xl bg-muted/40 border border-border/40" />
            <div className="h-72 rounded-2xl bg-muted/40 border border-border/40" />
          </div>
        </div>
      ) : !stats ? null : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-6"
        >
          {/* 1. KPI Metric Summary Cards */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {/* Total Tasks */}
            <StatCard
              title={t.dashboard.metrics.totalTasks}
              value={stats.summary.total}
              subtitle={`${stats.summary.completed} ${t.dashboard.metrics.doneUnit}`}
              icon={CheckSquare}
              iconColor="text-primary"
              iconBg="bg-primary/10 border-primary/20"
              badge={{
                text: `${stats.summary.todo} ${t.dashboard.metrics.todo}`,
                variant: "default",
              }}
              delay={0}
            />

            {/* Completed Tasks */}
            <StatCard
              title={t.dashboard.metrics.completedTasks}
              value={stats.summary.completed}
              subtitle={`${stats.activity.totalCompletedThisWeek} ${t.dashboard.metrics.thisWeek}`}
              icon={CheckCircle2}
              iconColor="text-emerald-600 dark:text-emerald-400"
              iconBg="bg-emerald-500/10 border-emerald-500/20"
              badge={{
                text: `+${stats.activity.totalCompletedThisMonth} ${t.dashboard.metrics.thisMonth}`,
                variant: "success",
              }}
              delay={0.05}
            />

            {/* Pending Tasks */}
            <StatCard
              title={t.dashboard.metrics.pendingTasks}
              value={stats.summary.pending}
              subtitle={`${stats.summary.inProgress} ${t.dashboard.metrics.inProgress}`}
              icon={Clock}
              iconColor="text-amber-600 dark:text-amber-400"
              iconBg="bg-amber-500/10 border-amber-500/20"
              badge={{
                text: `${stats.summary.todo} ${t.dashboard.metrics.todo}`,
                variant: "warning",
              }}
              delay={0.1}
            />

            {/* Completion Rate */}
            <StatCard
              title={t.dashboard.metrics.completionRate}
              value={stats.summary.completionRate}
              suffix="%"
              subtitle={`${stats.activity.currentStreak} ${t.dashboard.heatmap.daysStreak}`}
              icon={TrendingUp}
              iconColor="text-sky-600 dark:text-sky-400"
              iconBg="bg-sky-500/10 border-sky-500/20"
              badge={{
                text:
                  stats.summary.completionRate >= 80
                    ? "✨ " + t.dashboard.metrics.excellent
                    : stats.summary.completionRate >= 50
                      ? "⚡ " + t.dashboard.metrics.good
                      : "🎯 " + t.dashboard.metrics.keepGoing,
                variant: "info",
              }}
              delay={0.15}
            />
          </motion.div>

          {/* 2. GitHub-style Contribution Heatmap */}
          <motion.div variants={itemVariants}>
            <ActivityHeatmap
              activityMap={stats.activity.activityMap}
              currentStreak={stats.activity.currentStreak}
              longestStreak={stats.activity.longestStreak}
              totalCompletedYear={stats.activity.totalCompletedYear}
            />
          </motion.div>

          {/* 3. Priority Breakdown & Category Distribution */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <PriorityBreakdownCard
              priorityBreakdown={stats.priorityBreakdown}
              delay={0.2}
            />
            <CategoryBreakdownCard
              categoryBreakdown={stats.categoryBreakdown}
              delay={0.25}
            />
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
