import React from "react";
import { 
  User, 
  Settings, 
  LogOut, 
  Trophy,
  Sparkles,
  Home,
  Users,
  BarChart3,
  Package,
  Activity,
  Video,
  MessageCircle
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const profileSections = [
  { title: "Rewards", value: "rewards", icon: Package },
  { title: "Progress", value: "progress", icon: Trophy },
  { title: "About", value: "about", icon: User },
  { title: "Activity", value: "activity", icon: BarChart3 },
  { title: "Settings", value: "settings", icon: Settings },
];

const navigationLinks = [
  { title: "Home", path: "/", icon: Home },
  { title: "Forum", path: "/forum", icon: MessageCircle },
  { title: "Messages", path: "/messages", icon: Users },
  { title: "Leaderboard", path: "/leaderboard", icon: Trophy },
  { title: "Rewards Info", path: "/how-to-earn-ares", icon: Sparkles },
];

// Consolidated 8-section admin navigation
const adminSections = [
  { title: "Dashboard", value: "overview", path: "/admin/dashboard", icon: Home },
  { title: "Donors", value: "donor-management", path: "/admin/dashboard?section=donor-management", icon: Users },
  { title: "Pledges & Rewards", value: "pledges-rewards", path: "/admin/dashboard?section=pledges-rewards", icon: Package },
  { title: "Titles & Perks", value: "titles", path: "/admin/dashboard?section=titles", icon: Trophy },
  { title: "Campaigns", value: "campaigns", path: "/admin/dashboard?section=campaigns", icon: BarChart3 },
  { title: "Media & Videos", value: "media-files", path: "/admin/dashboard?section=media-files", icon: Video },
  { title: "Analytics", value: "analytics", path: "/admin/dashboard?section=analytics", icon: Activity },
  { title: "Utilities", value: "utilities", path: "/admin/dashboard?section=utilities", icon: Sparkles },
  { title: "Settings", value: "settings", path: "/admin/dashboard?section=settings", icon: Settings },
];

interface ProfileSidebarNavProps {
  activeSection?: string;
  onSectionChange?: (section: string) => void;
  onSignOut: () => void;
  isAdmin?: boolean;
  isAdminContext?: boolean;
}

export function ProfileSidebarNav({ 
  activeSection = '',
  onSectionChange,
  onSignOut,
  isAdmin = false,
  isAdminContext = false
}: ProfileSidebarNavProps) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();

  const handleAdminSectionClick = (section: { value: string; path: string }) => {
    if (section.path) {
      navigate(section.path);
    }
  };

  const isAdminSectionActive = (section: { value: string; path: string }) => {
    if (section.path === location.pathname) return true;
    if (section.path.includes('?section=')) {
      const sectionParam = new URLSearchParams(location.search).get('section');
      return sectionParam === section.value;
    }
    return false;
  };

  // Consistent LCARS menu item styling
  const menuItemClass = (isActive: boolean, isCollapsed: boolean) => `
    transition-all duration-200 !m-0 uppercase tracking-wide font-medium
    ${isCollapsed 
      ? 'justify-center !p-0 w-[72px] h-[72px] rounded-none rounded-l-full' 
      : 'min-h-[44px] rounded-none rounded-r-full pl-4'
    }
    ${isActive 
      ? "bg-primary/90 text-primary-foreground font-bold border-r-4 border-accent shadow-[inset_0_0_20px_rgba(var(--primary),0.3)]" 
      : "hover:bg-primary/20 border-r-4 border-transparent hover:border-primary/60"
    }
  `;

  return (
    <div className="relative">
      {/* Sidebar Toggle Button */}
      <div className="absolute left-full ml-2 top-32 z-50">
        <SidebarTrigger className="lcars-btn-pill-l bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg transition-all duration-200 hover:shadow-xl w-[72px] h-[72px] flex items-center justify-center" />
      </div>
      
      <Sidebar 
        collapsible="icon"
        className={`${isCollapsed ? "w-24" : "w-56 lg:w-64"} top-[13rem] h-[calc(100svh-13rem)] pt-4 ml-2 lg:ml-4 mr-1 lg:mr-2 mb-4 bg-black/80 backdrop-blur-md border-l-[6px] border-t border-b border-primary rounded-tl-3xl rounded-bl-lg shadow-[0_0_30px_rgba(var(--primary),0.2)]`}
      >
        <SidebarContent className="flex flex-col h-full">
          {/* Profile Sections - Only show when not in admin context */}
          {!isAdminContext && (
            <>
              <SidebarGroup>
                <SidebarGroupLabel className={isCollapsed ? "sr-only" : "text-primary font-bold uppercase text-xs tracking-[0.2em] px-4 py-3 border-b border-primary/40"}>
                  Profile
                </SidebarGroupLabel>
                
                <SidebarGroupContent className="!p-0 !m-0 mt-1">
                  <SidebarMenu className="!p-0 !gap-1">
                    {profileSections.map((section) => (
                      <SidebarMenuItem key={section.value} className="!p-0 !m-0">
                        <SidebarMenuButton
                          onClick={() => onSectionChange?.(section.value)}
                          isActive={activeSection === section.value}
                          className={menuItemClass(activeSection === section.value, isCollapsed)}
                        >
                          <section.icon className={isCollapsed ? "h-7 w-7" : "h-5 w-5"} />
                          {!isCollapsed && <span className="text-sm">{section.title}</span>}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              <div className="h-px bg-gradient-to-r from-primary/60 via-primary/30 to-transparent mx-2 my-3" />
            </>
          )}

          {/* Admin Sections - Only show when user is admin */}
          {isAdmin && (
            <>
              <SidebarGroup>
                <SidebarGroupLabel className={isCollapsed ? "sr-only" : "text-primary font-bold uppercase text-xs tracking-[0.2em] px-4 py-3 border-b border-primary/40"}>
                  Admin
                </SidebarGroupLabel>
                
                <SidebarGroupContent className="!p-0 !m-0 mt-1">
                  <SidebarMenu className="!p-0 !gap-1">
                    {adminSections.map((section) => (
                      <SidebarMenuItem key={section.value} className="!p-0 !m-0">
                        <SidebarMenuButton
                          onClick={() => handleAdminSectionClick(section)}
                          isActive={isAdminSectionActive(section)}
                          className={menuItemClass(isAdminSectionActive(section), isCollapsed)}
                        >
                          <section.icon className={isCollapsed ? "h-6 w-6" : "h-4 w-4"} />
                          {!isCollapsed && <span className="text-sm">{section.title}</span>}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              <div className="h-px bg-gradient-to-r from-primary/60 via-primary/30 to-transparent mx-2 my-3" />
            </>
          )}

          {/* Navigation Links */}
          <SidebarGroup>
            <SidebarGroupLabel className={isCollapsed ? "sr-only" : "text-primary font-bold uppercase text-xs tracking-[0.2em] px-4 py-3 border-b border-primary/40"}>
              Navigate
            </SidebarGroupLabel>
            
            <SidebarGroupContent className="!p-0 !m-0 mt-1">
              <SidebarMenu className="!p-0 !gap-1">
                {navigationLinks.map((link) => (
                  <SidebarMenuItem key={link.path} className="!p-0 !m-0">
                    <SidebarMenuButton asChild>
                      <Link 
                        to={link.path}
                        className={menuItemClass(location.pathname === link.path, isCollapsed)}
                      >
                        <link.icon className={isCollapsed ? "h-7 w-7" : "h-5 w-5"} />
                        {!isCollapsed && <span className="text-sm">{link.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Sign Out at Bottom */}
          <div className="mt-auto p-3 border-t border-primary/40">
            <Button
              variant="ghost"
              onClick={onSignOut}
              className={`
                ${isCollapsed 
                  ? 'justify-center !p-0 w-[72px] h-[72px] rounded-none rounded-l-full' 
                  : 'w-full justify-start min-h-[48px] rounded-none rounded-r-full pl-4'
                } 
                uppercase tracking-wide font-bold
                text-destructive bg-destructive/10 
                hover:text-destructive-foreground hover:bg-destructive 
                border-r-4 border-destructive/50 hover:border-destructive
                transition-all duration-200
              `}
            >
              <LogOut className={isCollapsed ? "h-7 w-7" : "h-5 w-5"} />
              {!isCollapsed && <span className="ml-2">Sign Out</span>}
            </Button>
          </div>
        </SidebarContent>
      </Sidebar>
    </div>
  );
}