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
    const swipe = Math.abs(offset.x) * velocity.x;

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
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      onDragEnd={handleDragEnd}
      style={{ touchAction: 'pan-y' }} // Allow vertical scrolling
    >
      {children}
    </motion.div>
  );
}
