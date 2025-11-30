"use client"

import { cn } from "@/lib/utils"
import type { AlertLevel } from "./types"

interface LCARSGridProps {
  alertLevel?: AlertLevel
  battleMode?: boolean
}

export function LCARSGrid({ alertLevel = "standard", battleMode }: LCARSGridProps) {
  const currentLevel = battleMode ? "red" : alertLevel

  return (
    <div className="pointer-events-none fixed inset-0 z-10 select-none">
      {/* Top Bar */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 transition-all duration-1000",
          currentLevel === "red"
            ? "h-[3px] bg-destructive animate-pulse shadow-[0_0_20px_hsl(var(--destructive)/0.5)]"
            : currentLevel === "yellow"
              ? "h-[3px] bg-accent shadow-[0_0_15px_hsl(var(--accent)/0.3)]"
              : "h-[2px] bg-gradient-to-r from-primary to-accent",
        )}
      />

      {/* Top Glow */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 h-[120px] transition-all duration-1000",
          currentLevel === "red"
            ? "bg-gradient-to-b from-destructive/20 to-transparent"
            : currentLevel === "yellow"
              ? "bg-gradient-to-b from-accent/15 to-transparent"
              : "bg-gradient-to-b from-primary/10 to-transparent",
        )}
      />

      {/* Bottom Bar */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 transition-all duration-1000",
          currentLevel === "red"
            ? "h-[3px] bg-destructive animate-pulse shadow-[0_0_20px_hsl(var(--destructive)/0.5)]"
            : currentLevel === "yellow"
              ? "h-[3px] bg-accent shadow-[0_0_15px_hsl(var(--accent)/0.3)]"
              : "h-[2px] bg-gradient-to-r from-accent to-primary",
        )}
      />

      {/* Bottom Glow */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 h-[120px] transition-all duration-1000",
          currentLevel === "red"
            ? "bg-gradient-to-t from-destructive/20 to-transparent"
            : currentLevel === "yellow"
              ? "bg-gradient-to-t from-accent/15 to-transparent"
              : "bg-gradient-to-t from-accent/10 to-transparent",
        )}
      />

      {/* Tactical Grid Overlay - Yellow & Red Only */}
      {(currentLevel === "red" || currentLevel === "yellow") && (
        <div
          className={cn(
            "absolute inset-0 transition-opacity duration-1000",
            currentLevel === "red" ? "opacity-10" : "opacity-5",
          )}
          style={{
            backgroundImage: 
              currentLevel === "red" 
                ? `linear-gradient(to right, hsl(var(--destructive) / 0.15) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--destructive) / 0.15) 1px, transparent 1px)`
                : `linear-gradient(to right, hsl(var(--accent) / 0.1) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--accent) / 0.1) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
      )}
    </div>
  )
}
