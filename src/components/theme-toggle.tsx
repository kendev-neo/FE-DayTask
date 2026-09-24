"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? (resolvedTheme || theme) === "dark" : false;
  // Hien thi nut co shadow, hover sac net
  return (
    <Button
      variant="ghost"
      size="icon"
      className={
        className ||
        "h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground"
      }
      onClick={() => setTheme(isDark ? "light" : "dark")}
      title="Toggle light / dark mode"
      aria-label="Toggle light / dark mode"
    >
      {mounted ? (
        isDark ? (
          <Sun className="h-4 w-4 transition-transform hover:rotate-45" />
        ) : (
          <Moon className="h-4 w-4 transition-transform hover:-rotate-12" />
        )
      ) : (
        <span className="h-4 w-4 block" />
      )}
    </Button>
  );
}
