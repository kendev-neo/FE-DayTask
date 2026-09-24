"use client";

import { useEffect, useState, useCallback } from "react";
import {
  ColorThemeId,
  COLOR_THEME_KEY,
  DEFAULT_COLOR_THEME,
  COLOR_THEME_PRESETS,
  applyColorTheme,
} from "@/lib/color-theme";

export function useColorTheme() {
  const [colorTheme, setColorThemeState] = useState<ColorThemeId>(DEFAULT_COLOR_THEME);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(COLOR_THEME_KEY) as ColorThemeId | null;
      if (saved && COLOR_THEME_PRESETS.some((p) => p.id === saved)) {
        setColorThemeState(saved);
        applyColorTheme(saved);
      } else {
        setColorThemeState(DEFAULT_COLOR_THEME);
        applyColorTheme(DEFAULT_COLOR_THEME);
      }
    } catch {
      // localStorage may fail in restricted contexts
    }
    setMounted(true);
  }, []);

  const setColorTheme = useCallback((newTheme: ColorThemeId) => {
    setColorThemeState(newTheme);
    applyColorTheme(newTheme);
    try {
      localStorage.setItem(COLOR_THEME_KEY, newTheme);
      // Dispatch storage event so other tabs or listeners update
      window.dispatchEvent(
        new CustomEvent("daytask:color-theme-change", { detail: newTheme })
      );
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    const handleCustomEvent = (e: Event) => {
      const customEvent = e as CustomEvent<ColorThemeId>;
      if (customEvent.detail) {
        setColorThemeState(customEvent.detail);
        applyColorTheme(customEvent.detail);
      }
    };

    window.addEventListener("daytask:color-theme-change", handleCustomEvent);
    return () => {
      window.removeEventListener("daytask:color-theme-change", handleCustomEvent);
    };
  }, []);

  return {
    colorTheme,
    setColorTheme,
    presets: COLOR_THEME_PRESETS,
    mounted,
  };
}
