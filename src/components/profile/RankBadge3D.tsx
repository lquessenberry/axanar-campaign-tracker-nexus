/**
 * 3D Rank Badge
 * Rendered with CSS perspective and transforms for depth
 */

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Trophy } from "lucide-react";

interface RankBadge3DProps {
  rank: string;
  tier: string;
  className?: string;
}

export function RankBadge3D({ rank, tier, className }: RankBadge3DProps) {
  return (
    <div className={cn("relative", className)} style={{ perspective: "1000px" }}>
      <motion.div
        initial={{ rotateY: -15, rotateX: 10 }}
        whileHover={{ 
          rotateY: 0, 
          rotateX: 0,
          scale: 1.05,
        }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 20 
        }}
        className="relative"
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        {/* Main badge face */}
        <div 
          className="relative px-8 py-6 rounded-lg border-2"
          style={{
            backgroundColor: "hsl(var(--card))",
            borderColor: "hsl(var(--primary))",
            boxShadow: `
              0 10px 40px hsl(var(--primary) / 0.3),
              0 0 20px hsl(var(--primary) / 0.2),
              inset 0 1px 0 rgba(255,255,255,0.1),
              inset 0 -1px 0 rgba(0,0,0,0.2)
            `,
            transform: "translateZ(20px)",
          }}
        >
          {/* Rank icon */}
          <div className="flex justify-center mb-3">
            <div 
              className="p-3 rounded-full"
              style={{
                backgroundColor: "hsl(var(--primary) / 0.2)",
                boxShadow: "0 0 20px hsl(var(--primary) / 0.4)",
              }}
            >
              <Trophy 
                className="h-8 w-8" 
                style={{ color: "hsl(var(--primary))" }}
              />
            </div>
          </div>
          
          {/* Rank text */}
          <div className="text-center">
            <div 
              className="text-2xl font-bold mb-1"
              style={{
                color: "hsl(var(--primary))",
                textShadow: "0 0 10px hsl(var(--primary) / 0.5)",
              }}
            >
              {rank}
            </div>
            <div 
              className="text-xs uppercase tracking-widest font-medium"
              style={{ color: "hsl(var(--muted-foreground))" }}
            >
              {tier}
            </div>
          </div>
          
          {/* Corner accents */}
          <div 
            className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2"
            style={{ borderColor: "hsl(var(--accent))" }}
          />
          <div 
            className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2"
            style={{ borderColor: "hsl(var(--accent))" }}
          />
        </div>
        
        {/* Shadow layer */}
        <div 
          className="absolute inset-0 rounded-lg"
          style={{
            backgroundColor: "hsl(var(--background))",
            transform: "translateZ(-10px)",
            opacity: 0.5,
            filter: "blur(10px)",
          }}
        />
      </motion.div>
    </div>
  );
}
