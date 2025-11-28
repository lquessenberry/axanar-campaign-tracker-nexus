import React from 'react';
import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';
import { clsx } from 'clsx';

type LCARSSlabProps = {
  children?: React.ReactNode;
  onTap?: () => void;
  active?: boolean;
  variant?: 'primary' | 'secondary' | 'alert' | 'accent' | 'info';
  showLabel?: 'always' | 'active' | 'hover';
  className?: string;
  withPulse?: boolean;
};

const variantStyles = {
  primary: {
    inactive: 'bg-[hsl(var(--lcars-slab-primary)/0.3)]',
    active: 'bg-[hsl(var(--lcars-slab-primary-active))]',
    text: 'text-[hsl(var(--lcars-slab-primary-foreground))]',
  },
  secondary: {
    inactive: 'bg-[hsl(var(--lcars-slab-secondary)/0.3)]',
    active: 'bg-[hsl(var(--lcars-slab-secondary-active))]',
    text: 'text-[hsl(var(--lcars-slab-secondary-foreground))]',
  },
  alert: {
    inactive: 'bg-[hsl(var(--lcars-slab-alert)/0.3)]',
    active: 'bg-[hsl(var(--lcars-slab-alert-active))]',
    text: 'text-[hsl(var(--lcars-slab-alert-foreground))]',
  },
  accent: {
    inactive: 'bg-[hsl(var(--lcars-slab-accent)/0.3)]',
    active: 'bg-[hsl(var(--lcars-slab-accent-active))]',
    text: 'text-[hsl(var(--lcars-slab-accent-foreground))]',
  },
  info: {
    inactive: 'bg-[hsl(var(--lcars-slab-info)/0.3)]',
    active: 'bg-[hsl(var(--lcars-slab-info-active))]',
    text: 'text-[hsl(var(--lcars-slab-info-foreground))]',
  },
};

export default function LCARSSlab({
  children,
  onTap,
  active = false,
  variant = 'primary',
  showLabel = 'active',
  className,
  withPulse = false,
}: LCARSSlabProps) {
  const [isHovered, setIsHovered] = React.useState(false);
  const colors = variantStyles[variant];

  const showText = showLabel === 'always' || (showLabel === 'active' && active) || (showLabel === 'hover' && isHovered);

  return (
    <motion.div
      className={twMerge(
        clsx(
          'relative overflow-hidden cursor-pointer select-none',
          'transition-colors duration-150',
          active ? colors.active : colors.inactive,
          className
        )
      )}
      whileTap={{ scale: 0.94 }}
      onTap={() => {
        // Haptic feedback on mobile
        if ('vibrate' in navigator) {
          navigator.vibrate(30);
        }
        onTap?.();
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Activation flash (the classic TNG white sweep) */}
      <motion.div
        className="absolute inset-0 bg-white opacity-0 pointer-events-none"
        key={active ? 'active' : 'inactive'}
        initial={false}
        animate={active ? { opacity: [0.6, 0] } : {}}
        transition={{ duration: 0.25 }}
      />

      {/* Label - appears on hover/active */}
      <motion.div
        className={twMerge(
          clsx(
            "absolute inset-0 flex items-center justify-center",
            "font-bold uppercase tracking-widest pointer-events-none px-4",
            colors.text
          )
        )}
        initial={false}
        animate={{ opacity: showText ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.div>

      {/* Subtle idle pulse/shimmer for important slabs */}
      {withPulse && !active && (
        <motion.div
          className="absolute inset-0 opacity-20 pointer-events-none"
          animate={{ opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <motion.div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(45deg, transparent 30%, white 50%, transparent 70%)',
            }}
            animate={{
              x: ['-200%', '200%'],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        </motion.div>
      )}
    </motion.div>
  );
}

// Export variant styles for external use
export { variantStyles };
export type { LCARSSlabProps };
