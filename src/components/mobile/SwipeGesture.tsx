import React from 'react';
import { motion, PanInfo } from 'framer-motion';

interface SwipeGestureProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
  className?: string;
}

/**
 * Wrapper component that adds swipe gesture support
 * Useful for mobile navigation and card interactions
 */
export function SwipeGesture({
  children,
  onSwipeLeft,
  onSwipeRight,
  threshold = 100,
  className = '',
}: SwipeGestureProps) {
  const handleDragEnd = (_: any, info: PanInfo) => {
    const { offset, velocity } = info;
    
    // Only trigger if horizontal movement is greater than vertical
    if (Math.abs(offset.x) < Math.abs(offset.y)) return;
    
    const swipe = offset.x * Math.abs(velocity.x);

    if (swipe < -threshold && onSwipeLeft) {
      onSwipeLeft();
    } else if (swipe > threshold && onSwipeRight) {
      onSwipeRight();
    }
  };

  return (
    <motion.div
      className={className}
      drag="x"
      dragDirectionLock
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.15}
      onDragEnd={handleDragEnd}
    >
      {children}
    </motion.div>
  );
}
