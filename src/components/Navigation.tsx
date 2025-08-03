import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { Menu, X, User, LogOut, BarChart3, Shield, AlertTriangle } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { AlertLevel } from "@/hooks/useAlertSystem";

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
          text: 'Yellow Alert'
        };
      case 'red-alert':
        return {
          variant: 'destructive' as const,
          className: 'text-red-400 bg-red-900/30 hover:bg-red-900/40 border-red-400/40 animate-pulse',
          text: 'Red Alert'
        };
      default:
        return {
          variant: 'ghost' as const,
          className: 'text-white hover:text-yellow-400 hover:bg-white/10',
          text: 'Status Normal'
        };
    }
  };

  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <nav className={`bg-background/95 backdrop-blur-md border-b border-border/50 ${
      isAdminPage ? 'relative z-40' : ''
    } sticky top-0 z-50`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src="/lovable-uploads/4ae57c3d-f1da-43e2-93ec-016f24a0b0c4.png" 
              alt="AXANAR" 
              className="h-8 w-auto"
            />
          </Link>
          
          {/* Main Navigation Links - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/about">
              <Button variant="ghost" size="sm" className="trek-nav-link font-trek-content">
                About
              </Button>
            </Link>
            <Link to="/how-it-works">
              <Button variant="ghost" size="sm" className="trek-nav-link font-trek-content">
                How It Works
              </Button>
            </Link>
            <Link to="/faq">
              <Button variant="ghost" size="sm" className="trek-nav-link font-trek-content">
                FAQ
              </Button>
            </Link>
          </div>

          {/* Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            {user ? (
              <div className="flex items-center space-x-4">
                <Link to="/dashboard">
                  <Button variant="ghost" size="sm" className={`text-white hover:text-axanar-teal hover:bg-white/10 ${
                    isActive('/dashboard') ? 'bg-axanar-teal/20 text-axanar-teal' : ''
                  }`}>
                    <User className="h-4 w-4 mr-2" />
                    Donor Dashboard
                  </Button>
                </Link>
                {isAdmin && (
                  <Link to="/admin">
                    <Button variant="ghost" size="sm" className={`text-white hover:text-axanar-teal hover:bg-white/10 ${
                      isActive('/admin') ? 'bg-axanar-teal/20 text-axanar-teal' : ''
                    }`}>
                      <Shield className="h-4 w-4 mr-2" />
                      Admin
                    </Button>
                  </Link>
                )}
                <Link to="/profile">
                  <Button variant="ghost" size="sm" className={`text-white hover:text-axanar-teal hover:bg-white/10 ${
                    isActive('/profile') ? 'bg-axanar-teal/20 text-axanar-teal' : ''
                  }`}>
                    <User className="h-4 w-4 mr-2" />
                    Account
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleSignOut}
                  className="text-white hover:text-red-400 hover:bg-white/10"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            ) : (
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
                    Access Portal
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-axanar-silver/20">
            <div className="flex flex-col space-y-4">
              {user ? (
                <>
                  <Link 
                    to="/dashboard" 
                    className={`hover:text-axanar-teal transition-colors ${
                      isActive('/dashboard') ? 'text-axanar-teal' : ''
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Donor Dashboard
                  </Link>
                  <Link 
                    to="/profile" 
                    className={`hover:text-axanar-teal transition-colors ${
                      isActive('/profile') ? 'text-axanar-teal' : ''
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Account
                  </Link>
                  {isAdmin && (
                    <Link 
                      to="/admin" 
                      className={`hover:text-axanar-teal transition-colors ${
                        isActive('/admin') ? 'text-axanar-teal' : ''
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Admin
                    </Link>
                  )}
                  <hr className="border-axanar-silver/20" />
                  <button 
                    onClick={() => {
                      handleSignOut();
                      setIsMenuOpen(false);
                    }}
                    className="text-left hover:text-red-400 transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  {location.pathname === '/auth' && (
                    <button 
                      onClick={() => {
                        handleAlertClick();
                        setIsMenuOpen(false);
                      }}
                      className={`text-left transition-colors ${
                        alertLevel === 'red-alert' ? 'text-red-400' :
                        alertLevel === 'warning' ? 'text-yellow-400' :
                        'hover:text-yellow-400'
                      }`}
                    >
                      {getAlertButtonProps().text}
                    </button>
                  )}
                  <Link 
                    to="/auth" 
                    className="hover:text-axanar-teal transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Access Portal
                  </Link>
                  <hr className="border-axanar-silver/20 my-4" />
                  <Link 
                    to="/about" 
                    className={`hover:text-axanar-teal transition-colors ${isActive('/about') ? 'text-axanar-teal' : ''}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    About
                  </Link>
                  <Link 
                    to="/how-it-works" 
                    className={`hover:text-axanar-teal transition-colors ${isActive('/how-it-works') ? 'text-axanar-teal' : ''}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    How It Works
                  </Link>
                  <Link 
                    to="/faq" 
                    className={`hover:text-axanar-teal transition-colors ${isActive('/faq') ? 'text-axanar-teal' : ''}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    FAQ
                  </Link>
                  <Link 
                    to="/support" 
                    className={`hover:text-axanar-teal transition-colors ${isActive('/support') ? 'text-axanar-teal' : ''}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Support
                  </Link>
                  <Link 
                    to="/privacy" 
                    className={`hover:text-axanar-teal transition-colors ${isActive('/privacy') ? 'text-axanar-teal' : ''}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Privacy Policy
                  </Link>
                  <Link 
                    to="/terms" 
                    className={`hover:text-axanar-teal transition-colors ${isActive('/terms') ? 'text-axanar-teal' : ''}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Terms of Service
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
