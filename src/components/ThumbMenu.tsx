
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import HamburgerIcon from "./HamburgerIcon";
import { 
  User, 
  LogIn, 
  LogOut, 
  BarChart3, 
  Shield,
  Home
} from "lucide-react";

const ThumbMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { data: isAdmin } = useAdminCheck();
  const location = useLocation();

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const menuItems = [
    {
      icon: Home,
      label: "Home",
      path: "/",
      show: true
    },
    {
      icon: LogIn,
      label: "Login",
      path: "/auth",
      show: !user
    },
    {
      icon: BarChart3,
      label: "Dashboard",
      path: "/dashboard",
      show: !!user
    },
    {
      icon: User,
      label: "Account",
      path: "/profile",
      show: !!user
    },
    {
      icon: Shield,
      label: "Admin",
      path: "/admin",
      show: !!user && !!isAdmin
    }
  ];

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Floating Menu Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-14 h-14 rounded-full shadow-lg transition-all duration-300 relative overflow-hidden ${
            isOpen 
              ? 'bg-red-600 hover:bg-red-700 rotate-45' 
              : 'bg-axanar-teal hover:bg-axanar-teal/90'
          }`}
        >
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `
                radial-gradient(circle at 10px 9px, transparent 4px, rgba(255,255,255,0.3) 5px, rgba(255,255,255,0.3) 6px, transparent 7px),
                radial-gradient(circle at 25px 9px, transparent 4px, rgba(255,255,255,0.3) 5px, rgba(255,255,255,0.3) 6px, transparent 7px),
                radial-gradient(circle at 17.5px 22px, transparent 4px, rgba(255,255,255,0.3) 5px, rgba(255,255,255,0.3) 6px, transparent 7px)
              `,
              backgroundSize: '35px 30px',
              backgroundPosition: '0 0'
            }}
          />
          <HamburgerIcon isOpen={isOpen} />
        </Button>

        {/* Menu Items */}
        <div className={`absolute bottom-16 right-0 transition-all duration-300 ${
          isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}>
          <div className="flex flex-col gap-3 items-end">
            {menuItems
              .filter(item => item.show)
              .map((item, index) => (
                <div key={item.path} className="flex items-center gap-3">
                  <span className="bg-white text-axanar-dark px-3 py-1 rounded-lg shadow-md text-sm font-medium whitespace-nowrap">
                    {item.label}
                  </span>
                  <Link 
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                  >
                    <Button
                      variant="secondary"
                      size="sm"
                      className={`w-12 h-12 rounded-full shadow-md transition-all duration-200 ${
                        location.pathname === item.path 
                          ? 'bg-axanar-teal text-white' 
                          : 'bg-white text-axanar-dark hover:bg-gray-100'
                      }`}
                      style={{
                        animationDelay: `${index * 50}ms`
                      }}
                    >
                      <item.icon className="h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              ))}
            
            {/* Sign Out Button */}
            {user && (
              <div className="flex items-center gap-3">
                <span className="bg-white text-axanar-dark px-3 py-1 rounded-lg shadow-md text-sm font-medium whitespace-nowrap">
                  Sign Out
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleSignOut}
                  className="w-12 h-12 rounded-full shadow-md bg-red-100 text-red-600 hover:bg-red-200 transition-all duration-200"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ThumbMenu;
