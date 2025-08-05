import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { Menu, X, User, LogOut, BarChart3, Shield, AlertTriangle, MessageCircle } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { AlertLevel } from "@/hooks/useAlertSystem";
import { useTranslation } from 'react-i18next';
import { MobileNavigation } from "@/components/mobile/MobileNavigation";

interface NavigationProps {
  battleMode?: boolean;
  onBattleModeToggle?: (enabled: boolean) => void;
  alertLevel?: AlertLevel;
  onAlertCycle?: () => void;
}

const Navigation = ({ battleMode = true, onBattleModeToggle, alertLevel = 'normal', onAlertCycle }: NavigationProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { data: isAdmin } = useAdminCheck();
  const location = useLocation();
  const { t } = useTranslation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleAlertClick = () => {
    onAlertCycle?.();
  };

  const getAlertButtonProps = () => {
    switch (alertLevel) {
      case 'warning':
        return {
          variant: 'secondary' as const,
          className: 'text-yellow-400 bg-yellow-900/20 hover:bg-yellow-900/30 border-yellow-400/30',
          text: t('yellow-alert')
        };
      case 'red-alert':
        return {
          variant: 'destructive' as const,
          className: 'text-red-400 bg-red-900/30 hover:bg-red-900/40 border-red-400/40 animate-pulse',
          text: t('red-alert')
        };
      default:
        return {
          variant: 'ghost' as const,
          className: 'text-white hover:text-yellow-400 hover:bg-white/10',
          text: t('status-normal')
        };
    }
  };

  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <>
      {/* Mobile Navigation */}
      <MobileNavigation />
      
      {/* Desktop Navigation */}
      <nav className={`hidden md:block bg-background/95 backdrop-blur-md border-b border-border/50 ${
        isAdminPage ? 'relative z-40' : ''
      } sticky top-0 z-50`}>
        {/* General Navigation Bar - Public Pages */}
        <div className="general-nav border-b border-border/30">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-14">
              {/* Logo */}
              <Link to="/" className="flex items-center space-x-2">
                <img 
                  src="/lovable-uploads/4ae57c3d-f1da-43e2-93ec-016f24a0b0c4.png" 
                  alt="AXANAR" 
                  className="h-8 w-auto"
                />
              </Link>
            
            {/* Main Navigation Links - Desktop */}
            <div className="flex items-center space-x-4">
              <Link to="/about">
                <Button variant="ghost" size="sm" className="trek-nav-link font-trek-content">
                  {t('about')}
                </Button>
              </Link>
              <Link to="/how-it-works">
                <Button variant="ghost" size="sm" className="trek-nav-link font-trek-content">
                  {t('how-it-works')}
                </Button>
              </Link>
              <Link to="/faq">
                <Button variant="ghost" size="sm" className="trek-nav-link font-trek-content">
                  {t('faq')}
                </Button>
              </Link>
              <Link to="/support">
                <Button variant="ghost" size="sm" className="trek-nav-link font-trek-content">
                  {t('support')}
                </Button>
              </Link>
            </div>

            {/* Right Side - Theme Toggle and Access Portal */}
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              {!user && (
                <div className="flex items-center space-x-4">
                  {location.pathname === '/auth' && (
                    <Button 
                      variant={getAlertButtonProps().variant}
                      size="sm"
                      onClick={handleAlertClick}
                      className={getAlertButtonProps().className}
                    >
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      {getAlertButtonProps().text}
                    </Button>
                  )}
                  <Link to="/auth">
                    <Button className="bg-axanar-teal hover:bg-axanar-teal/90">
                      {t('access-portal')}
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            </div>
          </div>
        </div>

        {/* Authenticated Users Bar - Only visible when logged in */}
        {user && (
          <div className="auth-nav bg-secondary/10 border-b border-border/20">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-center space-x-6 h-12">
              <Link to="/dashboard">
                <Button variant="ghost" size="sm" className={`text-white hover:text-axanar-teal hover:bg-white/10 ${
                  isActive('/dashboard') ? 'bg-axanar-teal/20 text-axanar-teal' : ''
                }`}>
                  <User className="h-4 w-4 mr-2" />
                  {t('dashboard')}
                </Button>
              </Link>
              <Link to="/messages">
                <Button variant="ghost" size="sm" className={`text-white hover:text-axanar-teal hover:bg-white/10 ${
                  isActive('/messages') ? 'bg-axanar-teal/20 text-axanar-teal' : ''
                }`}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  {t('messages')}
                </Button>
              </Link>
              {isAdmin && (
                <Link to="/admin">
                  <Button variant="ghost" size="sm" className={`text-white hover:text-axanar-teal hover:bg-white/10 ${
                    isActive('/admin') ? 'bg-axanar-teal/20 text-axanar-teal' : ''
                  }`}>
                    <Shield className="h-4 w-4 mr-2" />
                    {t('admin')}
                  </Button>
                </Link>
              )}
              <Link to="/profile">
                <Button variant="ghost" size="sm" className={`text-white hover:text-axanar-teal hover:bg-white/10 ${
                  isActive('/profile') ? 'bg-axanar-teal/20 text-axanar-teal' : ''
                }`}>
                  <User className="h-4 w-4 mr-2" />
                  {t('profile')}
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleSignOut}
                className="text-white hover:text-red-400 hover:bg-white/10"
              >
                <LogOut className="h-4 w-4 mr-2" />
                {t('sign-out')}
              </Button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navigation;