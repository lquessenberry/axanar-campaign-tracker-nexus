"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import type { AlertLevel } from "./types"
import type React from "react"

interface GlassPanelProps {
  children: React.ReactNode
  className?: string
  layoutId?: string
  alertLevel?: AlertLevel
  battleMode?: boolean // Compat
}

export function GlassPanel({ children, className, layoutId, alertLevel = "standard", battleMode }: GlassPanelProps) {
  const currentLevel = battleMode ? "red" : alertLevel

  return (
    <motion.div
      layoutId={layoutId}
      className={cn(
        "relative overflow-hidden rounded-[28px] bg-background/90 backdrop-blur-3xl transition-colors duration-700",
        currentLevel === "red" && "border border-destructive/30 shadow-[0_0_40px_hsl(var(--destructive)/0.1)]",
        currentLevel === "yellow" && "border border-accent/30 shadow-[0_0_30px_hsl(var(--accent)/0.08)]",
        currentLevel === "standard" && "border border-border/30",
        className,
      )}
      style={{
        boxShadow:
          currentLevel === "red"
            ? "0 8px 0 hsl(var(--destructive) / 0.4), 0 0 80px hsl(var(--destructive) / 0.15), inset 0 0 100px hsl(var(--destructive) / 0.04)"
            : currentLevel === "yellow"
              ? "0 8px 0 hsl(var(--accent) / 0.3), 0 0 60px hsl(var(--accent) / 0.1), inset 0 0 80px hsl(var(--accent) / 0.02)"
              : "0 8px 0 hsl(var(--background) / 0.6), 0 0 80px hsl(var(--primary) / 0.15)",
      }}
      initial={{ opacity: 0, scale: 0.96, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 4 }}
      transition={{ type: "spring", stiffness: 380, damping: 32 }}
    >
      {children}
    </motion.div>
  )
}
