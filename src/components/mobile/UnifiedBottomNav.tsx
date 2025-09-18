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
        <div className="flex items-center h-20 px-2">
          {/* Primary Navigation - Takes up most space */}
          <div className="flex-1 flex items-center justify-around">
            {primaryNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'flex flex-col items-center justify-center min-w-0 px-3 py-2 text-xs font-medium transition-all duration-200',
                    'hover:text-primary focus:text-primary hover:scale-105',
                    isActive
                      ? 'text-primary scale-105'
                      : 'text-muted-foreground hover:text-foreground'
                  )
                }
              >
                <item.icon className="w-5 h-5 mb-1" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            ))}
          </div>

          {/* Actions Button */}
          <div className="px-2">
            <Button
              onClick={() => setIsActionsOpen(true)}
              size="sm"
              className="h-12 w-12 rounded-full bg-primary hover:bg-primary/90 shadow-lg"
            >
              <ChevronUp className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Actions Sheet */}
      <Sheet open={isActionsOpen} onOpenChange={setIsActionsOpen}>
        <SheetContent side="bottom" className="h-auto max-h-[85vh] rounded-t-2xl">
          <SheetHeader className="pb-6">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-xl">Quick Actions</SheetTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsActionsOpen(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </SheetHeader>

          <div className="space-y-6">
            {/* Primary Actions Grid */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">Profile Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action) => (
                  action.href ? (
                    <Link 
                      key={action.label} 
                      to={action.href} 
                      onClick={() => setIsActionsOpen(false)}
                    >
                      <Button
                        variant="outline"
                        className={cn(
                          "h-16 w-full flex flex-col gap-1 justify-center transition-colors",
                          action.color
                        )}
                      >
                        <action.icon className="h-5 w-5" />
                        <span className="text-xs font-medium">{action.label}</span>
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      key={action.label}
                      variant="outline"
                      onClick={action.onClick}
                      className={cn(
                        "h-16 w-full flex flex-col gap-1 justify-center transition-colors",
                        action.color
                      )}
                    >
                      <action.icon className="h-5 w-5" />
                      <span className="text-xs font-medium">{action.label}</span>
                    </Button>
                  )
                ))}
              </div>
            </div>

            {/* Admin Section */}
            {isAdmin && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">Admin Tools</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Link to="/admin/dashboard" onClick={() => setIsActionsOpen(false)}>
                    <Button
                      variant="outline"
                      className="h-16 w-full flex flex-col gap-1 justify-center hover:bg-orange-500 hover:text-white transition-colors"
                    >
                      <Shield className="h-5 w-5" />
                      <span className="text-xs font-medium">Admin Panel</span>
                    </Button>
                  </Link>
                  
                  <Link to="/admin/donors" onClick={() => setIsActionsOpen(false)}>
                    <Button
                      variant="outline"
                      className="h-16 w-full flex flex-col gap-1 justify-center hover:bg-teal-500 hover:text-white transition-colors"
                    >
                      <BarChart3 className="h-5 w-5" />
                      <span className="text-xs font-medium">Manage Users</span>
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {/* Public Profile Link */}
            {profile?.username && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">Public Profile</h3>
                <a 
                  href={`/u/${profile.username}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  onClick={() => setIsActionsOpen(false)}
                >
                  <Button
                    variant="outline"
                    className="w-full h-12 justify-start hover:bg-cyan-500 hover:text-white transition-colors"
                  >
                    <User className="h-4 w-4 mr-3" />
                    <div className="text-left">
                      <div className="font-medium">View Public Profile</div>
                      <div className="text-xs opacity-70">/u/{profile.username}</div>
                    </div>
                  </Button>
                </a>
              </div>
            )}

            {/* Sign Out */}
            <div className="pt-4 border-t">
              <Button
                variant="destructive"
                onClick={handleSignOut}
                className="w-full h-12 flex items-center justify-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="font-medium">Sign Out</span>
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Dialogs */}
      <AddressDialog 
        open={addressDialogOpen} 
        onOpenChange={setAddressDialogOpen} 
      />
      
      <RewardsDialog 
        open={rewardsDialogOpen} 
        onOpenChange={setRewardsDialogOpen} 
      />
    </>
  );
}