import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { MapPin, Gift, Settings, BarChart3, Heart, LogOut, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import AddressDialog from '@/components/profile/AddressDialog';
import RewardsDialog from '@/components/profile/RewardsDialog';

interface MobileProfileActionsProps {
  onSignOut: () => void;
  profile: any;
}

export function MobileProfileActions({ onSignOut, profile }: MobileProfileActionsProps) {
  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const [rewardsDialogOpen, setRewardsDialogOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    {
      label: 'Dashboard',
      icon: BarChart3,
      href: '/dashboard',
      variant: 'outline' as const,
    },
    {
      label: 'Update Address',
      icon: MapPin,
      onClick: () => {
        setAddressDialogOpen(true);
        setIsOpen(false);
      },
      variant: 'outline' as const,
    },
    {
      label: 'Track Rewards',
      icon: Gift,
      onClick: () => {
        setRewardsDialogOpen(true);
        setIsOpen(false);
      },
      variant: 'outline' as const,
    },
    {
      label: 'Explore Campaigns',
      icon: Heart,
      href: '/',
      variant: 'outline' as const,
    },
  ];

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-20 right-4 z-40 md:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button 
              size="lg"
              className="h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90"
            >
              <ChevronUp className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-auto max-h-[80vh] rounded-t-xl">
            <SheetHeader className="pb-4">
              <SheetTitle className="text-center">Quick Actions</SheetTitle>
            </SheetHeader>
            
            {/* Action Grid */}
            <div className="grid grid-cols-2 gap-3 pb-6">
              {actions.map((action) => (
                action.href ? (
                  <Link key={action.label} to={action.href} onClick={() => setIsOpen(false)}>
                    <Button
                      variant={action.variant}
                      className="h-16 w-full flex flex-col gap-1 justify-center"
                    >
                      <action.icon className="h-5 w-5" />
                      <span className="text-xs">{action.label}</span>
                    </Button>
                  </Link>
                ) : (
                  <Button
                    key={action.label}
                    variant={action.variant}
                    onClick={action.onClick}
                    className="h-16 w-full flex flex-col gap-1 justify-center"
                  >
                    <action.icon className="h-5 w-5" />
                    <span className="text-xs">{action.label}</span>
                  </Button>
                )
              ))}
            </div>

            {/* Sign Out */}
            <div className="pt-4 border-t">
              <Button
                variant="destructive"
                onClick={() => {
                  onSignOut();
                  setIsOpen(false);
                }}
                className="w-full h-12 flex items-center justify-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

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