"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getSocket } from "@/lib/socket";

export function TaskNotifier() {
  const queryClient = useQueryClient();

  useEffect(() => {
    let cancelled = false;
    let sock: Awaited<ReturnType<typeof getSocket>> = null;

    // Request browser notification permissions if supported
    if (
      typeof window !== "undefined" &&
      "Notification" in window &&
      Notification.permission === "default"
    ) {
      Notification.requestPermission();
    }

    // When task automatically transitions to in_progress via scheduler
    const handleTaskStarted = (data: { task: any; message: string }) => {
      // Invalidate query tasks to refresh UI
      queryClient.invalidateQueries({ queryKey: ["tasks"] });

      // Sonner toast notification
      toast.info(data.message || `Task "${data.task?.title}" has started!`, {
        description: "Status automatically moved to 'In Progress'.",
        duration: 8000,
        action: {
          label: "View",
          onClick: () => {
            // Scroll to task or open details
          },
        },
      });

      // Browser push notification if tab is in background
      if (
        typeof window !== "undefined" &&
        "Notification" in window &&
        Notification.permission === "granted"
      ) {
        try {
          new Notification("DayTask — Task Started!", {
            body: data.message || `Task "${data.task?.title}" has started.`,
            icon: "/favicon.ico",
          });
        } catch {
          // Ignore notification errors in some browser contexts
        }
      }
    };

    // When task is created, updated, or deleted across tabs/devices
    const handleTaskUpdated = () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    };

    const handleTaskCreated = () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    };

    const handleTaskDeleted = () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    };

    getSocket().then((s) => {
      if (cancelled || !s) return;
      sock = s;
      s.on("task:started", handleTaskStarted);
      s.on("task:created", handleTaskCreated);
      s.on("task:updated", handleTaskUpdated);
      s.on("task:deleted", handleTaskDeleted);
    });

    return () => {
      cancelled = true;
      if (sock) {
        sock.off("task:started", handleTaskStarted);
        sock.off("task:created", handleTaskCreated);
        sock.off("task:updated", handleTaskUpdated);
        sock.off("task:deleted", handleTaskDeleted);
      }
    };
  }, [queryClient]);

  return null;
}
