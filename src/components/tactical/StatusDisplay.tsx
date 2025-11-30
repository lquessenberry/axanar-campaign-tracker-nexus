"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

type StatusLevel = "nominal" | "caution" | "critical" | "offline" | "legend"

interface DaystromStatusDisplayProps {
  label: string
  value: string | number
  status?: StatusLevel
  blink?: boolean
  className?: string
}

export const DaystromStatusDisplay = ({
  label,
  value,
  status = "nominal",
  blink = false,
  className,
}: DaystromStatusDisplayProps) => {
  // Use theme-aware classes
  const statusConfig = {
    nominal: { 
      text: "text-primary", 
      glow: "shadow-primary/60", 
      bg: "bg-primary/10",
      border: "border-primary/20"
    },
    caution: { 
      text: "text-accent", 
      glow: "shadow-accent/70", 
      bg: "bg-accent/10",
      border: "border-accent/20"
    },
    critical: { 
      text: "text-destructive", 
      glow: "shadow-destructive/90", 
      bg: "bg-destructive/20",
      border: "border-destructive/20"
    },
    offline: { 
      text: "text-muted-foreground/30", 
      glow: "shadow-none", 
      bg: "bg-muted/5",
      border: "border-muted/10"
    },
    legend: { 
      text: "text-[hsl(var(--nebula-purple))]", 
      glow: "shadow-[hsl(var(--nebula-purple))/80]", 
      bg: "bg-[hsl(var(--nebula-purple))/20]",
      border: "border-[hsl(var(--nebula-purple))/20]"
    },
  }

  const config = statusConfig[status]

  return (
    <motion.div
      animate={blink ? { opacity: [0.4, 1, 0.4] } : {}}
      transition={blink ? { duration: 0.8, repeat: Infinity } : {}}
      className={cn(
        "relative px-6 py-5 border-2 bg-card/60 overflow-hidden backdrop-blur-sm",
        "font-mono tracking-widest",
        config.bg,
        config.border,
        className,
      )}
    >
      {/* Hard inner bevel */}
      <div className={cn("absolute inset-2 border z-10", config.border)} />

      {/* Legend-tier Background Effects */}
      {status === "legend" && (
        <>
          {/* Purple warp-plasma flow */}
          <motion.div
            animate={{ x: [-400, 1000] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-[hsl(var(--nebula-purple))/60] via-[hsl(var(--nebula-pink))/80] to-transparent pointer-events-none opacity-50"
          />
          <motion.div
            animate={{ x: [1000, -400] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "linear", delay: 1.2 }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-[hsl(var(--nebula-cyan))/60] to-transparent pointer-events-none opacity-50"
          />

          {/* Pulsing purple halo */}
          <motion.div
            animate={{
              boxShadow: [
                "inset 0 0 40px hsl(var(--nebula-purple) / 0.3)",
                "inset 0 0 60px hsl(var(--nebula-purple) / 0.5)",
                "inset 0 0 40px hsl(var(--nebula-purple) / 0.3)",
              ],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 pointer-events-none"
          />

          {/* Particle sparkles */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                opacity: [0, 1, 0],
                scale: [0.4, 1.2, 0.4],
                x: [0, Math.random() * 200 - 100],
                y: [0, Math.random() * 100 - 50],
              }}
              transition={{
                duration: 2 + Math.random(),
                repeat: Infinity,
                delay: i * 0.25,
                ease: "easeOut",
              }}
              className="absolute w-1 h-1 bg-white rounded-full pointer-events-none"
              style={{
                top: `${20 + Math.random() * 60}%`,
                left: `${10 + Math.random() * 80}%`,
              }}
            />
          ))}
        </>
      )}

      {/* Label */}
      <div className={cn("text-xs uppercase mb-2 relative z-20", config.text, "opacity-70")}>
        {label}
      </div>

      {/* Value */}
      <div className={cn("text-2xl font-bold relative z-20", config.text)}>
        {value}
      </div>
    </motion.div>
  )
}
