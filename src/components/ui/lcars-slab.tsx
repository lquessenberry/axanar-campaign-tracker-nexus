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
    inactive: 'bg-orange-900/30',
    active: 'bg-orange-500',
  },
  secondary: {
    inactive: 'bg-purple-900/30',
    active: 'bg-purple-500',
  },
  alert: {
    inactive: 'bg-red-900/30',
    active: 'bg-red-600',
  },
  accent: {
    inactive: 'bg-cyan-900/30',
    active: 'bg-cyan-500',
  },
  info: {
    inactive: 'bg-blue-900/40',
    active: 'bg-blue-500',
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
        className="absolute inset-0 flex items-center justify-center 
                   font-bold uppercase tracking-widest text-black 
                   pointer-events-none px-4"
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
