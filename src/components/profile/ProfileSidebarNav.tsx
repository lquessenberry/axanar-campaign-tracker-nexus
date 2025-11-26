import React from "react";
import { 
  LayoutDashboard, 
  User, 
  Activity, 
  Settings, 
  LogOut, 
  Gift,
  MessageCircle,
  Trophy,
  Sparkles,
  Home,
  Users,
  BarChart3,
  UserCog,
  FolderOpen,
  Package
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
  { title: "Overview", value: "overview", icon: LayoutDashboard },
  { title: "About", value: "about", icon: User },
  { title: "Activity", value: "activity", icon: Activity },
  { title: "Settings", value: "settings", icon: Settings },
];

const navigationLinks = [
  { title: "Home", path: "/", icon: Home },
  { title: "Forum", path: "/forum", icon: MessageCircle },
  { title: "Messages", path: "/messages", icon: Users },
  { title: "Leaderboard", path: "/leaderboard", icon: Trophy },
  { title: "Rewards", path: "/how-to-earn-ares", icon: Sparkles },
];

const adminSections = [
  { title: "Dashboard", value: "overview", path: "/admin/dashboard", icon: Home },
  { title: "Donor Management", value: "donor-management", path: "/admin/dashboard?section=donor-management", icon: Users },
  { title: "Campaigns", value: "campaigns", path: "/admin/dashboard?section=campaigns", icon: BarChart3 },
  { title: "Rewards", value: "rewards", path: "/admin/dashboard?section=rewards", icon: Gift },
  { title: "Pledge Restoration", value: "pledge-restoration", path: "/admin/dashboard?section=pledge-restoration", icon: Package },
  { title: "Analytics", value: "analytics", path: "/admin/analytics", icon: Activity },
  { title: "Messages", value: "messages", path: "/admin/dashboard?section=messages", icon: MessageCircle },
  { title: "Media & Files", value: "media-files", path: "/admin/dashboard?section=media-files", icon: FolderOpen },
  { title: "Admin Users", value: "admins", path: "/admin/dashboard?section=admins", icon: UserCog },
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

  return (
    <div className="relative">
      {/* Sidebar Toggle Button */}
      <div className="absolute -right-16 top-32 z-50">
        <SidebarTrigger className="bg-primary text-primary-foreground hover:bg-primary/90 p-4 rounded-r-lg shadow-lg border-r-4 border-t-4 border-b-4 border-primary/50 transition-all duration-200 hover:shadow-xl min-h-[72px] min-w-[72px]" />
      </div>
      
      <Sidebar 
        collapsible="icon"
        className={`${isCollapsed ? "w-24" : "w-56 lg:w-64"} pt-24 lg:pt-28 ml-2 lg:ml-4 mr-1 lg:mr-2 mb-4 border-l-4 border-primary bg-muted/30 backdrop-blur-sm shadow-lg`}
      >
        <SidebarContent className="flex flex-col h-full bg-gradient-to-b from-primary/5 to-transparent">
        {/* Profile Sections - Only show when not in admin context */}
        {!isAdminContext && (
          <>
            <SidebarGroup>
              <SidebarGroupLabel className={isCollapsed ? "sr-only" : "text-primary font-bold uppercase text-xs tracking-wider border-b border-primary/30 pb-2 mb-2"}>
                Profile
              </SidebarGroupLabel>
              
              <SidebarGroupContent className="!p-0 !m-0">
                <SidebarMenu className="!gap-0 !p-0">
                  {profileSections.map((section) => (
                    <SidebarMenuItem key={section.value} className="!p-0 !m-0">
                      <SidebarMenuButton
                        onClick={() => onSectionChange?.(section.value)}
                        isActive={activeSection === section.value}
                        className={`transition-all duration-200 !m-0 ${isCollapsed ? 'justify-center !px-4 min-h-[72px]' : 'min-h-[48px]'} ${
                          activeSection === section.value 
                            ? "bg-primary text-primary-foreground font-semibold shadow-md border-l-4 border-primary-foreground" 
                            : "hover:bg-primary/20 hover:border-l-4 hover:border-primary/50"
                        }`}
                      >
                        <section.icon className={isCollapsed ? "h-7 w-7" : "h-5 w-5"} />
                        {!isCollapsed && <span>{section.title}</span>}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <Separator className="my-2" />
          </>
        )}

        {/* Admin Sections - Only show when user is admin */}
        {isAdmin && (
          <>
            <SidebarGroup>
              <SidebarGroupLabel className={isCollapsed ? "sr-only" : "text-primary font-bold uppercase text-xs tracking-wider border-b border-primary/30 pb-2 mb-2"}>
                Admin
              </SidebarGroupLabel>
              
              <SidebarGroupContent className="!p-0 !m-0">
                <SidebarMenu className="!gap-0 !p-0"  >
                  {adminSections.map((section) => (
                    <SidebarMenuItem key={section.value} className="!p-0 !m-0">
                      <SidebarMenuButton
                        onClick={() => handleAdminSectionClick(section)}
                        isActive={isAdminSectionActive(section)}
                        className={`transition-all duration-200 !m-0 ${isCollapsed ? 'justify-center !px-4 min-h-[72px]' : 'min-h-[48px]'} ${
                          isAdminSectionActive(section)
                            ? "bg-primary text-primary-foreground font-semibold shadow-md border-l-4 border-primary-foreground" 
                            : "hover:bg-primary/20 hover:border-l-4 hover:border-primary/50"
                        }`}
                      >
                        <section.icon className={isCollapsed ? "h-7 w-7" : "h-5 w-5"} />
                        {!isCollapsed && <span>{section.title}</span>}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <Separator className="my-2" />
          </>
        )}

        {/* Navigation Links */}
        <SidebarGroup>
          <SidebarGroupLabel className={isCollapsed ? "sr-only" : "text-primary font-bold uppercase text-xs tracking-wider border-b border-primary/30 pb-2 mb-2"}>
            Navigate
          </SidebarGroupLabel>
          
          <SidebarGroupContent className="!p-0 !m-0">
            <SidebarMenu className="!gap-0 !p-0">
              {navigationLinks.map((link) => (
                <SidebarMenuItem key={link.path} className="!p-0 !m-0">
                  <SidebarMenuButton asChild>
                    <Link 
                      to={link.path}
                      className={`hover:bg-primary/20 hover:border-l-4 hover:border-primary/50 transition-all duration-200 !m-0 ${isCollapsed ? 'justify-center !px-4 min-h-[72px]' : 'min-h-[48px]'}`}
                    >
                      <link.icon className={isCollapsed ? "h-7 w-7" : "h-5 w-5"} />
                      {!isCollapsed && <span>{link.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Sign Out at Bottom */}
        <div className="mt-auto p-2 border-t border-primary/30 bg-muted/20">
          <Button
            variant="ghost"
            onClick={onSignOut}
            className={`w-full ${isCollapsed ? 'justify-center !px-4 min-h-[72px]' : 'justify-start min-h-[48px]'} text-destructive hover:text-destructive hover:bg-destructive/20 font-semibold transition-all duration-200 border-l-4 border-transparent hover:border-l-4 hover:border-destructive`}
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