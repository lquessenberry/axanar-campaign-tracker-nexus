/**
 * LCARS Rank Progression Conduit
 * Horizontal plasma conduit with moving segments, current badge left, next badge right
 */

import { motion } from "framer-motion";

interface RankConduitProps {
  currentRank: {
    title: string;
    badge?: React.ReactNode;
    xp: number;
  };
  nextRank?: {
    title: string;
    badge?: React.ReactNode;
    xpRequired: number;
  };
  progress: number; // 0-100
}

export function RankConduit({ currentRank, nextRank, progress }: RankConduitProps) {
  return (
    <div className="bg-card border border-border p-6">
      <div className="flex items-center gap-6">
        {/* Current Rank Badge */}
        <div className="flex-shrink-0 text-center">
          <div className="h-16 w-16 bg-primary/20 flex items-center justify-center mb-2">
            {currentRank.badge}
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {currentRank.title}
          </p>
        </div>

        {/* Plasma Conduit Progress */}
        <div className="flex-1 relative h-12">
          {/* Conduit Track */}
          <div className="absolute inset-0 bg-muted/30 overflow-hidden">
            {/* Moving Plasma Segments */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/40 to-transparent"
              animate={{
                x: ['-100%', '200%'],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear",
              }}
            />
            
            {/* Progress Fill */}
            <div 
              className="absolute inset-y-0 left-0 bg-primary/60 transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Progress Text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-mono font-bold text-foreground mix-blend-difference">
              {progress.toFixed(1)}% TO NEXT RANK
            </span>
          </div>
        </div>

        {/* Next Rank Badge */}
        {nextRank && (
          <div className="flex-shrink-0 text-center">
            <div className="h-16 w-16 bg-muted/40 flex items-center justify-center mb-2">
              {nextRank.badge}
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {nextRank.title}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
