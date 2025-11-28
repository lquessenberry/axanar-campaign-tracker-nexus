import { useState } from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UnifiedBottomNav } from './UnifiedBottomNav';
import { MobileHamburgerMenu } from './MobileHamburgerMenu';
import { useAuth } from '@/contexts/AuthContext';
import { AnnouncementBanner } from '@/components/AnnouncementBanner';

export function MobileNavigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();

  return (
    <>
      {/* Announcement Banner - Mobile */}
      <div className="md:hidden sticky top-0 z-50">
        <AnnouncementBanner />
      </div>

      {/* Mobile Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
        <div className="flex h-24 items-center px-4 gap-4">
          <Button
            variant="ghost"
            onClick={() => setIsMenuOpen(true)}
            className="min-w-[72px] min-h-[72px] p-4"
          >
            <Menu className="h-8 w-8" />
            <span className="sr-only">Toggle menu</span>
          </Button>
          
          <div className="flex items-center">
            <img
              src="/lovable-uploads/4ae57c3d-f1da-43e2-93ec-016f24a0b0c4.png"
              alt="Axanar Logo"
              className="h-12 w-auto"
            />
          </div>
        </div>
      </header>

      {/* Hamburger Menu */}
      <MobileHamburgerMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        profile={user}
      />

      {/* Bottom Navigation */}
      <UnifiedBottomNav />

      {/* Bottom padding for authenticated users to prevent content overlap */}
      {user && <div className="h-24 md:hidden" />}
    </>
  );
}