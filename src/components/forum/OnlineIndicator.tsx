import React from 'react';
import { useUserPresence } from '@/hooks/useUserPresence';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface OnlineIndicatorProps {
  userId: string;
  className?: string;
}

export const OnlineIndicator: React.FC<OnlineIndicatorProps> = ({ userId, className = '' }) => {
  const { isUserOnline, getLastSeen } = useUserPresence();
  const online = isUserOnline(userId);
  const lastSeen = getLastSeen(userId);

  const formatLastSeen = (timestamp: string | null) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`h-2 w-2 rounded-full ${
              online ? 'bg-green-500' : 'bg-gray-400'
            } ${className}`}
          />
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">
            {online ? 'Online' : `Last seen: ${formatLastSeen(lastSeen)}`}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
