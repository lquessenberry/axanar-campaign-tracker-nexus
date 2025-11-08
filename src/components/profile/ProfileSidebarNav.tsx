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
  Users
} from "lucide-react";
import { Link } from "react-router-dom";
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

interface ProfileSidebarNavProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onSignOut: () => void;
}

export function ProfileSidebarNav({ 
  activeSection, 
  onSectionChange,
  onSignOut 
}: ProfileSidebarNavProps) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar className={isCollapsed ? "w-14" : "w-64"}>
      <SidebarContent className="flex flex-col h-full">
        {/* Profile Sections */}
        <SidebarGroup>
          <SidebarGroupLabel className={isCollapsed ? "sr-only" : ""}>
            Profile
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu>
              {profileSections.map((section) => (
                <SidebarMenuItem key={section.value}>
                  <SidebarMenuButton
                    onClick={() => onSectionChange(section.value)}
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