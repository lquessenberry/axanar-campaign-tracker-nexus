import { 
  SidebarTrigger 
} from "@/components/ui/sidebar";
import { 
  Home,
  Users,
  BarChart3,
  Gift,
  Activity,
  MessageCircle,
  FolderOpen,
  UserCog,
  Settings,
  LucideIcon
} from "lucide-react";

interface AdminHeaderProps {
  activeSection: string;
}

const sectionConfig: Record<string, { icon: LucideIcon; label: string; description: string }> = {
  overview: {
    icon: Home,
    label: "Dashboard",
    description: "Welcome to your admin dashboard"
  },
  "donor-management": {
    icon: Users,
    label: "Donor Management",
    description: "Manage and view all donors"
  },
  campaigns: {
    icon: BarChart3,
    label: "Campaigns",
    description: "Monitor campaign performance"
  },
  rewards: {
    icon: Gift,
    label: "Rewards & Benefits",
    description: "Create and manage rewards"
  },
  analytics: {
    icon: Activity,
    label: "Visitor Analytics",
    description: "Analytics and reports"
  },
  messages: {
    icon: MessageCircle,
    label: "Messages",
    description: "Admin message center"
  },
  "media-files": {
    icon: FolderOpen,
    label: "Media & Files",
    description: "Manage media assets"
  },
  admins: {
    icon: UserCog,
    label: "Admin Users",
    description: "Manage admin users"
  },
  settings: {
    icon: Settings,
    label: "Settings",
    description: "Platform configuration"
  }
};

const AdminHeader = ({ activeSection }: AdminHeaderProps) => {
  const currentSection = sectionConfig[activeSection] || sectionConfig.overview;
  const CurrentIcon = currentSection.icon;

  return (
    <div className="mb-8 flex items-start gap-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
          <SidebarTrigger className="h-8 w-8 text-primary" />
        </div>
        <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
          <CurrentIcon className="h-8 w-8 text-primary" />
        </div>
      </div>
      <div className="flex-1">
        <h1 className="text-4xl font-bold tracking-tight mb-2">
          PATRON DATABANK NEXUS
        </h1>
        <p className="text-muted-foreground text-lg">
          {currentSection.description}
        </p>
      </div>
    </div>
  );
};

export default AdminHeader;
