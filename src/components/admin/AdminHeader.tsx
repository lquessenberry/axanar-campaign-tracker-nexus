
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

  return (
    <div className="mb-6 flex items-center gap-4">
      <SidebarTrigger />
      <div>
        <h1 className="text-2xl font-bold">
          {sidebarItems.find(item => item.id === activeSection)?.label || "Dashboard"}
        </h1>
        <p className="text-muted-foreground">
          {getSectionDescription(activeSection)}
        </p>
      </div>
    </div>
  );
};

export default AdminHeader;
