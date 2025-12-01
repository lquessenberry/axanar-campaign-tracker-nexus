/**
 * Okudagram-style number display
 * Large geometric numerals inspired by TNG LCARS displays
 */

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface OkudagramNumberProps {
  value: number;
  label: string;
  className?: string;
  prefix?: string;
  animate?: boolean;
}

export function OkudagramNumber({ 
  value, 
  label, 
  className,
  prefix = "",
  animate = true 
}: OkudagramNumberProps) {
  const formattedValue = prefix + value.toLocaleString();
  
  return (
    <div className={cn("relative", className)}>
      <motion.div
        initial={animate ? { opacity: 0, scale: 0.8 } : undefined}
        animate={animate ? { opacity: 1, scale: 1 } : undefined}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
        className="relative"
      >
        {/* Main number - geometric font with glow */}
        <div 
          className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-none"
          style={{
            fontFamily: "var(--font-trek-display, 'Eurostile', 'Bank Gothic', system-ui)",
            textShadow: "0 0 30px hsl(var(--primary) / 0.5), 0 0 60px hsl(var(--primary) / 0.3)",
            color: "hsl(var(--primary))",
          }}
        >
          {formattedValue}
        </div>
        
        {/* Label - uppercase tracking */}
        <div 
          className="text-sm md:text-base uppercase tracking-[0.2em] mt-2 font-medium"
          style={{
            color: "hsl(var(--muted-foreground))",
          }}
        >
          {label}
        </div>
        
        {/* Corner accent - LCARS style */}
        <div 
          className="absolute -top-2 -right-2 w-12 h-12 border-t-2 border-r-2 opacity-40"
          style={{
            borderColor: "hsl(var(--accent))",
          }}
        />
      </motion.div>
    </div>
  );
}
