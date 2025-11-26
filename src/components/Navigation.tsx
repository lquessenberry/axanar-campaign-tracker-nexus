import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { useCampaigns } from "@/hooks/useCampaigns";
import { useRealtimeMessages } from "@/hooks/useRealtimeMessages";
import { Menu, X, User, LogOut, BarChart3, Shield, AlertTriangle, MessageCircle, ChevronDown } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { AlertLevel } from "@/hooks/useAlertSystem";
import { useTranslation } from 'react-i18next';
import { MobileNavigation } from "@/components/mobile/MobileNavigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const { data: campaigns = [] } = useCampaigns();
  const { getUnreadCount } = useRealtimeMessages();
  const location = useLocation();
  const { t } = useTranslation();
  const unreadCount = user ? getUnreadCount() : 0;

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
            <div className="flex items-center justify-between h-20">
              {/* Logo */}
              <Link to="/" className="flex items-center space-x-2">
                <img 
                  src="/lovable-uploads/4ae57c3d-f1da-43e2-93ec-016f24a0b0c4.png" 
                  alt="AXANAR" 
                  className="h-8 w-auto"
                />
              </Link>
            
            {/* Main Navigation Links - Desktop */}
            <div className="flex items-center space-x-2">
              <Link to="/about">
                <Button variant="ghost" className="trek-nav-link font-trek-content min-h-[72px] px-6 py-4 text-base">
                  {t('about')}
                </Button>
              </Link>
              <Link to="/how-it-works">
                <Button variant="ghost" className="trek-nav-link font-trek-content min-h-[72px] px-6 py-4 text-base">
                  {t('how-it-works')}
                </Button>
              </Link>
              <Link to="/how-to-earn-ares">
                <Button variant="ghost" className="trek-nav-link font-trek-content min-h-[72px] px-6 py-4 text-base">
                  How ARES Works
                </Button>
              </Link>
              <Link to="/forum">
                <Button variant="ghost" className="trek-nav-link font-trek-content min-h-[72px] px-6 py-4 text-base">
                  Forum
                </Button>
              </Link>
              
              {/* Campaigns Dropdown */}
              {campaigns.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="trek-nav-link font-trek-content min-h-[72px] px-6 py-4 text-base">
                      Campaigns
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-64 bg-background/95 backdrop-blur-md border z-[60] shadow-lg">
                    {campaigns.slice(0, 8).map((campaign) => (
                      <DropdownMenuItem key={campaign.id} asChild>
                        <Link to={`/campaign/${campaign.id}`} className="flex flex-col items-start p-3">
                          <span className="font-medium truncate w-full">{campaign.title}</span>
                          <div className="flex items-center justify-between w-full mt-1 text-xs text-muted-foreground">
                            <span>{campaign.category}</span>
                            <span>${campaign.current_amount.toLocaleString()}</span>
                          </div>
                        </Link>
                      </DropdownMenuItem>
                    ))}
                    {campaigns.length > 8 && (
                      <DropdownMenuItem asChild>
                        <Link to="/campaigns" className="text-center text-sm text-primary font-medium">
                          View All Campaigns
                        </Link>
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              
              <Link to="/faq">
                <Button variant="ghost" className="trek-nav-link font-trek-content min-h-[72px] px-6 py-4 text-base">
                  {t('faq')}
                </Button>
              </Link>
              <Link to="/support">
                <Button variant="ghost" className="trek-nav-link font-trek-content min-h-[72px] px-6 py-4 text-base">
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
                      onClick={handleAlertClick}
                      className={`${getAlertButtonProps().className} min-h-[72px] px-6 py-4 text-base`}
                    >
                      <AlertTriangle className="h-5 w-5 mr-2" />
                      {getAlertButtonProps().text}
                    </Button>
                  )}
                  <Link to="/auth">
                    <Button className="bg-axanar-teal hover:bg-axanar-teal/90 min-h-[72px] px-8 py-4 text-base font-medium">
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
              <div className="flex items-center justify-center space-x-3 h-20">
              <Link to="/dashboard">
                <Button variant="ghost" className={`text-white hover:text-axanar-teal hover:bg-white/10 min-h-[72px] px-6 py-4 text-base ${
                  isActive('/dashboard') ? 'bg-axanar-teal/20 text-axanar-teal' : ''
                }`}>
                  <User className="h-5 w-5 mr-2" />
                  {t('dashboard')}
                </Button>
              </Link>
              <Link to="/direct-messages">
                <Button variant="ghost" className={`relative text-white hover:text-axanar-teal hover:bg-white/10 min-h-[72px] px-6 py-4 text-base ${
                  isActive('/direct-messages') ? 'bg-axanar-teal/20 text-axanar-teal' : ''
                }`}>
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Direct Messages
                  {unreadCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-6 w-6 flex items-center justify-center p-0 text-xs"
                    >
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </Badge>
                  )}
                </Button>
              </Link>
              <Link to="/messages">
                <Button variant="ghost" className={`text-white hover:text-axanar-teal hover:bg-white/10 min-h-[72px] px-6 py-4 text-base ${
                  isActive('/messages') ? 'bg-axanar-teal/20 text-axanar-teal' : ''
                }`}>
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Support
                </Button>
              </Link>
              {isAdmin && (
                <Link to="/admin">
                  <Button variant="ghost" className={`text-white hover:text-axanar-teal hover:bg-white/10 min-h-[72px] px-6 py-4 text-base ${
                    isActive('/admin') ? 'bg-axanar-teal/20 text-axanar-teal' : ''
                  }`}>
                    <Shield className="h-5 w-5 mr-2" />
                    {t('admin')}
                  </Button>
                </Link>
              )}
              <Link to="/profile">
                <Button variant="ghost" className={`text-white hover:text-axanar-teal hover:bg-white/10 min-h-[72px] px-6 py-4 text-base ${
                  isActive('/profile') ? 'bg-axanar-teal/20 text-axanar-teal' : ''
                }`}>
                  <User className="h-5 w-5 mr-2" />
                  {t('profile')}
                </Button>
              </Link>
              <Link to="/forum">
                <Button variant="ghost" className={`text-white hover:text-axanar-teal hover:bg-white/10 min-h-[72px] px-6 py-4 text-base ${
                  isActive('/forum') ? 'bg-axanar-teal/20 text-axanar-teal' : ''
                }`}>
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Forum
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                onClick={handleSignOut}
                className="text-white hover:text-red-400 hover:bg-white/10 min-h-[72px] px-6 py-4 text-base"
              >
                <LogOut className="h-5 w-5 mr-2" />
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