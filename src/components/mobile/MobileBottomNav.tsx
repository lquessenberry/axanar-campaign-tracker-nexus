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
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center min-w-0 flex-1 px-2 py-1 text-xs font-medium transition-colors',
                'hover:text-primary focus:text-primary',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )
            }
          >
            <item.icon className="w-5 h-5 mb-1" />
            <span className="truncate">{item.label}</span>
          </NavLink>
        ))}
        
        <button
          onClick={onMenuToggle}
          className="flex flex-col items-center justify-center min-w-0 flex-1 px-2 py-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <Menu className="w-5 h-5 mb-1" />
          <span>Menu</span>
        </button>
      </div>
    </nav>
  );
}