"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Compass, ArrowLeft, Calendar, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/use-language";

export default function NotFound() {
  const router = useRouter();
  const { t } = useLanguage();

  return (
    <div className="flex min-h-[100dvh] w-full flex-col items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 h-64 w-64 rounded-full bg-primary/5 blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center max-w-md w-full text-center space-y-6 p-6 sm:p-8 rounded-3xl border border-border/80 bg-card/60 backdrop-blur-xl shadow-2xl">
        {/* Visual 404 Badge */}
        <div className="relative flex items-center justify-center">
          <div className="h-24 w-24 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-inner">
            <Compass className="h-12 w-12 stroke-[1.75] animate-[spin_10s_linear_infinite]" />
          </div>
          <span className="absolute -top-2 -right-2 px-2.5 py-1 rounded-full bg-primary text-primary-foreground text-xs font-black shadow-md">
            404
          </span>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            {t.notFound.headline}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {t.notFound.description}
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full pt-2">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="w-full sm:w-1/2 rounded-xl h-10 text-xs font-semibold border-border/80 hover:bg-accent/60"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
            {t.notFound.goBack}
          </Button>

          <Button
            asChild
            className="w-full sm:w-1/2 rounded-xl h-10 text-xs font-semibold shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
          >
            <Link href="/calendar">
              <Calendar className="h-3.5 w-3.5 mr-1.5" />
              {t.notFound.backToCalendar}
            </Link>
          </Button>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="mt-8 flex items-center gap-1.5 text-xs text-muted-foreground/60 font-mono">
        <Sparkles className="h-3.5 w-3.5 text-primary/60" />
        <span>DayTask Workspace</span>
      </div>
    </div>
  );
}
