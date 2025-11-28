/**
 * LCARS Navigation Frame
 * Visual elbow bars and framing around navigation areas
 */

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LCARSNavFrameProps {
  position?: 'top' | 'bottom' | 'left' | 'right' | 'all';
  className?: string;
  children?: React.ReactNode;
}

export function LCARSNavFrame({
  position = 'all',
  className,
  children,
}: LCARSNavFrameProps) {
  const showTop = position === 'all' || position === 'top';
  const showBottom = position === 'all' || position === 'bottom';
  const showLeft = position === 'all' || position === 'left';
  const showRight = position === 'all' || position === 'right';

  return (
    <div className={cn('relative', className)}>
      {/* Top bar */}
      {showTop && (
        <motion.div
          className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[hsl(var(--lcars-slab-primary)/0.4)] via-transparent to-[hsl(var(--lcars-slab-accent)/0.4)]"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      )}

      {/* Bottom bar */}
      {showBottom && (
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[hsl(var(--lcars-slab-accent)/0.4)] via-transparent to-[hsl(var(--lcars-slab-primary)/0.4)]"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
        />
      )}

      {/* Left bar */}
      {showLeft && (
        <motion.div
          className="absolute top-0 bottom-0 left-0 w-[2px] bg-gradient-to-b from-[hsl(var(--lcars-slab-primary)/0.4)] via-transparent to-[hsl(var(--lcars-slab-accent)/0.4)] hidden md:block"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
        />
      )}

      {/* Right bar */}
      {showRight && (
        <motion.div
          className="absolute top-0 bottom-0 right-0 w-[2px] bg-gradient-to-b from-[hsl(var(--lcars-slab-accent)/0.4)] via-transparent to-[hsl(var(--lcars-slab-primary)/0.4)] hidden md:block"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.3 }}
        />
      )}

      {children}
    </div>
  );
}
