import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ProfileSidebarNav } from "@/components/profile/ProfileSidebarNav";
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
import { useAuth } from "@/contexts/AuthContext";

const Dashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const sectionParam = searchParams.get('section');
  const [activeSection, setActiveSection] = useState(sectionParam || "overview");
  const { signOut } = useAuth();
  const navigate = useNavigate();

  // Update active section when URL parameter changes
  useEffect(() => {
    if (sectionParam) {
      setActiveSection(sectionParam);
    }
  }, [sectionParam]);

  // Update URL when section changes
  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    setSearchParams({ section });
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return <AdminOverview onSectionChange={handleSectionChange} />;
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
        return <AdminOverview onSectionChange={handleSectionChange} />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation Header */}
      <div className="sticky top-0 z-50 border-b">
        <Navigation />
      </div>
      
      {/* Full Height Admin Interface */}
      <SidebarProvider defaultOpen>
        <div className="flex w-full">
          <ProfileSidebarNav
            onSignOut={handleSignOut}
            isAdmin={true}
            isAdminContext={true}
          />
          
          {/* Main Content Area */}
          <main className="flex-1 overflow-x-hidden">
            <div className="bg-background border-b px-4 py-3 flex items-center gap-2">
              <SidebarTrigger />
              <h2 className="text-lg font-semibold">Admin Dashboard</h2>
            </div>
            
            <div className="p-6">
              <AdminHeader activeSection={activeSection} />
              {renderContent()}
            </div>
            
            {/* Inline Footer */}
            <div className="border-t bg-muted/30 px-6 py-4">
              <div className="text-sm text-muted-foreground text-center">
                © 2025 AXANAR Admin Dashboard. All rights reserved.
              </div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default Dashboard;
