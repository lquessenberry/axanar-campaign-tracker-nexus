import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface LCARSListItemProps {
  children: React.ReactNode;
  className?: string;
  isActive?: boolean;
  isUnread?: boolean;
  onClick?: () => void;
  accentColor?: 'primary' | 'secondary' | 'accent' | 'destructive' | 'muted';
}

/**
 * LCARS-styled list item with half-pill styling and directional borders.
 * Use for conversation lists, thread lists, notifications, etc.
 */
export const LCARSListItem: React.FC<LCARSListItemProps> = ({
  children,
  className,
  isActive = false,
  isUnread = false,
  onClick,
  accentColor = 'primary',
}) => {
  const accentColorMap = {
    primary: 'hsl(var(--primary))',
    secondary: 'hsl(var(--secondary))',
    accent: 'hsl(var(--accent))',
    destructive: 'hsl(var(--destructive))',
    muted: 'hsl(var(--muted))',
  };

  const borderColor = accentColorMap[accentColor];

  return (
    <motion.div
      whileHover={{ scale: 1.01, x: 4 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={cn(
        'lcars-list-item relative cursor-pointer transition-all duration-200',
        'px-4 py-3 rounded-r-2xl',
        isActive 
          ? 'bg-accent text-accent-foreground' 
          : 'bg-card/40 hover:bg-card/60',
        className
      )}
      style={{
        borderLeft: isActive 
          ? `4px solid ${borderColor}` 
          : isUnread 
            ? `4px solid ${borderColor}` 
            : '4px solid transparent',
        borderRadius: '0 16px 16px 0',
      }}
    >
      {/* Unread indicator glow */}
      {isUnread && !isActive && (
        <div 
          className="absolute left-0 top-0 bottom-0 w-1 animate-pulse"
          style={{ 
            backgroundColor: borderColor,
            boxShadow: `0 0 8px ${borderColor}`,
          }}
        />
      )}
      
      {children}
    </motion.div>
  );
};

export default LCARSListItem;
