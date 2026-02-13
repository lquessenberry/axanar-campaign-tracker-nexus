import { AnnouncementBanner } from "@/components/AnnouncementBanner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Menu } from "lucide-react";
import { useState } from "react";
import { MobileHamburgerMenu } from "./MobileHamburgerMenu";
import { UnifiedBottomNav } from "./UnifiedBottomNav";

export function MobileNavigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();

  return (
    <>
      {/* Mobile Header — single sticky container for banner + nav */}
      <div className="lg:hidden sticky top-0 z-50">
        <AnnouncementBanner />
        <header className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-16 items-center px-4 gap-4">
            <Button
              variant="ghost"
              onClick={() => setIsMenuOpen(true)}
              className="min-w-[48px] min-h-[48px] p-2"
            >
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>

            <div className="flex items-center">
              <img
                src="/lovable-uploads/4ae57c3d-f1da-43e2-93ec-016f24a0b0c4.png"
                alt="Axanar Logo"
                className="h-10 w-auto"
              />
            </div>
          </div>
        </header>
      </div>

      {/* Hamburger Menu */}
      <MobileHamburgerMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        profile={user}
      />

      {/* Bottom Navigation */}
      <UnifiedBottomNav />

      {/* Bottom padding for authenticated users to prevent content overlap */}
      {user && <div className="h-24 lg:hidden" />}
    </>
  );
}
