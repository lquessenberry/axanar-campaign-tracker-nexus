import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { UserTitle } from '@/hooks/useAmbassadorialTitles';

interface TitleBadgeDisplayProps {
  title: UserTitle;
  size?: 'sm' | 'md' | 'lg';
  showDescription?: boolean;
  className?: string;
}

export const TitleBadgeDisplay = ({ 
  title, 
  size = 'md', 
  showDescription = false,
  className = '' 
}: TitleBadgeDisplayProps) => {
  const sizeClasses = {
    sm: 'text-base px-3 py-2',
    md: 'text-lg px-4 py-2.5',
    lg: 'text-xl px-5 py-3'
  };

  const iconSize = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  const imageIconSize = {
    sm: 'w-6 h-6',
    md: 'w-7 h-7',
    lg: 'w-9 h-9'
  };

  const tierGradient = title.tier_level >= 25 ? 'from-fuchsia-500/20 to-pink-500/20' :
                       title.tier_level >= 20 ? 'from-rose-500/20 to-red-500/20' :
                       title.tier_level >= 15 ? 'from-orange-500/20 to-amber-500/20' :
                       title.tier_level >= 10 ? 'from-indigo-500/20 to-purple-500/20' :
                       title.tier_level >= 5 ? 'from-blue-500/20 to-indigo-500/20' :
                       'from-cyan-500/20 to-blue-500/20';

  const content = (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={className}
    >
      <Badge
        variant="outline"
        className={`
          ${sizeClasses[size]}
          ${title.color || 'text-cyan-400'}
          ${title.badge_style || 'border-cyan-400/40'}
          relative
          bg-gradient-to-r ${tierGradient}
          backdrop-blur-xl
          border-2
          shadow-[0_4px_16px_-2px_hsl(var(--primary)/0.2),0_2px_8px_-1px_hsl(var(--primary)/0.1),inset_0_1px_0_0_hsl(var(--background)/0.6)]
          font-black
          tracking-wide
          uppercase
          [text-shadow:_0_2px_4px_hsl(var(--background)/0.8),_0_-1px_2px_hsl(var(--primary)/0.2),_0_1px_1px_hsl(var(--foreground)/0.1)]
          transition-all duration-300
          hover:shadow-[0_8px_24px_-2px_hsl(var(--primary)/0.35),0_4px_12px_-1px_hsl(var(--primary)/0.2),inset_0_1px_0_0_hsl(var(--background)/0.8)]
          hover:border-primary/60
          hover:[text-shadow:_0_3px_6px_hsl(var(--background)/0.9),_0_-1px_2px_hsl(var(--primary)/0.3),_0_1px_2px_hsl(var(--foreground)/0.15)]
          before:absolute before:inset-0 before:rounded-[inherit] before:bg-gradient-to-br before:from-white/10 before:via-transparent before:to-transparent before:pointer-events-none
        `}
      >
        {title.icon && (
          title.icon.startsWith('/') || title.icon.startsWith('http') ? (
            <img 
              src={title.icon} 
              alt={title.display_name}
              className={`${imageIconSize[size]}
                object-contain mr-2.5
                drop-shadow-[0_3px_10px_hsl(var(--primary)/0.5)]
                brightness-110
                contrast-110`}
            />
          ) : (
            <span className={`
              ${iconSize[size]} mr-2.5
              drop-shadow-[0_3px_8px_hsl(var(--primary)/0.6)]
              inline-flex items-center justify-center
            `}>{title.icon}</span>
          )
        )}
        <span className="relative z-10">{title.display_name}</span>
      </Badge>
      {showDescription && title.description && (
        <p className="text-xs text-muted-foreground mt-1">{title.description}</p>
      )}
    </motion.div>
  );

  if (!showDescription) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {content}
          </TooltipTrigger>
          <TooltipContent className="max-w-xs bg-background/95 backdrop-blur-sm border-primary/20">
            <div className="space-y-2">
              <p className="font-semibold text-foreground">{title.display_name}</p>
              {title.description && (
                <p className="text-sm text-muted-foreground">{title.description}</p>
              )}
              {title.campaign_name && (
                <p className="text-xs text-muted-foreground">
                  Campaign: <span className="text-foreground">{title.campaign_name}</span>
                </p>
              )}
              <div className="pt-2 border-t border-border/50 space-y-1">
                {title.xp_multiplier > 1 && (
                  <p className="text-xs">
                    <span className="text-primary">⚡ {title.xp_multiplier}x</span> XP Multiplier
                  </p>
                )}
                {title.forum_xp_bonus > 0 && (
                  <p className="text-xs">
                    <span className="text-primary">+{title.forum_xp_bonus}</span> Forum XP Bonus
                  </p>
                )}
                {title.participation_xp_bonus > 0 && (
                  <p className="text-xs">
                    <span className="text-primary">+{title.participation_xp_bonus}</span> Participation XP
                  </p>
                )}
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return content;
};
