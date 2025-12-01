/**
 * Warp Plasma Progress Bar
 * Animated conduit-style progress indicator with flowing energy
 */

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface WarpPlasmaProgressProps {
  current: number;
  total: number;
  label: string;
  className?: string;
}

export function WarpPlasmaProgress({ 
  current, 
  total, 
  label,
  className 
}: WarpPlasmaProgressProps) {
  const percentage = Math.min((current / total) * 100, 100);
  
  return (
    <div className={cn("space-y-2", className)}>
      {/* Label and values */}
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium uppercase tracking-wide" style={{ color: "hsl(var(--foreground))" }}>
          {label}
        </span>
        <span className="font-mono text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
          {current.toLocaleString()} / {total.toLocaleString()}
        </span>
      </div>
      
      {/* Progress bar container - conduit housing */}
      <div 
        className="relative h-6 rounded-full overflow-hidden"
        style={{
          backgroundColor: "hsl(var(--background) / 0.5)",
          border: "1px solid hsl(var(--border))",
        }}
      >
        {/* Inner glow track */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: "linear-gradient(to right, hsl(var(--primary) / 0.2), transparent)",
          }}
        />
        
        {/* Main progress fill - plasma gradient */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ 
            type: "spring", 
            stiffness: 200, 
            damping: 28,
            duration: 1.2 
          }}
          className="relative h-full"
          style={{
            background: "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)), hsl(var(--primary)))",
            backgroundSize: "200% 100%",
            boxShadow: "0 0 20px hsl(var(--primary) / 0.6), inset 0 1px 2px rgba(255,255,255,0.2)",
          }}
        >
          {/* Flowing plasma animation */}
          <motion.div
            animate={{
              backgroundPosition: ["0% 50%", "200% 50%"],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute inset-0"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
              backgroundSize: "50% 100%",
            }}
          />
          
          {/* Energy particles */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                x: ["0%", "400%"],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.6,
                ease: "easeInOut",
              }}
              className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white"
              style={{
                boxShadow: "0 0 8px rgba(255,255,255,0.8)",
              }}
            />
          ))}
        </motion.div>
        
        {/* Percentage indicator */}
        <div 
          className="absolute inset-0 flex items-center justify-center text-xs font-bold"
          style={{
            color: percentage > 50 ? "hsl(var(--background))" : "hsl(var(--foreground))",
            textShadow: percentage > 50 
              ? "0 1px 2px rgba(0,0,0,0.5)"
              : "0 1px 2px rgba(255,255,255,0.5)",
          }}
        >
          {percentage.toFixed(0)}%
        </div>
      </div>
    </div>
  );
}
