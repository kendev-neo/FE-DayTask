"use client";

import { useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface TimePicker24hProps {
  value?: string; // Format: "HH:mm" e.g. "09:30" or ""
  onChange: (value: string) => void;
  disabled?: boolean;
  allowClear?: boolean;
  className?: string;
}

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

export function TimePicker24h({
  value,
  onChange,
  disabled = false,
  allowClear = false,
  className,
}: TimePicker24hProps) {
  const [currentHour, currentMinute] = useMemo(() => {
    if (!value || !value.includes(":")) {
      return ["", ""];
    }
    const [h, m] = value.split(":");
    return [h || "", m || ""];
  }, [value]);

  const handleHourChange = (newHour: string) => {
    if (newHour === "none") {
      onChange("");
      return;
    }
    const minute = currentMinute || "00";
    onChange(`${newHour}:${minute}`);
  };

  const handleMinuteChange = (newMinute: string) => {
    if (newMinute === "none") {
      onChange("");
      return;
    }
    const hour = currentHour || "09";
    onChange(`${hour}:${newMinute}`);
  };

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      {/* Hour Selector (00h - 23h) */}
      <div className="flex-1">
        <Select
          value={currentHour || (allowClear ? "none" : "09")}
          onValueChange={handleHourChange}
          disabled={disabled}
        >
          <SelectTrigger className="h-9 rounded-xl bg-background/50 border-border/80 text-xs font-mono font-medium px-2.5">
            <SelectValue placeholder="--h" />
          </SelectTrigger>
          <SelectContent className="max-h-56 rounded-xl border-border/80">
            {allowClear && (
              <SelectItem value="none" className="font-mono text-xs text-muted-foreground">
                --h (None)
              </SelectItem>
            )}
            {HOURS.map((hour) => (
              <SelectItem
                key={hour}
                value={hour}
                className="font-mono text-xs font-medium"
              >
                {hour}h
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <span className="text-xs font-bold font-mono text-muted-foreground/60 select-none">
        :
      </span>

      {/* Minute Selector (00m - 59m) */}
      <div className="flex-1">
        <Select
          value={currentMinute || (allowClear ? "none" : "00")}
          onValueChange={handleMinuteChange}
          disabled={disabled || (!currentHour && allowClear)}
        >
          <SelectTrigger className="h-9 rounded-xl bg-background/50 border-border/80 text-xs font-mono font-medium px-2.5">
            <SelectValue placeholder="--m" />
          </SelectTrigger>
          <SelectContent className="max-h-56 rounded-xl border-border/80">
            {allowClear && (
              <SelectItem value="none" className="font-mono text-xs text-muted-foreground">
                --m (None)
              </SelectItem>
            )}
            {MINUTES.map((minute) => (
              <SelectItem
                key={minute}
                value={minute}
                className="font-mono text-xs font-medium"
              >
                {minute}m
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
