import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';

export interface LCARSStatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    label?: string;
  };
  sparklineData?: number[];
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  className?: string;
}

const variantStyles = {
  default: {
    border: 'border-border',
    glow: '',
    sparkline: 'hsl(var(--muted-foreground))',
  },
  primary: {
    border: 'border-primary',
    glow: 'shadow-[0_0_15px_hsl(var(--primary)/0.3)]',
    sparkline: 'hsl(var(--primary))',
  },
  success: {
    border: 'border-green-500',
    glow: 'shadow-[0_0_15px_rgba(34,197,94,0.3)]',
    sparkline: 'rgb(34, 197, 94)',
  },
  warning: {
    border: 'border-yellow-500',
    glow: 'shadow-[0_0_15px_rgba(234,179,8,0.3)]',
    sparkline: 'rgb(234, 179, 8)',
  },
  danger: {
    border: 'border-destructive',
    glow: 'shadow-[0_0_15px_hsl(var(--destructive)/0.3)]',
    sparkline: 'hsl(var(--destructive))',
  },
};

const LCARSStatCard = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  sparklineData,
  variant = 'default',
  className,
}: LCARSStatCardProps) => {
  const styles = variantStyles[variant];
  
  // Transform sparkline data for recharts
  const chartData = sparklineData?.map((val, idx) => ({ value: val, index: idx })) || [];
  
  const TrendIcon = trend 
    ? trend.value > 0 
      ? TrendingUp 
      : trend.value < 0 
        ? TrendingDown 
        : Minus
    : null;

  const trendColor = trend
    ? trend.value > 0
      ? 'text-green-500'
      : trend.value < 0
        ? 'text-destructive'
        : 'text-muted-foreground'
    : '';

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg border-2 bg-card p-4',
        'transition-all duration-300 hover:scale-[1.02]',
        styles.border,
        styles.glow,
        className
      )}
    >
      {/* LCARS-style top accent bar */}
      <div 
        className={cn(
          'absolute top-0 left-0 right-0 h-1',
          variant === 'primary' && 'bg-primary',
          variant === 'success' && 'bg-green-500',
          variant === 'warning' && 'bg-yellow-500',
          variant === 'danger' && 'bg-destructive',
          variant === 'default' && 'bg-muted-foreground/30'
        )}
      />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {title}
        </span>
        {icon && (
          <span className="text-primary opacity-70">
            {icon}
          </span>
        )}
      </div>

      {/* Main value */}
      <div className="flex items-end justify-between gap-2">
        <div className="flex-1">
          <div className="text-2xl font-bold text-foreground tabular-nums">
            {value}
          </div>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
          )}
          
          {/* Trend indicator */}
          {trend && TrendIcon && (
            <div className={cn('flex items-center gap-1 mt-1', trendColor)}>
              <TrendIcon className="h-3 w-3" />
              <span className="text-xs font-medium">
                {trend.value > 0 ? '+' : ''}{trend.value}%
                {trend.label && <span className="text-muted-foreground ml-1">{trend.label}</span>}
              </span>
            </div>
          )}
        </div>

        {/* Sparkline */}
        {chartData.length > 0 && (
          <div className="w-20 h-10 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id={`gradient-${variant}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={styles.sparkline} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={styles.sparkline} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={styles.sparkline}
                  strokeWidth={2}
                  fill={`url(#gradient-${variant})`}
                  dot={false}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* LCARS corner accent */}
      <div 
        className={cn(
          'absolute bottom-0 right-0 w-8 h-2 rounded-tl-lg',
          variant === 'primary' && 'bg-primary/50',
          variant === 'success' && 'bg-green-500/50',
          variant === 'warning' && 'bg-yellow-500/50',
          variant === 'danger' && 'bg-destructive/50',
          variant === 'default' && 'bg-muted-foreground/20'
        )}
      />
    </div>
  );
};

export default LCARSStatCard;
