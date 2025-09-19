import { useState } from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UnifiedBottomNav } from './UnifiedBottomNav';
import { MobileHamburgerMenu } from './MobileHamburgerMenu';
import { useAuth } from '@/contexts/AuthContext';

export function MobileNavigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();

  return (
    <>
      {/* Mobile Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
        <div className="flex h-20 items-start pt-4 px-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMenuOpen(true)}
            className="mr-2"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
          
          <div className="flex items-center">
            <img
              src="/lovable-uploads/4ae57c3d-f1da-43e2-93ec-016f24a0b0c4.png"
              alt="Axanar Logo"
              className="h-8 w-auto"
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
      {user && <div className="h-20 md:hidden" />}
    </>
  );
}