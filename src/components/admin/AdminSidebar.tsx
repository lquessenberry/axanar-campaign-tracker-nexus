
import { Shield, ChevronRight } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { sidebarItems } from "./adminSidebarConfig";

interface AdminSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const AdminSidebar = ({ activeSection, onSectionChange }: AdminSidebarProps) => {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar className="bg-gradient-to-b from-axanar-dark to-slate-900 border-r border-axanar-silver/20 h-full overflow-hidden shadow-2xl">
      {/* Enhanced Header with Gradient Background */}
      <SidebarHeader className="p-6 bg-gradient-to-r from-axanar-teal/20 to-transparent border-b border-axanar-silver/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-axanar-teal/20 rounded-lg backdrop-blur-sm">
              <Shield className="h-6 w-6 text-axanar-teal" />
            </div>
            {!isCollapsed && (
              <div className="animate-fade-in">
                <h2 className="text-lg font-bold text-white">Admin Control</h2>
                <p className="text-xs text-axanar-silver/80">AXANAR Platform</p>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <SidebarTrigger className="text-axanar-silver hover:text-white hover:bg-white/10 rounded-md p-1" />
          )}
        </div>
      </SidebarHeader>

      {/* Enhanced Content Area */}
      <SidebarContent className="p-4 space-y-2">
        <SidebarMenu>
          {sidebarItems.map((item, index) => (
            <SidebarMenuItem key={item.id} className="animate-fade-in" style={{animationDelay: `${index * 0.1}s`}}>
              <SidebarMenuButton
                onClick={() => onSectionChange(item.id)}
                isActive={activeSection === item.id}
                className={`
                  w-full group relative overflow-hidden transition-all duration-300 ease-out
                  ${activeSection === item.id 
                    ? 'bg-gradient-to-r from-axanar-teal to-axanar-teal/80 text-white shadow-lg shadow-axanar-teal/25 border border-axanar-teal/50' 
                    : 'text-axanar-silver hover:text-white hover:bg-white/10 hover:shadow-md hover:scale-105'
                  }
                  rounded-lg px-4 py-3 font-medium
                `}
              >
                <div className="flex items-center gap-3 relative z-10">
                  <item.icon className={`h-5 w-5 transition-transform duration-300 ${
                    activeSection === item.id ? 'scale-110' : 'group-hover:scale-110'
                  }`} />
                  {!isCollapsed && (
                    <>
                      <span className="flex-1 text-left font-semibold">{item.label}</span>
                      {activeSection === item.id && (
                        <ChevronRight className="h-4 w-4 animate-pulse" />
                      )}
                    </>
                  )}
                </div>
                
                {/* Subtle hover effect background */}
                <div className={`
                  absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent 
                  transform translate-x-full group-hover:translate-x-0 transition-transform duration-500
                  ${activeSection === item.id ? 'hidden' : ''}
                `} />
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      {/* Enhanced Footer with Status */}
      {!isCollapsed && (
        <div className="p-4 border-t border-axanar-silver/20 bg-gradient-to-r from-transparent to-axanar-teal/10">
          <div className="flex items-center gap-2 text-xs text-axanar-silver/80">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>System Online</span>
          </div>
        </div>
      )}

      {/* Collapsed State Trigger */}
      {isCollapsed && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <SidebarTrigger className="text-axanar-silver hover:text-white hover:bg-white/10 rounded-md p-2" />
        </div>
      )}
    </Sidebar>
  );
};

export default AdminSidebar;
