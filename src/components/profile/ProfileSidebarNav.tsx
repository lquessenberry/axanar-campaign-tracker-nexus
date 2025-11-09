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
  FolderOpen
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
    <Sidebar className={`${isCollapsed ? "w-14" : "w-56 lg:w-64"} pt-24 lg:pt-28 ml-2 lg:ml-4 mr-1 lg:mr-2 mb-4 border-0`}>
      <SidebarContent className="flex flex-col h-full">
        {/* Profile Sections - Only show when not in admin context */}
        {!isAdminContext && (
          <>
            <SidebarGroup>
              <SidebarGroupLabel className={isCollapsed ? "sr-only" : ""}>
                Profile
              </SidebarGroupLabel>
              
              <SidebarGroupContent>
                <SidebarMenu>
                  {profileSections.map((section) => (
                    <SidebarMenuItem key={section.value}>
                      <SidebarMenuButton
                        onClick={() => onSectionChange?.(section.value)}
                        isActive={activeSection === section.value}
                        className="hover:bg-muted/50 data-[active=true]:bg-primary/10 data-[active=true]:text-primary data-[active=true]:font-semibold"
                      >
                        <section.icon className="h-4 w-4" />
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
              <SidebarGroupLabel className={isCollapsed ? "sr-only" : ""}>
                Admin
              </SidebarGroupLabel>
              
              <SidebarGroupContent>
                <SidebarMenu>
                  {adminSections.map((section) => (
                    <SidebarMenuItem key={section.value}>
                      <SidebarMenuButton
                        onClick={() => handleAdminSectionClick(section)}
                        isActive={isAdminSectionActive(section)}
                        className="hover:bg-muted/50 data-[active=true]:bg-primary/10 data-[active=true]:text-primary data-[active=true]:font-semibold"
                      >
                        <section.icon className="h-4 w-4" />
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
          <SidebarGroupLabel className={isCollapsed ? "sr-only" : ""}>
            Navigate
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationLinks.map((link) => (
                <SidebarMenuItem key={link.path}>
                  <SidebarMenuButton asChild>
                    <Link 
                      to={link.path}
                      className="hover:bg-muted/50"
                    >
                      <link.icon className="h-4 w-4" />
                      {!isCollapsed && <span>{link.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Sign Out at Bottom */}
        <div className="mt-auto p-4 border-t">
          <Button
            variant="ghost"
            onClick={onSignOut}
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4" />
            {!isCollapsed && <span className="ml-2">Sign Out</span>}
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}