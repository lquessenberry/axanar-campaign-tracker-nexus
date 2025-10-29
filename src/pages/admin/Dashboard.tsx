import { useState } from "react";
import Navigation from "@/components/Navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminOverview from "@/components/admin/AdminOverview";
import AdminRewardsSection from "@/components/admin/AdminRewardsSection";
import AdminAdminsSection from "@/components/admin/AdminAdminsSection";
import AdminPlaceholderSection from "@/components/admin/AdminPlaceholderSection";
import DonorManagement from "./DonorManagement";
import MediaFiles from "./MediaFiles";
import CampaignsWithPledges from "./CampaignsWithPledges";
import Settings from "./Settings";
import { MessageCircle } from "lucide-react";

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState("overview");

  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return <AdminOverview onSectionChange={setActiveSection} />;
      case "donor-management":
        return <DonorManagement />;
      case "campaigns":
        return <CampaignsWithPledges />;
      case "rewards":
        return <AdminRewardsSection />;
      case "messages":
        return <AdminPlaceholderSection title="Messages" description="Admin message center" Icon={MessageCircle} />;
      case "media-files":
        return <MediaFiles />;
      case "admins":
        return <AdminAdminsSection />;
      case "settings":
        return <Settings />;
      default:
        return <AdminOverview onSectionChange={setActiveSection} />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Fixed Navigation Header */}
      <div className="sticky top-0 z-50 bg-background border-b">
        <Navigation />
      </div>
      
      {/* Full Height Admin Interface */}
      <div className="flex flex-1 min-h-0">
        <SidebarProvider>
          {/* Enhanced Admin Sidebar - Fixed positioning */}
          <div className="relative">
            <AdminSidebar
              activeSection={activeSection}
              onSectionChange={setActiveSection}
            />
          </div>
          
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0 bg-background">
            <div className="flex-1 overflow-auto">
              <div className="p-6">
                <AdminHeader activeSection={activeSection} />
                {renderContent()}
              </div>
            </div>
            
            {/* Inline Footer - Stays within content area */}
            <div className="border-t bg-muted/30 px-6 py-4">
              <div className="text-sm text-muted-foreground text-center">
                © 2025 AXANAR Admin Dashboard. All rights reserved.
              </div>
            </div>
          </div>
        </SidebarProvider>
      </div>
    </div>
  );
};

export default Dashboard;
