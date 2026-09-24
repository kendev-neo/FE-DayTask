"use client";

import React from "react";

interface AnimatedGridBackgroundProps {
  className?: string;
  showOrbs?: boolean;
  intensity?: "subtle" | "medium" | "strong";
}

export function AnimatedGridBackground({
  className = "",
  showOrbs = true,
  intensity = "medium",
}: AnimatedGridBackgroundProps) {
  const opacityMap = {
    subtle: {
      grid: "opacity-35 dark:opacity-25",
      dots: "opacity-25 dark:opacity-20",
      orbs: 0.4,
    },
    medium: {
      grid: "opacity-60 dark:opacity-50",
      dots: "opacity-45 dark:opacity-40",
      orbs: 0.6,
    },
    strong: {
      grid: "opacity-85 dark:opacity-75",
      dots: "opacity-70 dark:opacity-60",
      orbs: 0.8,
    },
  };

  const selected = opacityMap[intensity];

  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden z-0 select-none [contain:paint] ${className}`}
      aria-hidden="true"
    >
      {/* 1. Precision SVG Grid Mesh with Crosslines */}
      <svg
        className={`absolute inset-0 h-full w-full stroke-primary/20 dark:stroke-primary/25 [mask-image:radial-gradient(100%_100%_at_50%_35%,white_30%,transparent_90%)] ${selected.grid}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="grid-pattern"
            width="48"
            height="48"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M.5 48V.5H48"
              fill="none"
              strokeWidth="1"
              strokeDasharray="0"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" strokeWidth="0" fill="url(#grid-pattern)" />
      </svg>

      {/* 2. Dotted Coordinate Matrix Texture */}
      <svg
        className={`absolute inset-0 h-full w-full [mask-image:radial-gradient(85%_70%_at_50%_45%,white_20%,transparent_85%)] ${selected.dots}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="dots-pattern"
            width="24"
            height="24"
            patternUnits="userSpaceOnUse"
          >
            <circle
              cx="2"
              cy="2"
              r="1.2"
              className="fill-indigo-500/40 dark:fill-cyan-400/40"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" strokeWidth="0" fill="url(#dots-pattern)" />
      </svg>

      {/* 3. Hardware-Accelerated Floating Glowing Orbs (Pure CSS GPU Composited) */}
      {showOrbs && (
        <div
          style={{ opacity: selected.orbs }}
          className="transition-opacity duration-300 pointer-events-none motion-reduce:hidden"
        >
          {/* Top Center Primary / Indigo Glow Orb */}
          <div
            className="animate-orb-1 absolute -top-24 left-1/2 -translate-x-1/2 w-[580px] h-[380px] rounded-full bg-gradient-to-br from-primary/35 via-indigo-600/25 to-purple-600/20 blur-3xl will-change-transform"
          />

          {/* Left Cyan / Sky Glow Orb */}
          <div
            className="animate-orb-2 absolute top-1/4 -left-20 w-[420px] h-[420px] rounded-full bg-gradient-to-tr from-cyan-500/25 via-sky-500/20 to-transparent blur-3xl will-change-transform"
          />

          {/* Right Rose / Violet Glow Orb */}
          <div
            className="animate-orb-3 absolute top-1/2 -right-20 w-[440px] h-[440px] rounded-full bg-gradient-to-bl from-pink-500/25 via-violet-600/20 to-indigo-500/15 blur-3xl will-change-transform"
          />
        </div>
      )}

      {/* 4. Top Horizon Gradient Light Bar */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
    </div>
  );
}
