import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { Menu, X, User, LogOut, BarChart3, Shield, AlertTriangle } from "lucide-react";

interface NavigationProps {
  battleMode?: boolean;
  onBattleModeToggle?: (enabled: boolean) => void;
}

const Navigation = ({ battleMode = true, onBattleModeToggle }: NavigationProps) => {
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

  const handleBattleModeToggle = () => {
    const newBattleMode = !battleMode;
    onBattleModeToggle?.(newBattleMode);
  };

  return (
    <nav className="bg-axanar-dark text-white border-b border-axanar-silver/20">
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

          {/* Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <Link to="/dashboard">
                  <Button variant="ghost" size="sm" className="text-white hover:text-axanar-teal hover:bg-white/10">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                {isAdmin && (
                  <Link to="/admin">
                    <Button variant="ghost" size="sm" className="text-white hover:text-axanar-teal hover:bg-white/10">
                      <Shield className="h-4 w-4 mr-2" />
                      Admin
                    </Button>
                  </Link>
                )}
                <Link to="/profile">
                  <Button variant="ghost" size="sm" className="text-white hover:text-axanar-teal hover:bg-white/10">
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
                    variant="ghost" 
                    size="sm"
                    onClick={handleBattleModeToggle}
                    className={`${battleMode 
                      ? 'text-red-400 bg-red-900/20 hover:bg-red-900/30' 
                      : 'text-white hover:text-red-400 hover:bg-white/10'
                    }`}
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Red Alert
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
                    Dashboard
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
                      className="hover:text-axanar-teal transition-colors"
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
                        handleBattleModeToggle();
                        setIsMenuOpen(false);
                      }}
                      className={`text-left transition-colors ${battleMode 
                        ? 'text-red-400' 
                        : 'hover:text-red-400'
                      }`}
                    >
                      Red Alert {battleMode ? '(ON)' : '(OFF)'}
                    </button>
                  )}
                  <Link 
                    to="/auth" 
                    className="hover:text-axanar-teal transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Access Portal
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
