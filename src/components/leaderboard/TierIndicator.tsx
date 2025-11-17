import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface TierIndicatorProps {
  tier: 'live_now' | 'hot' | 'daily' | 'pillar';
  className?: string;
}

const tierConfig = {
  live_now: {
    label: 'Live Now',
    emoji: '🟢',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    description: 'Currently online and active',
    animation: 'animate-pulse',
  },
  hot: {
    label: 'Hot',
    emoji: '🟡',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
    description: 'Active within the last hour',
    animation: 'animate-fade',
  },
  daily: {
    label: 'Daily Driver',
    emoji: '🟠',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    description: 'Active within the last 24 hours',
    animation: '',
  },
  pillar: {
    label: 'Community Pillar',
    emoji: '🔵',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    description: 'Long-term active member',
    animation: '',
  },
};

export const TierIndicator: React.FC<TierIndicatorProps> = ({ tier, className }) => {
  const config = tierConfig[tier];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
              config.bgColor,
              config.color,
              config.animation,
              className
            )}
          >
            <span className="text-base">{config.emoji}</span>
            <span>{config.label}</span>
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p>{config.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
