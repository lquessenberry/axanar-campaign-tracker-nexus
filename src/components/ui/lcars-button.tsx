import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

type LCARSButtonProps = {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'alert' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  withSound?: boolean;
};

const variants = {
  primary: {
    base: 'bg-orange-500 border-orange-400 shadow-orange-500/50',
    glow: 'from-orange-400/20 to-orange-600/40',
    pulse: 'animate-pulse-orange',
    ripple: 'rgba(255,200,100,0.7)',
  },
  secondary: {
    base: 'bg-purple-600 border-purple-500 shadow-purple-500/50',
    glow: 'from-purple-400/20 to-purple-700/40',
    pulse: 'animate-pulse-purple',
    ripple: 'rgba(200,150,255,0.7)',
  },
  alert: {
    base: 'bg-red-600 border-red-500 shadow-red-600/70',
    glow: 'from-red-500/30 to-red-800/50',
    pulse: 'animate-pulse-red-fast',
    ripple: 'rgba(255,100,100,0.8)',
  },
  accent: {
    base: 'bg-cyan-500 border-cyan-400 shadow-cyan-400/60',
    glow: 'from-cyan-400/25 to-cyan-600/45',
    pulse: 'animate-pulse-cyan',
    ripple: 'rgba(100,220,255,0.7)',
  },
};

// Ripple Effect Component
const RippleEffect: React.FC<{ variant: keyof typeof variants }> = ({ variant }) => {
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number; size: number }>>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const size = rect.width * 2;
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    const newRipple = {
      id: Date.now(),
      x,
      y,
      size,
    };

    setRipples((prev) => [...prev.slice(-5), newRipple]);

    // Clean up after animation
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 800);
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      className="absolute inset-0 overflow-hidden pointer-events-auto"
    >
      {ripples.map((ripple) => (
        <motion.div
          key={ripple.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: ripple.size,
            height: ripple.size,
            left: ripple.x,
            top: ripple.y,
            background: `radial-gradient(circle, ${variants[variant].ripple}, transparent 70%)`,
          }}
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
};

export default function LCARSButton({
  children,
  variant = 'primary',
  size = 'md',
  className,
  onClick,
  disabled,
  withSound = false,
}: LCARSButtonProps) {
  const v = variants[variant];

  const handleClick = () => {
    // Haptic feedback on mobile
    if ('vibrate' in navigator) {
      navigator.vibrate(30);
    }

    // Optional sound effect
    if (withSound) {
      // You can add an LCARS beep sound here
      // const audio = new Audio('/sounds/lcars-beep.mp3');
      // audio.volume = 0.3;
      // audio.play().catch(() => {});
    }

    onClick?.();
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      onClick={handleClick}
      disabled={disabled}
      className={twMerge(
        clsx(
          'relative overflow-hidden font-bold tracking-wider uppercase transition-all',
          'border-4 rounded-sm shadow-2xl',
          'transform-gpu',
          v.base,
          'border-t-[6px] border-l-[6px] border-r-[3px] border-b-[3px]',
          {
            'px-8 py-4 text-lg min-h-[72px]': size === 'lg',
            'px-6 py-3 text-base min-h-[56px]': size === 'md',
            'px-4 py-2 text-sm min-h-[48px]': size === 'sm',
            'opacity-50 cursor-not-allowed': disabled,
          },
          className
        )
      )}
    >
      {/* Animated Background Sweep on Hover */}
      <motion.div
        className="absolute inset-0 opacity-0 pointer-events-none"
        initial={{ x: '-100%' }}
        whileHover={disabled ? {} : { x: '100%', opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{
          background: `linear-gradient(90deg, transparent, ${v.glow} 50%, transparent)`,
        }}
      />

      {/* Pulsing Edge Glow */}
      {!disabled && (
        <motion.div
          className={clsx('absolute -inset-1 rounded-sm', v.pulse)}
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            background: `radial-gradient(circle at center, ${v.glow}, transparent 70%)`,
            filter: 'blur(8px)',
          }}
        />
      )}

      {/* Inner Bevel Highlight */}
      <div className="absolute inset-0 border-t-4 border-l-4 border-white/30 rounded-sm pointer-events-none" />

      {/* Ripple Effect on Click */}
      {!disabled && <RippleEffect variant={variant} />}

      {/* Content */}
      <span className="relative z-10 drop-shadow-2xl text-black mix-blend-screen font-bold">
        {children}
      </span>
    </motion.button>
  );
}

// Export variants for external use
export { variants };
export type { LCARSButtonProps };
