"use client";

import { useMemo } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { translations, type Language, type TranslationKeys } from "@/lib/i18n/translations";

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: "en",
      setLanguage: (language: Language) => set({ language }),
    }),
    { name: "daytask-language" }
  )
);

// ponytail: `t` derived from `language` — never stored in state.
// Hook signature unchanged so consumers don't break.
export function useLanguage(): { language: Language; setLanguage: (lang: Language) => void; t: TranslationKeys } {
  const language = useLanguageStore((s) => s.language);
  const setLanguage = useLanguageStore((s) => s.setLanguage);
  const t = useMemo(() => translations[language], [language]);
  return { language, setLanguage, t };
}
