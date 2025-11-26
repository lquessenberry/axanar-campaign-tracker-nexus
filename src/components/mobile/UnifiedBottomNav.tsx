import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  MessageCircle, 
  User, 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useRealtimeMessages } from '@/hooks/useRealtimeMessages';
import { Badge } from '@/components/ui/badge';

interface UnifiedBottomNavProps {
  profile?: any;
}

// TOS console chirp sound utility
const playConsoleChirp = () => {
  if (typeof window !== 'undefined' && 'AudioContext' in window) {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (e) {
      // Silently fail if audio context not available
    }
  }
};

// Haptic feedback utility
const triggerHaptic = () => {
  if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
    navigator.vibrate(10);
  }
};

export function UnifiedBottomNav({ profile }: UnifiedBottomNavProps) {
  const { user } = useAuth();
  const { getUnreadCount } = useRealtimeMessages();

  if (!user) return null;

  const unreadCount = getUnreadCount();

  const handleNavClick = () => {
    playConsoleChirp();
    triggerHaptic();
  };

  const primaryNavItems = [
    { label: 'Dashboard', to: '/dashboard', icon: Home },
    { label: 'Direct Messages', to: '/direct-messages', icon: MessageCircle, badge: unreadCount },
    { label: 'Forum', to: '/forum', icon: MessageCircle },
    { label: 'Profile', to: '/profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[hsl(var(--tos-primary-black))] backdrop-blur supports-[backdrop-filter]:bg-[hsl(var(--tos-primary-black))]/95 border-t-2 border-[hsl(var(--tos-etched-border))] md:hidden shadow-[0_-4px_12px_rgba(0,0,0,0.3)]">
      <div className="flex items-center h-20 px-2">
        <div className="flex-1 flex items-center justify-around gap-0">
          {primaryNavItems.map((item, index) => {
            const isFirst = index === 0;
            const isLast = index === primaryNavItems.length - 1;
            const borderRadiusClass = isFirst 
              ? 'rounded-l-lg rounded-r-none' 
              : isLast 
              ? 'rounded-r-lg rounded-l-none' 
              : 'rounded-none';
            
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={handleNavClick}
                className={({ isActive }) =>
                  cn(
                    'command-rail-module group touch-target-large',
                    'flex flex-col items-center justify-center flex-1 min-w-0 px-3 py-2 text-sm font-medium',
                    'transition-all duration-200 ease-out',
                    'hover:scale-105 active:translate-y-[1px]',
                    'border-2',
                    borderRadiusClass,
                    'font-trek-content uppercase tracking-wide',
                    isActive
                      ? 'bg-[hsl(var(--tos-optimism-blue))] text-white border-[hsl(var(--tos-optimism-blue))] scale-105 shadow-[var(--command-rail-glow)]'
                      : 'bg-[hsl(var(--tos-primary-black))] text-[hsl(var(--tos-optimism-blue))] border-[hsl(var(--tos-etched-border))] hover:bg-[hsl(var(--tos-etched-border))]',
                    '[box-shadow:var(--command-rail-inset-shadow)]'
                  )
                }
              >
                <div className="relative">
                  <item.icon className="w-7 h-7 mb-1 transition-transform group-hover:scale-110" />
                  {item.badge && item.badge > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs animate-pulse"
                    >
                      {item.badge > 9 ? '9+' : item.badge}
                    </Badge>
                  )}
                </div>
                <span className="truncate text-xs leading-tight">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
}