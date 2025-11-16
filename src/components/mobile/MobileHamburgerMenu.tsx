import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronDown, ChevronRight, Shield, LogOut, MapPin, Gift, Heart } from 'lucide-react';
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

export function MobileHamburgerMenu({ isOpen, onClose, profile }: MobileHamburgerMenuProps) {
  const { user, signOut } = useAuth();
  const { data: isAdmin } = useAdminCheck();
  const [openSections, setOpenSections] = useState<string[]>([]);
  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const [rewardsDialogOpen, setRewardsDialogOpen] = useState(false);

  const toggleSection = (section: string) => {
    playConsoleChirp();
    triggerHaptic();
    setOpenSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const handleNavClick = () => {
    playConsoleChirp();
    triggerHaptic();
    onClose();
  };

  const handleActionClick = (action: () => void) => {
    playConsoleChirp();
    triggerHaptic();
    action();
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
    playConsoleChirp();
    triggerHaptic();
    await signOut();
    onClose();
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent 
          side="left" 
          className="command-rail-container w-[var(--command-rail-min-width)] p-0 border-r-2 border-[hsl(var(--tos-etched-border))]"
        >
          <SheetHeader className="command-rail-header px-[calc(var(--space-unit)*2)] py-[calc(var(--space-unit)*2)] border-b-2 border-[hsl(var(--tos-etched-border))]">
            <SheetTitle className="text-left font-trek-heading uppercase tracking-wider text-[hsl(var(--tos-optimism-blue))]">
              Command Rail
            </SheetTitle>
          </SheetHeader>
          
          <div className="command-rail-content flex flex-col h-full">
            <div className="flex-1 overflow-y-auto">
              <div className="command-rail-grid grid gap-[var(--command-rail-gap)] p-[var(--command-rail-gap)]">
                {/* Public Links */}
                {!user && (
                  <div className="command-rail-section">
                    <h3 className="command-rail-section-label text-xs font-medium text-[hsl(var(--tos-util-gray))] uppercase tracking-wide px-[calc(var(--space-unit)*2)] py-[var(--space-unit)] mb-[var(--space-unit)]">
                      Main Systems
                    </h3>
                    <div className="grid gap-[var(--command-rail-gap)]">
                      {publicLinks.map((link) => (
                        <NavLink
                          key={link.path}
                          to={link.path}
                          onClick={handleNavClick}
                          className={({ isActive }) =>
                            cn(
                              'command-rail-module group',
                              'flex items-center min-h-[var(--command-rail-module-height)]',
                              'px-[calc(var(--space-unit)*2)] py-[calc(var(--space-unit)*2)]',
                              'border-2 border-[hsl(var(--tos-etched-border))]',
                              'bg-[hsl(var(--tos-primary-black))]',
                              'transition-all duration-300 ease-out',
                              'hover:scale-[1.02] hover:shadow-[var(--command-rail-glow)]',
                              'active:translate-y-[2px]',
                              'font-trek-content font-medium uppercase tracking-wide text-sm',
                              isActive
                                ? 'bg-[hsl(var(--tos-optimism-blue))] text-white shadow-[var(--command-rail-depth)]'
                                : 'text-[hsl(var(--tos-optimism-blue))] hover:bg-[hsl(var(--tos-etched-border))]',
                              '[box-shadow:var(--command-rail-inset-shadow)]'
                            )
                          }
                        >
                          {link.label}
                        </NavLink>
                      ))}
                    </div>
                  </div>
                )}

                {/* User Links */}
                {user && (
                  <div className="command-rail-section">
                    <h3 className="command-rail-section-label text-xs font-medium text-[hsl(var(--tos-util-gray))] uppercase tracking-wide px-[calc(var(--space-unit)*2)] py-[var(--space-unit)] mb-[var(--space-unit)]">
                      Personal Systems
                    </h3>
                    <div className="grid gap-[var(--command-rail-gap)]">
                      {userLinks.map((link) => (
                        <NavLink
                          key={link.path}
                          to={link.path}
                          onClick={handleNavClick}
                          className={({ isActive }) =>
                            cn(
                              'command-rail-module group',
                              'flex items-center min-h-[var(--command-rail-module-height)]',
                              'px-[calc(var(--space-unit)*2)] py-[calc(var(--space-unit)*2)]',
                              'border-2 border-[hsl(var(--tos-etched-border))]',
                              'bg-[hsl(var(--tos-primary-black))]',
                              'transition-all duration-300 ease-out',
                              'hover:scale-[1.02] hover:shadow-[var(--command-rail-glow)]',
                              'active:translate-y-[2px]',
                              'font-trek-content font-medium uppercase tracking-wide text-sm',
                              isActive
                                ? 'bg-[hsl(var(--tos-optimism-blue))] text-white shadow-[var(--command-rail-depth)]'
                                : 'text-[hsl(var(--tos-optimism-blue))] hover:bg-[hsl(var(--tos-etched-border))]',
                              '[box-shadow:var(--command-rail-inset-shadow)]'
                            )
                          }
                        >
                          {link.label}
                        </NavLink>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                {user && (
                  <div className="command-rail-section">
                    <h3 className="command-rail-section-label text-xs font-medium text-[hsl(var(--tos-util-gray))] uppercase tracking-wide px-[calc(var(--space-unit)*2)] py-[var(--space-unit)] mb-[var(--space-unit)]">
                      Quick Actions
                    </h3>
                    <div className="grid gap-[var(--command-rail-gap)]">
                      <button
                        onClick={() => handleActionClick(() => setAddressDialogOpen(true))}
                        className={cn(
                          'command-rail-module group',
                          'flex items-center gap-3 min-h-[var(--command-rail-module-height)]',
                          'px-[calc(var(--space-unit)*2)] py-[calc(var(--space-unit)*2)]',
                          'border-2 border-[hsl(var(--tos-etched-border))]',
                          'bg-[hsl(var(--tos-primary-black))]',
                          'text-[hsl(var(--lcars-yellow))]',
                          'transition-all duration-300 ease-out',
                          'hover:scale-[1.02] hover:shadow-[var(--command-rail-glow)]',
                          'hover:bg-[hsl(var(--lcars-yellow))] hover:text-black',
                          'active:translate-y-[2px]',
                          'font-trek-content font-medium uppercase tracking-wide text-sm',
                          '[box-shadow:var(--command-rail-inset-shadow)]'
                        )}
                      >
                        <MapPin className="w-5 h-5 shrink-0" />
                        <span>Update Address</span>
                      </button>

                      <button
                        onClick={() => handleActionClick(() => setRewardsDialogOpen(true))}
                        className={cn(
                          'command-rail-module group',
                          'flex items-center gap-3 min-h-[var(--command-rail-module-height)]',
                          'px-[calc(var(--space-unit)*2)] py-[calc(var(--space-unit)*2)]',
                          'border-2 border-[hsl(var(--tos-etched-border))]',
                          'bg-[hsl(var(--tos-primary-black))]',
                          'text-[hsl(var(--lcars-light-blue))]',
                          'transition-all duration-300 ease-out',
                          'hover:scale-[1.02] hover:shadow-[var(--command-rail-glow)]',
                          'hover:bg-[hsl(var(--lcars-light-blue))] hover:text-white',
                          'active:translate-y-[2px]',
                          'font-trek-content font-medium uppercase tracking-wide text-sm',
                          '[box-shadow:var(--command-rail-inset-shadow)]'
                        )}
                      >
                        <Gift className="w-5 h-5 shrink-0" />
                        <span>Track Rewards</span>
                      </button>

                      <NavLink
                        to="/campaigns"
                        onClick={handleNavClick}
                        className={cn(
                          'command-rail-module group',
                          'flex items-center gap-3 min-h-[var(--command-rail-module-height)]',
                          'px-[calc(var(--space-unit)*2)] py-[calc(var(--space-unit)*2)]',
                          'border-2 border-[hsl(var(--tos-etched-border))]',
                          'bg-[hsl(var(--tos-primary-black))]',
                          'text-[hsl(var(--lcars-red))]',
                          'transition-all duration-300 ease-out',
                          'hover:scale-[1.02] hover:shadow-[var(--command-rail-glow)]',
                          'hover:bg-[hsl(var(--lcars-red))] hover:text-white',
                          'active:translate-y-[2px]',
                          'font-trek-content font-medium uppercase tracking-wide text-sm',
                          '[box-shadow:var(--command-rail-inset-shadow)]'
                        )}
                      >
                        <Heart className="w-5 h-5 shrink-0" />
                        <span>Explore Campaigns</span>
                      </NavLink>
                    </div>
                  </div>
                )}

                {/* Admin Sections */}
                {isAdmin && user && (
                  <div className="command-rail-section">
                    <h3 className="command-rail-section-label text-xs font-medium text-[hsl(var(--lcars-red))] uppercase tracking-wide px-[calc(var(--space-unit)*2)] py-[var(--space-unit)] mb-[var(--space-unit)] flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Admin Systems
                    </h3>
                    <div className="grid gap-[var(--command-rail-gap)]">
                      {adminSections.map((section) => (
                        <Collapsible
                          key={section.id}
                          open={openSections.includes(section.id)}
                          onOpenChange={() => toggleSection(section.id)}
                        >
                          <CollapsibleTrigger asChild>
                            <button
                              className={cn(
                                'command-rail-module group w-full',
                                'flex items-center justify-between min-h-[var(--command-rail-module-height)]',
                                'px-[calc(var(--space-unit)*2)] py-[calc(var(--space-unit)*2)]',
                                'border-2 border-[hsl(var(--lcars-red))]',
                                'bg-[hsl(var(--tos-primary-black))]',
                                'text-[hsl(var(--lcars-red))]',
                                'transition-all duration-300 ease-out',
                                'hover:scale-[1.02] hover:shadow-[var(--command-rail-glow)]',
                                'hover:bg-[hsl(var(--lcars-red))] hover:text-white',
                                'active:translate-y-[2px]',
                                'font-trek-content font-medium uppercase tracking-wide text-sm',
                                '[box-shadow:var(--command-rail-inset-shadow)]'
                              )}
                            >
                              <span>{section.label}</span>
                              {openSections.includes(section.id) ? (
                                <ChevronDown className="w-4 h-4 shrink-0" />
                              ) : (
                                <ChevronRight className="w-4 h-4 shrink-0" />
                              )}
                            </button>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="mt-[var(--command-rail-gap)] ml-[calc(var(--space-unit)*2)] grid gap-[var(--command-rail-gap)]">
                            {section.items.map((item) => (
                              <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={handleNavClick}
                                className={({ isActive }) =>
                                  cn(
                                    'command-rail-module group',
                                    'flex items-center min-h-[calc(var(--command-rail-module-height)*0.75)]',
                                    'px-[calc(var(--space-unit)*2)] py-[calc(var(--space-unit)*1.5)]',
                                    'border-2 border-[hsl(var(--tos-etched-border))]',
                                    'bg-[hsl(var(--tos-primary-black))]',
                                    'transition-all duration-300 ease-out',
                                    'hover:scale-[1.02] hover:shadow-[var(--command-rail-glow)]',
                                    'active:translate-y-[2px]',
                                    'font-trek-content font-medium uppercase tracking-wide text-xs',
                                    isActive
                                      ? 'bg-[hsl(var(--lcars-red))] text-white shadow-[var(--command-rail-depth)]'
                                      : 'text-[hsl(var(--lcars-red))] hover:bg-[hsl(var(--tos-etched-border))]',
                                    '[box-shadow:var(--command-rail-inset-shadow)]'
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
                  </div>
                )}
              </div>
            </div>

            {/* Sign Out Button - Fixed at bottom */}
            {user && (
              <div className="command-rail-footer border-t-2 border-[hsl(var(--tos-etched-border))] p-[var(--command-rail-gap)] bg-[hsl(var(--tos-primary-black))]">
                <Button
                  onClick={handleSignOut}
                  variant="destructive"
                  className={cn(
                    'command-rail-module w-full',
                    'flex items-center justify-center gap-3 min-h-[var(--command-rail-module-height)]',
                    'border-2 border-[hsl(var(--lcars-red))]',
                    'bg-[hsl(var(--tos-primary-black))]',
                    'text-[hsl(var(--lcars-red))]',
                    'transition-all duration-300 ease-out',
                    'hover:scale-[1.02] hover:shadow-[var(--command-rail-glow)]',
                    'hover:bg-[hsl(var(--lcars-red))] hover:text-white',
                    'active:translate-y-[2px]',
                    'font-trek-content font-bold uppercase tracking-wider',
                    '[box-shadow:var(--command-rail-inset-shadow)]'
                  )}
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sign Out</span>
                </Button>
              </div>
            )}
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