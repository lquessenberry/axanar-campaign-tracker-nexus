import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { X, AlertTriangle, CheckCircle, Info, AlertCircle } from 'lucide-react';

export type LCARSToastVariant = 'default' | 'success' | 'warning' | 'error' | 'info';

interface LCARSToastProps {
  id: string;
  title: string;
  description?: string;
  variant?: LCARSToastVariant;
  duration?: number;
  onDismiss: (id: string) => void;
}

const VARIANT_CONFIG: Record<LCARSToastVariant, { 
  icon: React.ReactNode; 
  borderColor: string;
  bgColor: string;
  iconColor: string;
  label: string;
}> = {
  default: {
    icon: <Info className="h-5 w-5" />,
    borderColor: 'border-primary',
    bgColor: 'bg-primary/10',
    iconColor: 'text-primary',
    label: 'COMPUTER ALERT',
  },
  success: {
    icon: <CheckCircle className="h-5 w-5" />,
    borderColor: 'border-green-500',
    bgColor: 'bg-green-500/10',
    iconColor: 'text-green-500',
    label: 'OPERATION COMPLETE',
  },
  warning: {
    icon: <AlertTriangle className="h-5 w-5" />,
    borderColor: 'border-yellow-500',
    bgColor: 'bg-yellow-500/10',
    iconColor: 'text-yellow-500',
    label: 'CAUTION',
  },
  error: {
    icon: <AlertCircle className="h-5 w-5" />,
    borderColor: 'border-red-500',
    bgColor: 'bg-red-500/10',
    iconColor: 'text-red-500',
    label: 'SYSTEM ALERT',
  },
  info: {
    icon: <Info className="h-5 w-5" />,
    borderColor: 'border-cyan-500',
    bgColor: 'bg-cyan-500/10',
    iconColor: 'text-cyan-500',
    label: 'INFORMATION',
  },
};

const LCARSToast = ({
  id,
  title,
  description,
  variant = 'default',
  duration = 5000,
  onDismiss,
}: LCARSToastProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const config = VARIANT_CONFIG[variant];

  useEffect(() => {
    const timer = setTimeout(() => {
      handleDismiss();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onDismiss(id);
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg border-2 backdrop-blur-xl shadow-lg',
        'transition-all duration-300 ease-out',
        config.borderColor,
        config.bgColor,
        isExiting ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0',
        // Glow effect
        'shadow-[0_0_20px_hsl(var(--primary)/0.2)]'
      )}
      role="alert"
    >
      {/* LCARS accent bar */}
      <div className={cn(
        'absolute top-0 left-0 right-0 h-1',
        'bg-gradient-to-r from-current via-current/50 to-transparent',
        config.iconColor
      )} />
      
      {/* Animated glow border */}
      <div className={cn(
        'absolute inset-0 rounded-lg pointer-events-none',
        'animate-pulse opacity-30',
        config.borderColor.replace('border-', 'ring-2 ring-')
      )} />

      <div className="p-4 pt-5">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={cn('flex-shrink-0', config.iconColor)}>
            {config.icon}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className={cn(
              'text-[10px] font-bold tracking-widest uppercase mb-1',
              config.iconColor
            )}>
              {config.label}
            </p>
            <p className="font-semibold text-sm">{title}</p>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            )}
          </div>

          {/* Dismiss button */}
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-1 rounded hover:bg-foreground/10 transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground/10">
          <div 
            className={cn('h-full', config.iconColor.replace('text-', 'bg-'))}
            style={{
              animation: `lcars-toast-progress ${duration}ms linear forwards`,
            }}
          />
        </div>
      </div>
    </div>
  );
};

// Toast container component
interface LCARSToastContainerProps {
  toasts: Array<{
    id: string;
    title: string;
    description?: string;
    variant?: LCARSToastVariant;
    duration?: number;
  }>;
  onDismiss: (id: string) => void;
}

export const LCARSToastContainer = ({ toasts, onDismiss }: LCARSToastContainerProps) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <LCARSToast
            {...toast}
            onDismiss={onDismiss}
          />
        </div>
      ))}
    </div>
  );
};

export default LCARSToast;
