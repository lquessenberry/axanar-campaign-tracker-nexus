import React from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  enabled?: boolean;
}

export function PullToRefresh({ onRefresh, children, enabled = true }: PullToRefreshProps) {
  const { isRefreshing, pullDistance, isPulling } = usePullToRefresh({
    onRefresh,
    enabled,
  });

  const opacity = Math.min(pullDistance / 80, 1);
  const rotation = (pullDistance / 80) * 360;

  return (
    <div className="relative">
      {/* Pull to refresh indicator */}
      <motion.div
        className="fixed top-0 left-0 right-0 z-40 flex items-center justify-center bg-gradient-to-b from-background to-transparent"
        initial={{ height: 0, opacity: 0 }}
        animate={{
          height: isPulling || isRefreshing ? pullDistance + 20 : 0,
          opacity: isPulling || isRefreshing ? opacity : 0,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <motion.div
          className="flex items-center gap-2 text-primary"
          animate={{ opacity }}
        >
          {isRefreshing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm font-medium">Refreshing...</span>
            </>
          ) : (
            <>
              <motion.div
                animate={{ rotate: rotation }}
                transition={{ type: 'spring', stiffness: 100 }}
              >
                <RefreshCw className="w-5 h-5" />
              </motion.div>
              <span className="text-sm font-medium">
                {pullDistance >= 80 ? 'Release to refresh' : 'Pull to refresh'}
              </span>
            </>
          )}
        </motion.div>
      </motion.div>

      {/* Content */}
      {children}
    </div>
  );
}
