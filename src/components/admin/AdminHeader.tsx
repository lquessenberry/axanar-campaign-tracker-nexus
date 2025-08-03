
import { SidebarTrigger } from "@/components/ui/sidebar";
import { sidebarItems } from "./adminSidebarConfig";

interface AdminHeaderProps {
  activeSection: string;
}

const AdminHeader = ({ activeSection }: AdminHeaderProps) => {
  const getSectionDescription = (section: string) => {
    const descriptions = {
      overview: "Welcome to your admin dashboard",
      donors: "Manage and view all donors",
      pledges: "View and manage campaign pledges",
      rewards: "Create and manage rewards",
      campaigns: "Monitor campaign performance",
      admins: "Manage admin users",
      notifications: "System notifications",
      reports: "Analytics and reports",
      settings: "Platform configuration"
    };
    return descriptions[section as keyof typeof descriptions] || "";
  };

  const currentSection = sidebarItems.find(item => item.id === activeSection);
  const CurrentIcon = currentSection?.icon;

  return (
    <div className="mb-8 flex items-start gap-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
          <SidebarTrigger className="h-8 w-8 text-primary" />
        </div>
        {CurrentIcon && (
          <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
            <CurrentIcon className="h-8 w-8 text-primary" />
          </div>
        )}
      </div>
      <div className="flex-1">
        <h1 className="text-4xl font-bold tracking-tight mb-2">
          {currentSection?.label || "Dashboard"}
        </h1>
        <p className="text-muted-foreground text-lg">
          {getSectionDescription(activeSection)}
        </p>
      </div>
    </div>
  );
};

export default AdminHeader;
