import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { X, ChevronDown, ChevronRight, Shield, LogOut, MapPin, Gift, Heart, User, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import AddressDialog from '@/components/profile/AddressDialog';
import RewardsDialog from '@/components/profile/RewardsDialog';

interface MobileHamburgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  profile?: any;
}

export function MobileHamburgerMenu({ isOpen, onClose, profile }: MobileHamburgerMenuProps) {
  const { user, signOut } = useAuth();
  const { data: isAdmin } = useAdminCheck();
  const [openSections, setOpenSections] = useState<string[]>([]);
  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const [rewardsDialogOpen, setRewardsDialogOpen] = useState(false);

  const toggleSection = (section: string) => {
    setOpenSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const publicLinks = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { label: 'How It Works', path: '/how-it-works' },
    { label: 'How ARES Works', path: '/how-to-earn-ares' },
    { label: 'FAQ', path: '/faq' },
    { label: 'Support', path: '/support' }
  ];

  const userLinks = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Messages', path: '/messages' },
    { label: 'Profile', path: '/profile' },
    { label: '3D Models', path: '/models' }
  ];

  const adminSections = [
    {
      id: 'overview',
      label: 'Overview',
      items: [{ label: 'Dashboard', path: '/admin/dashboard' }]
    },
    {
      id: 'donor-management',
      label: 'Donor Management',
      items: [
        { label: 'Donors', path: '/admin/donors' },
        { label: 'Pledges', path: '/admin/pledges' },
        { label: 'Rewards', path: '/admin/rewards' }
      ]
    },
    {
      id: 'communication',
      label: 'Communication',
      items: [
        { label: 'Messages', path: '/admin/messages' }
      ]
    },
    {
      id: 'admin-settings',
      label: 'Admin Settings',
      items: [
        { label: 'Admin Users', path: '/admin/admins' }
      ]
    }
  ];

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-80 p-0">
        <SheetHeader className="p-6 border-b">
          <SheetTitle className="text-left">Navigation</SheetTitle>
        </SheetHeader>
        
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-6">
            {/* Public Links */}
            {!user && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground px-2">Main</h3>
                {publicLinks.map((link) => (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-foreground hover:bg-muted'
                      )
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}
                
                <NavLink
                  to="/auth"
                  onClick={onClose}
                  className="flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors text-primary hover:bg-primary/10"
                >
                  Access Portal
                </NavLink>
              </div>
            )}

            {/* User Links */}
            {user && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground px-2">User</h3>
                {userLinks.map((link) => (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-foreground hover:bg-muted'
                      )
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}
                
                {isAdmin && (
                  <NavLink
                    to="/admin"
                    onClick={onClose}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-foreground hover:bg-muted'
                      )
                    }
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Admin Portal
                  </NavLink>
                )}
              </div>
            )}

            {/* Quick Actions */}
            {user && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground px-2">Quick Actions</h3>
                
                <Button
                  variant="outline"
                  onClick={() => {
                    setAddressDialogOpen(true);
                    onClose();
                  }}
                  className="w-full justify-start"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  Update Address
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => {
                    setRewardsDialogOpen(true);
                    onClose();
                  }}
                  className="w-full justify-start"
                >
                  <Gift className="w-4 h-4 mr-2" />
                  Track Rewards
                </Button>
                
                <NavLink
                  to="/campaigns"
                  onClick={onClose}
                  className="w-full"
                >
                  <Button variant="outline" className="w-full justify-start">
                    <Heart className="w-4 h-4 mr-2" />
                    Explore Campaigns
                  </Button>
                </NavLink>

                {profile?.username && (
                  <a 
                    href={`/u/${profile.username}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    onClick={onClose}
                    className="block"
                  >
                    <Button variant="outline" className="w-full justify-start">
                      <User className="w-4 h-4 mr-2" />
                      View Public Profile
                    </Button>
                  </a>
                )}
              </div>
            )}

            {/* Admin Sections */}
            {user && isAdmin && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground px-2">Admin</h3>
                {adminSections.map((section) => (
                  <Collapsible
                    key={section.id}
                    open={openSections.includes(section.id)}
                    onOpenChange={() => toggleSection(section.id)}
                  >
                    <CollapsibleTrigger className="flex items-center justify-between w-full px-2 py-2 text-sm font-medium rounded-md hover:bg-muted transition-colors">
                      <span>{section.label}</span>
                      {openSections.includes(section.id) ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="ml-4 space-y-1">
                      {section.items.map((item) => (
                        <NavLink
                          key={item.path}
                          to={item.path}
                          onClick={onClose}
                          className={({ isActive }) =>
                            cn(
                              'flex items-center px-2 py-1 text-sm rounded-md transition-colors',
                              isActive
                                ? 'bg-primary text-primary-foreground'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                            )
                          }
                        >
                          {item.label}
                        </NavLink>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>
            )}
          </div>

          {/* Sign Out Button */}
          {user && (
            <div className="p-4 border-t">
              <Button
                variant="outline"
                onClick={handleSignOut}
                className="w-full justify-start"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          )}
        </div>
      </SheetContent>

      {/* Dialogs */}
      <AddressDialog 
        open={addressDialogOpen} 
        onOpenChange={setAddressDialogOpen} 
      />
      
      <RewardsDialog 
        open={rewardsDialogOpen} 
        onOpenChange={setRewardsDialogOpen} 
      />
    </Sheet>
  );
}