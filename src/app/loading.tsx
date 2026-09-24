export default function Loading() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background/80 backdrop-blur-md relative overflow-hidden">
      {/* Background glowing gradients */}
      <div className="absolute -top-32 -left-32 h-80 w-80 rounded-full bg-primary/15 blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

      <div className="relative flex flex-col items-center gap-5 p-8 rounded-3xl border border-border/70 bg-card/60 backdrop-blur-xl shadow-2xl max-w-xs w-full text-center">
        {/* Animated Brand Icon / Spinner */}
        <div className="relative flex items-center justify-center">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/25 flex items-center justify-center shadow-inner">
            <span className="text-2xl font-black tracking-tight text-primary">D</span>
          </div>
          <div className="absolute -inset-1 rounded-2xl border-2 border-primary/40 border-t-transparent animate-spin" />
        </div>

        {/* Text & Pulsing Bar */}
        <div className="space-y-2 w-full">
          <h3 className="text-sm font-bold text-foreground tracking-tight">DayTask</h3>
          <p className="text-xs text-muted-foreground font-medium animate-pulse">
            Loading your workspace...
          </p>

          <div className="w-full bg-muted/60 h-1.5 rounded-full overflow-hidden mt-3">
            <div className="h-full w-2/3 bg-gradient-to-r from-primary/80 to-primary rounded-full animate-[pulse_1.5s_ease-in-out_infinite]" />
          </div>
        </div>
      </div>
    </div>
  );
}
