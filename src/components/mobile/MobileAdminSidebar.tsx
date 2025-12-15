import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  DollarSign, 
  Gift, 
  BarChart3, 
  MessageCircle, 
  UserSearch, 
  FolderOpen, 
  Box, 
  HardDrive, 
  UserCog, 
  Bell, 
  FileText, 
  Settings,
  ChevronDown,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export function MobileAdminSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [openSections, setOpenSections] = useState<string[]>(['overview']);
  const location = useLocation();

  const toggleSection = (section: string) => {
    setOpenSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const adminSections = [
    {
      id: 'overview',
      label: 'Overview',
      items: [
        { id: 'dashboard', label: 'Dashboard', path: '/admin/dashboard', icon: Home }
      ]
    },
    {
      id: 'donor-management',
      label: 'Donor Management',
      items: [
        { id: 'donors', label: 'Donors', path: '/admin/donors', icon: Users },
        { id: 'pledges', label: 'Pledges', path: '/admin/pledges', icon: DollarSign },
        { id: 'rewards', label: 'Rewards', path: '/admin/rewards', icon: Gift },
        { id: 'campaigns', label: 'Campaigns', path: '/admin/campaigns', icon: BarChart3 }
      ]
    },
    {
      id: 'communication',
      label: 'Communication',
      items: [
        { id: 'messages', label: 'Messages', path: '/admin/messages', icon: MessageCircle },
        { id: 'notifications', label: 'Notifications', path: '/admin/notifications', icon: Bell }
      ]
    },
    {
      id: 'content-management',
      label: 'Content Management',
      items: [
        { id: 'user-profiles', label: 'User Profiles', path: '/admin/user-profiles', icon: UserSearch },
        { id: 'file-manager', label: 'File Manager', path: '/admin/file-manager', icon: FolderOpen },
        { id: 'models', label: '3D Models', path: '/admin/models', icon: Box },
        { id: 'storage', label: 'Storage', path: '/admin/storage', icon: HardDrive }
      ]
    },
    {
      id: 'admin-settings',
      label: 'Admin Settings',
      items: [
        { id: 'admins', label: 'Admin Users', path: '/admin/admins', icon: UserCog },
        { id: 'reports', label: 'Reports', path: '/admin/reports', icon: FileText },
        { id: 'settings', label: 'Settings', path: '/admin/settings', icon: Settings }
      ]
    }
  ];

  const isActiveItem = (path: string) => location.pathname === path;
  const isSectionActive = (section: typeof adminSections[0]) => 
    section.items.some(item => isActiveItem(item.path));

  return (
    <div className="md:hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="fixed top-24 left-4 z-[60] bg-background/95 backdrop-blur-sm border shadow-lg"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle admin menu</span>
          </Button>
        </SheetTrigger>
        
        <SheetContent side="left" className="w-80 p-0 z-[70]">
          <SheetHeader className="p-6 border-b">
            <SheetTitle className="text-left">Admin Panel</SheetTitle>
          </SheetHeader>
          
          <div className="flex flex-col h-full overflow-y-auto">
            <div className="flex-1 p-4 space-y-4">
              {adminSections.map((section) => {
                const sectionActive = isSectionActive(section);
                const isExpanded = openSections.includes(section.id);
                
                return (
                  <Collapsible
                    key={section.id}
                    open={isExpanded}
                    onOpenChange={() => toggleSection(section.id)}
                  >
                    <CollapsibleTrigger 
                      className={cn(
                        "flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-md transition-colors",
                        sectionActive 
                          ? "bg-primary/10 text-primary" 
                          : "hover:bg-muted"
                      )}
                    >
                      <span>{section.label}</span>
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent className="ml-3 mt-1 space-y-1">
                      {section.items.map((item) => (
                        <NavLink
                          key={item.id}
                          to={item.path}
                          onClick={() => setIsOpen(false)}
                          className={({ isActive }) =>
                            cn(
                              "flex items-center px-3 py-2 text-sm rounded-md transition-colors",
                              isActive
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted"
                            )
                          }
                        >
                          <item.icon className="w-4 h-4 mr-3" />
                          {item.label}
                        </NavLink>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}