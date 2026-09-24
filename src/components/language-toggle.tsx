"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

interface LanguageToggleProps {
  className?: string;
  variant?: "icon" | "button";
}

export function LanguageToggle({ className, variant = "icon" }: LanguageToggleProps) {
  const { language, setLanguage } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleLanguage = () => {
    const nextLang = language === "en" ? "vi" : "en";
    setLanguage(nextLang);
  };

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className={className || "h-9 w-9 rounded-xl text-muted-foreground"}
        disabled
      >
        <Globe className="h-4 w-4" />
      </Button>
    );
  }

  if (variant === "button") {
    return (
      <button
        type="button"
        onClick={toggleLanguage}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border/70 bg-card/60 hover:bg-accent/70 text-xs font-semibold transition-all duration-200 shadow-2xs hover:shadow-xs active:scale-95 ${className || ""}`}
        title={language === "en" ? "Switch to Tiếng Việt" : "Chuyển sang English"}
      >
        <Globe className="h-3.5 w-3.5 text-primary" />
        <span>{language === "en" ? "EN" : "VI"}</span>
        <span className="text-[10px] text-muted-foreground font-normal">
          ({language === "en" ? "English" : "Tiếng Việt"})
        </span>
      </button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className={
        className ||
        "h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-all active:scale-95 relative"
      }
      onClick={toggleLanguage}
      title={language === "en" ? "Switch to Tiếng Việt" : "Chuyển sang English"}
      aria-label="Toggle Language"
    >
      <Globe className="h-4 w-4 text-primary/80" />
      <span className="absolute -bottom-0.5 -right-0.5 text-[8px] font-bold tracking-tight uppercase bg-primary/20 text-primary px-1 rounded-sm border border-primary/30">
        {language}
      </span>
    </Button>
  );
}
