/**
 * LCARS Segmented Horizontal Bar
 * Animated TNG-era segmented color strips with pulsing data flow
 */

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface LCARSBarProps {
  position?: 'top' | 'bottom';
  showElbow?: boolean;
}

interface SegmentConfig {
  baseWidth: number;
  minWidth: number;
  maxWidth: number;
  color: string;
  flex?: boolean;
}

const segments: SegmentConfig[] = [
  { baseWidth: 48, minWidth: 24, maxWidth: 80, color: "hsl(40,40%,70%)" },
  { baseWidth: 80, minWidth: 40, maxWidth: 120, color: "hsl(200,60%,50%)" },
  { baseWidth: 16, minWidth: 8, maxWidth: 32, color: "hsl(180,60%,70%)" },
  { baseWidth: 0, minWidth: 0, maxWidth: 0, color: "hsl(var(--lcars-primary))", flex: true },
  { baseWidth: 128, minWidth: 64, maxWidth: 180, color: "hsl(var(--lcars-secondary))" },
  { baseWidth: 32, minWidth: 16, maxWidth: 56, color: "hsl(50,50%,75%)" },
  { baseWidth: 24, minWidth: 12, maxWidth: 40, color: "hsl(200,50%,60%)" },
];

function AnimatedSegment({ 
  config, 
  isLast, 
  position 
}: { 
  config: SegmentConfig; 
  isLast: boolean; 
  position: 'top' | 'bottom';
}) {
  const [width, setWidth] = useState(config.baseWidth);
  
  useEffect(() => {
    if (config.flex) return; // Don't animate flex segment
    
    // Random interval between 1-4 seconds
    const scheduleNext = () => {
      const delay = 1000 + Math.random() * 3000;
      return setTimeout(() => {
        // Random width within range
        const newWidth = config.minWidth + Math.random() * (config.maxWidth - config.minWidth);
        setWidth(newWidth);
        scheduleNext();
      }, delay);
    };
    
    const timeout = scheduleNext();
    return () => clearTimeout(timeout);
  }, [config]);

  if (config.flex) {
    return <div className="flex-1 bg-[hsl(var(--lcars-primary))]" />;
  }

  return (
    <motion.div
      animate={{ width }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
      }}
      className="h-full"
      style={{
        backgroundColor: config.color,
        borderRadius: isLast 
          ? position === 'top' ? '0 0 12px 0' : '0 12px 0 0'
          : undefined,
      }}
    />
  );
}

export function LCARSBar({ position = 'top', showElbow = true }: LCARSBarProps) {
  return (
    <div className={`flex items-stretch w-full h-8 ${position === 'bottom' ? 'mt-auto' : ''}`}>
      {/* Left elbow connector */}
      {showElbow && (
        <div className="relative w-16 flex-shrink-0">
          <div 
            className="absolute inset-0 bg-[hsl(var(--lcars-secondary))]"
            style={{
              borderRadius: position === 'top' ? '0 0 0 24px' : '24px 0 0 0',
            }}
          />
        </div>
      )}
      
      {/* Segmented bar with animated widths */}
      <div className="flex-1 flex items-stretch gap-1">
        {segments.map((segment, index) => (
          <AnimatedSegment
            key={index}
            config={segment}
            isLast={index === segments.length - 1}
            position={position}
          />
        ))}
      </div>
    </div>
  );
}
