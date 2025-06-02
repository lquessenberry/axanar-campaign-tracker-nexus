
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Search, User, LogOut, Settings, BarChart3, Users, CreditCard, Layers } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut, loading, profile, donorProfile } = useAuth();
  const [directSession, setDirectSession] = useState(null);
  // Always set isAdmin to true during development
  const [isAdmin, setIsAdmin] = useState(true);
  
  // Add direct session check and check admin role
  useEffect(() => {
    async function checkSession() {
      const { data } = await supabase.auth.getSession();
      console.log('Direct session check:', data.session);
      setDirectSession(data.session);
      
      // Admin state is already set to true by default during development
      
      if (data.session?.user) {
        // Check if user has admin role in metadata
        const { data: userData } = await supabase.auth.getUser();
        console.log('User data:', userData);
        // In production, you would use this logic instead:
        // const userMetadata = userData?.user?.user_metadata;
        // const hasAdminRole = userMetadata?.role === 'admin' || userMetadata?.role === 'super_admin';
        // setIsAdmin(hasAdminRole || userData?.user?.email?.includes('axanar') || userData?.user?.email?.includes('admin'));
      }
    }
    checkSession();
  }, []);
  
  // Debug logging for auth state
  console.log('Navigation auth state:', { 
    userExists: !!user,
    directSessionExists: !!directSession,
    userId: user?.id || directSession?.user?.id,
    userEmail: user?.email || directSession?.user?.email,
    profileExists: !!profile,
    donorProfileExists: !!donorProfile,
    isLoading: loading
  });

  const handleSignOut = () => {
    console.log('Sign out requested - using simple redirect approach');
    
    // The simplest, most reliable approach - just go to logout URL
    // This will trigger Supabase's logout flow without any JavaScript execution
    window.location.href = '/#logout';
    
    // After a brief delay, reload the page to clear state
    setTimeout(() => {
      console.log('Reloading page after logout');
      window.location.href = '/';
    }, 200);
  };

  return (
    <nav className="bg-axanar-dark text-white border-b border-axanar-teal/20">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-display font-bold text-axanar-teal">
              <img 
                src="/lovable-uploads/4ae57c3d-f1da-43e2-93ec-016f24a0b0c4.png" 
                alt="AXANAR" 
                className="h-8 w-auto"
              />
              <span className="sr-only">AXANAR</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-sm font-medium hover:text-axanar-teal transition-colors">
              Home
            </Link>
            <Link to="/campaigns" className="text-sm font-medium hover:text-axanar-teal transition-colors">
              Campaigns
            </Link>
            <Link to="/about" className="text-sm font-medium hover:text-axanar-teal transition-colors">
              About
            </Link>
            {/* Direct admin links visible to everyone in development */}
            <Link to="/admin" className="text-sm font-medium text-axanar-teal hover:text-axanar-teal/80 transition-colors flex items-center">
              <Settings className="mr-1 h-4 w-4" /> Admin
            </Link>
            <Link to="/admin/campaigns" className="text-sm font-medium text-axanar-teal hover:text-axanar-teal/80 transition-colors flex items-center">
              <BarChart3 className="mr-1 h-4 w-4" /> Campaigns
            </Link>
            <Link to="/admin/pledges" className="text-sm font-medium text-axanar-teal hover:text-axanar-teal/80 transition-colors flex items-center">
              <CreditCard className="mr-1 h-4 w-4" /> Pledges
            </Link>
            {isAdmin && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="text-sm font-medium bg-axanar-teal/20 border-axanar-teal text-white hover:bg-axanar-teal/30 transition-colors flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    Admin
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem asChild>
                    <Link to="/admin">
                      <Settings className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/admin/system-diagrams">
                      <Layers className="mr-2 h-4 w-4" />
                      System Architecture
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/admin/campaigns">
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Campaign Management
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/admin/pledges">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Pledge Management
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/admin/donors">
                      <Users className="mr-2 h-4 w-4" />
                      Donor Management
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/admin/users">
                      <Users className="mr-2 h-4 w-4" />
                      User Management
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon">
                <Search className="h-5 w-5" />
              </Button>
              
              {/* Use both AuthContext user and direct session check */}
              {(user || directSession?.user) ? (
                <>
                  <div className="text-xs text-white mr-2">{user?.email || directSession?.user?.email}</div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <User className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link to="/profile">Profile</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/dashboard">Dashboard</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/donor-directory">Donor Directory</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/pledges">Pledge Manager</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/analytics">Analytics</Link>
                      </DropdownMenuItem>
                      
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <span className="font-semibold text-axanar-teal">Admin Tools</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/admin">
                          <Settings className="mr-2 h-4 w-4" />
                          Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/admin/system-diagrams">
                          <Layers className="mr-2 h-4 w-4" />
                          System Architecture
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/admin/campaigns">
                          <BarChart3 className="mr-2 h-4 w-4" />
                          Campaign Management
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/admin/pledges">
                          <CreditCard className="mr-2 h-4 w-4" />
                          Pledge Management
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/admin/donors">
                          <Users className="mr-2 h-4 w-4" />
                          Donor Management
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/admin/users">
                          <Users className="mr-2 h-4 w-4" />
                          User Management
                        </Link>
                      </DropdownMenuItem>
                      
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleSignOut}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Link to="/auth">
                    <Button variant="outline" className="border-axanar-teal text-axanar-teal hover:bg-axanar-teal/10">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/auth">
                    <Button className="bg-axanar-teal text-white hover:bg-axanar-teal/90">
                      Start a Campaign
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden pt-4 pb-2 space-y-4 animate-fade-in">
            <Link to="/" className="block py-2 text-sm font-medium hover:text-axanar-teal">
              Home
            </Link>
            <Link to="/campaigns" className="block py-2 text-sm font-medium hover:text-axanar-teal">
              Campaigns
            </Link>
            <Link to="/about" className="block py-2 text-sm font-medium hover:text-axanar-teal">
              About
            </Link>
            
            {/* Direct admin links visible to everyone in mobile menu */}
            <div className="mt-2 pt-2 border-t border-axanar-teal/20">
              <div className="py-1 text-sm font-semibold text-axanar-teal">Admin Shortcuts</div>
              <Link to="/admin" className="block py-2 text-sm font-medium text-axanar-teal hover:text-axanar-teal/80 flex items-center">
                <Settings className="mr-2 h-4 w-4" /> Admin Dashboard
              </Link>
              <Link to="/admin/campaigns" className="block py-2 text-sm font-medium text-axanar-teal hover:text-axanar-teal/80 flex items-center">
                <BarChart3 className="mr-2 h-4 w-4" /> Campaign Management
              </Link>
              <Link to="/admin/pledges" className="block py-2 text-sm font-medium text-axanar-teal hover:text-axanar-teal/80 flex items-center">
                <CreditCard className="mr-2 h-4 w-4" /> Pledge Management
              </Link>
            </div>
            
            {isAdmin && (
              <div className="py-2">
                <div className="flex items-center py-2">
                  <Button variant="outline" className="w-full bg-axanar-teal/20 border-axanar-teal text-white hover:bg-axanar-teal/30 justify-start">
                    <Settings className="mr-2 h-4 w-4" />
                    <span className="font-semibold">Admin Access</span>
                  </Button>
                </div>
                <div className="pl-4 border-l-2 border-axanar-teal/30 ml-2 mt-1 space-y-2">
                  <Link to="/admin" className="block py-1 text-sm font-medium hover:text-axanar-teal flex items-center">
                    <Settings className="mr-2 h-4 w-4" /> Dashboard
                  </Link>
                  <Link to="/admin/system-diagrams" className="block py-1 text-sm font-medium hover:text-axanar-teal flex items-center">
                    <Layers className="mr-2 h-4 w-4" /> System Architecture
                  </Link>
                  <Link to="/admin/campaigns" className="block py-1 text-sm font-medium hover:text-axanar-teal flex items-center">
                    <BarChart3 className="mr-2 h-4 w-4" /> Campaign Management
                  </Link>
                  <Link to="/admin/pledges" className="block py-1 text-sm font-medium hover:text-axanar-teal flex items-center">
                    <CreditCard className="mr-2 h-4 w-4" /> Pledge Management
                  </Link>
                  <Link to="/admin/donors" className="block py-1 text-sm font-medium hover:text-axanar-teal flex items-center">
                    <Users className="mr-2 h-4 w-4" /> Donor Management
                  </Link>
                  <Link to="/admin/users" className="block py-1 text-sm font-medium hover:text-axanar-teal flex items-center">
                    <Users className="mr-2 h-4 w-4" /> User Management
                  </Link>
                </div>
              </div>
            )}
            <div className="pt-2 flex flex-col space-y-2">
              {/* Mobile menu - use both auth context and direct session */}
              {(user || directSession?.user) ? (
                <>
                  <div className="text-xs text-white py-2">{user?.email || directSession?.user?.email}</div>
                  <Link to="/profile">
                    <Button variant="outline" className="w-full border-axanar-teal text-axanar-teal">
                      Profile
                    </Button>
                  </Link>
                  <Link to="/dashboard">
                    <Button variant="outline" className="w-full border-axanar-teal text-axanar-teal">
                      Dashboard
                    </Button>
                  </Link>
                  
                  {/* Admin tools are now in the main mobile menu, no need for duplicate here */}
                  
                  <Button 
                    onClick={handleSignOut}
                    variant="outline" 
                    className="w-full border-red-500 text-red-500 mt-4"
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/auth">
                    <Button variant="outline" className="w-full border-axanar-teal text-axanar-teal">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/auth">
                    <Button className="w-full bg-axanar-teal text-white">
                      Start a Campaign
                    </Button>
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
