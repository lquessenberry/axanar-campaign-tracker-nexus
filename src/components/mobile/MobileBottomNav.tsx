import { NavLink } from 'react-router-dom';
import { Home, MessageCircle, User, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface MobileBottomNavProps {
  onMenuToggle: () => void;
}

export function MobileBottomNav({ onMenuToggle }: MobileBottomNavProps) {
  const { user } = useAuth();

  if (!user) return null;

  const navItems = [
    { label: 'Dashboard', to: '/dashboard', icon: Home },
    { label: 'Messages', to: '/messages', icon: MessageCircle },
    { label: 'Profile', to: '/profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t md:hidden">
      <div className="flex items-center justify-around h-24 px-4 gap-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center min-w-[72px] min-h-[72px] px-3 py-2 text-sm font-medium transition-colors rounded-lg',
                'hover:text-primary focus:text-primary focus-visible:ring-2 focus-visible:ring-ring',
                isActive
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )
            }
          >
            <item.icon className="w-8 h-8 mb-1" />
            <span className="truncate text-xs">{item.label}</span>
          </NavLink>
        ))}
        
        <button
          onClick={onMenuToggle}
          className="flex flex-col items-center justify-center min-w-[72px] min-h-[72px] px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors rounded-lg focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Menu className="w-8 h-8 mb-1" />
          <span className="text-xs">Menu</span>
        </button>
      </div>
    </nav>
  );
}