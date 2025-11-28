/**
 * LCARS Navigation Slab
 * Route-aware navigation component that adapts to active state
 */

import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { playNavBeep, triggerHaptic } from '@/lib/lcars-audio';

interface LCARSNavSlabProps {
  to: string;
  icon: LucideIcon;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'alert' | 'accent' | 'info';
  showLabel?: 'always' | 'active' | 'hover';
  badge?: number;
  className?: string;
}

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

export function LCARSNavSlab({
  to,
  icon: Icon,
  children,
  variant = 'secondary',
  showLabel = 'active',
  badge,
  className,
}: LCARSNavSlabProps) {
  const styles = variantStyles[variant];

  const handleClick = () => {
    playNavBeep();
    triggerHaptic(10);
  };

  return (
    <NavLink
      to={to}
      onClick={handleClick}
      className={({ isActive }) =>
        cn(
          'relative overflow-hidden cursor-pointer select-none',
          'flex flex-col items-center justify-center',
          'min-h-[72px] px-4 py-2',
          'transition-all duration-150',
          'hover:scale-[1.02] active:scale-[0.98]',
          isActive ? styles.active : styles.inactive,
          styles.text,
          className
        )
      }
    >
      {({ isActive }) => (
        <>
          {/* Activation flash */}
          {isActive && (
            <motion.div
              className="absolute inset-0 bg-white pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.6, 0] }}
              transition={{ duration: 0.25 }}
            />
          )}

          {/* Icon */}
          <div className="relative">
            <Icon className="w-6 h-6 mb-1" />
            {badge && badge > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs animate-pulse"
              >
                {badge > 9 ? '9+' : badge}
              </Badge>
            )}
          </div>

          {/* Label */}
          <motion.span
            className="text-xs font-bold uppercase tracking-wider truncate max-w-full"
            initial={false}
            animate={{
              opacity:
                showLabel === 'always'
                  ? 1
                  : showLabel === 'active' && isActive
                  ? 1
                  : 0,
            }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.span>

          {/* Subtle idle pulse for inactive slabs */}
          {!isActive && (
            <motion.div
              className="absolute inset-0 opacity-10 pointer-events-none"
              animate={{ opacity: [0.05, 0.15, 0.05] }}
              transition={{ duration: 4, repeat: Infinity }}
              style={{
                background: 'linear-gradient(45deg, transparent 30%, white 50%, transparent 70%)',
              }}
            />
          )}
        </>
      )}
    </NavLink>
  );
}
