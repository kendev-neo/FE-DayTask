"use client";

import Link from "next/link";
import { Calendar, ShieldCheck, Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { AnimatedGridBackground } from "@/components/ui/animated-grid-background";
import { useLanguage } from "@/hooks/use-language";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useLanguage();

  return (
    <div className="relative min-h-[100dvh] flex flex-col justify-between bg-background text-foreground overflow-x-hidden selection:bg-primary/20 selection:text-primary isolate">
      {/* Animated Grid & Ambient Glow Orbs */}
      <AnimatedGridBackground intensity="medium" />

      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/60 backdrop-blur-xl relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-105 group-hover:border-primary/40 transition-all shadow-xs">
              <Calendar className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-primary-600 via-primary-500 to-indigo-400 bg-clip-text text-transparent">
              DayTask
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageToggle />
            <ThemeToggle className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground" />
          </div>
        </div>
      </header>

      {/* Centered Auth Card Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 md:py-12 relative z-10">
        <div className="w-full max-w-md">{children}</div>
      </main>

      {/* Footer info */}
      <footer className="py-4 text-center text-xs text-muted-foreground border-t border-border/40 bg-background/50 backdrop-blur-md relative z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6">
          <span className="inline-flex items-center gap-1.5 opacity-85">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            {t.auth.footerSecurity}
          </span>
          <span className="hidden sm:inline opacity-30">•</span>
          <span className="inline-flex items-center gap-1.5 opacity-85">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            {t.auth.footerSync}
          </span>
        </div>
      </footer>
    </div>
  );
}
