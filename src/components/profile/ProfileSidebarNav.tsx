import React from "react";
import { LayoutDashboard, User, Activity, Settings, LogOut, Gift } from "lucide-react";
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

const sections = [
  { title: "Overview", value: "overview", icon: LayoutDashboard },
  { title: "About", value: "about", icon: User },
  { title: "Activity", value: "activity", icon: Activity },
  { title: "Settings", value: "settings", icon: Settings },
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
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={isCollapsed ? "sr-only" : ""}>
            Account Sections
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu>
              {sections.map((section) => (
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