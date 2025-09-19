import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { 
  Home, 
  MessageCircle, 
  User, 
  Settings, 
  MapPin, 
  Gift, 
  Heart, 
  BarChart3, 
  LogOut, 
  Shield,
  ChevronUp,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import AddressDialog from '@/components/profile/AddressDialog';
import RewardsDialog from '@/components/profile/RewardsDialog';

interface UnifiedBottomNavProps {
  profile?: any;
}

export function UnifiedBottomNav({ profile }: UnifiedBottomNavProps) {
  const { user, signOut } = useAuth();
  const { data: isAdmin } = useAdminCheck();
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const [rewardsDialogOpen, setRewardsDialogOpen] = useState(false);

  if (!user) return null;

  const primaryNavItems = [
    { label: 'Dashboard', to: '/dashboard', icon: Home },
    { label: 'Messages', to: '/messages', icon: MessageCircle },
    { label: 'Profile', to: '/profile', icon: User },
  ];

  const quickActions = [
    {
      label: 'Update Address',
      icon: MapPin,
      onClick: () => {
        setAddressDialogOpen(true);
        setIsActionsOpen(false);
      },
      color: 'hover:bg-yellow-500 hover:text-black',
    },
    {
      label: 'Track Rewards',
      icon: Gift,
      onClick: () => {
        setRewardsDialogOpen(true);
        setIsActionsOpen(false);
      },
      color: 'hover:bg-blue-500 hover:text-white',
    },
    {
      label: 'Explore Campaigns',
      icon: Heart,
      href: '/campaigns',
      color: 'hover:bg-purple-500 hover:text-white',
    },
  ];

  const handleSignOut = async () => {
    await signOut();
    setIsActionsOpen(false);
  };

  return (
    <>
      {/* Unified Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t md:hidden">
        <div className="flex items-center h-16 px-4">
          {/* Primary Navigation - Full width */}
          <div className="flex-1 flex items-center justify-around">
            {primaryNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'flex flex-col items-center justify-center min-w-0 px-4 py-2 text-xs font-medium transition-all duration-200',
                    'hover:text-primary focus:text-primary hover:scale-105',
                    isActive
                      ? 'text-primary scale-105'
                      : 'text-muted-foreground hover:text-foreground'
                  )
                }
              >
                <item.icon className="w-6 h-6 mb-1" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

    </>
  );
}