
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
    <div className="mb-6 flex items-center gap-4">
      <div className="flex items-center gap-4">
        <div className="p-2 bg-primary/10 rounded-lg">
          <SidebarTrigger className="h-10 w-10" />
        </div>
        {CurrentIcon && (
          <div className="p-2 bg-primary/10 rounded-lg">
            <CurrentIcon className="h-10 w-10 text-primary" />
          </div>
        )}
      </div>
      <div>
        <h1 className="text-8xl font-bold tracking-tight">
          {currentSection?.label || "Dashboard"}
        </h1>
        <p className="text-muted-foreground">
          {getSectionDescription(activeSection)}
        </p>
      </div>
    </div>
  );
};

export default AdminHeader;
