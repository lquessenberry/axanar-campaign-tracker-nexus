import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { useAuth } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { SidebarProvider } from "@/components/ui/sidebar";
import { 
  DollarSign, 
  Gift, 
  BarChart3, 
  UserCog,
  Bell,
  FileText,
  Settings
} from "lucide-react";
import { useAdminDonorsData } from "@/hooks/useAdminDonorsData";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminOverview from "@/components/admin/AdminOverview";
import AdminDonorsSection from "@/components/admin/AdminDonorsSection";
import AdminPlaceholderSection from "@/components/admin/AdminPlaceholderSection";

const AdminDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { data: isAdmin, isLoading: adminLoading } = useAdminCheck();
  const navigate = useNavigate();
  
  const [activeSection, setActiveSection] = useState("overview");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDonors, setSelectedDonors] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [statusFilter, setStatusFilter] = useState('all');

  const {
    totalCount,
    authenticatedCount,
    totalRaised,
    donors,
    isLoading: donorsLoading,
    totalPages,
    itemsPerPage,
    isLoadingTotal,
    isLoadingAuthenticated,
    isLoadingRaised,
  } = useAdminDonorsData(currentPage, {
    searchTerm,
    sortBy,
    sortOrder,
    statusFilter
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    } else if (!adminLoading && !isAdmin && user) {
      navigate('/');
    }
  }, [user, isAdmin, authLoading, adminLoading, navigate]);

  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">Loading...</div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  const handleSelectDonor = (donorId: string, checked: boolean) => {
    const newSelected = new Set(selectedDonors);
    if (checked) {
      newSelected.add(donorId);
    } else {
      newSelected.delete(donorId);
    }
    setSelectedDonors(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set<string>(donors?.map(donor => donor.id) || []);
      setSelectedDonors(allIds);
    } else {
      setSelectedDonors(new Set());
    }
  };


  const handleSendEmail = (donor: any) => {
    console.log('Send email to donor:', donor);
    // TODO: Implement email functionality
  };

  const handleBan = (donor: any) => {
    console.log('Ban donor:', donor);
    // TODO: Implement ban functionality
  };

  const handleActivate = (donor: any) => {
    console.log('Activate donor:', donor);
    // TODO: Implement activate functionality
  };

  const handleBulkEmail = () => {
    console.log('Bulk email to', selectedDonors.size, 'donors');
  };

  const handleBulkExport = () => {
    console.log('Bulk export', selectedDonors.size, 'donors');
  };

  const handleBulkCreateAccounts = () => {
    console.log('Bulk create accounts for', selectedDonors.size, 'donors');
  };

  const handleBulkDelete = () => {
    console.log('Bulk delete', selectedDonors.size, 'donors');
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSortBy('created_at');
    setSortOrder('desc');
    setStatusFilter('all');
    setCurrentPage(1);
  };

  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return (
          <AdminOverview
            onSectionChange={setActiveSection}
          />
        );
      case "donors":
        return (
          <AdminDonorsSection
            totalCount={totalCount || 0}
            authenticatedCount={authenticatedCount || 0}
            totalRaised={totalRaised || 0}
            donors={donors || []}
            isLoadingTotal={isLoadingTotal}
            isLoadingAuthenticated={isLoadingAuthenticated}
            isLoadingRaised={isLoadingRaised}
            donorsLoading={donorsLoading}
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            selectedDonors={selectedDonors}
            searchTerm={searchTerm}
            sortBy={sortBy}
            sortOrder={sortOrder}
            statusFilter={statusFilter}
            onPageChange={setCurrentPage}
            onSelectDonor={handleSelectDonor}
            onSelectAll={handleSelectAll}
            onSearchChange={setSearchTerm}
            onSortChange={setSortBy}
            onSortOrderToggle={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            onStatusFilterChange={setStatusFilter}
            onClearFilters={handleClearFilters}
            onSendEmail={handleSendEmail}
            onBan={handleBan}
            onActivate={handleActivate}
            onBulkEmail={handleBulkEmail}
            onBulkExport={handleBulkExport}
            onBulkCreateAccounts={handleBulkCreateAccounts}
            onBulkDelete={handleBulkDelete}
          />
        );
      case "pledges":
        return <AdminPlaceholderSection title="Pledge Management" description="View and manage all campaign pledges" Icon={DollarSign} />;
      case "rewards":
        return <AdminPlaceholderSection title="Reward Management" description="Create and manage campaign rewards/perks" Icon={Gift} />;
      case "campaigns":
        return <AdminPlaceholderSection title="Campaign Management" description="View campaign performance and statistics" Icon={BarChart3} />;
      case "admins":
        return <AdminPlaceholderSection title="Admin User Management" description="Add, remove, and manage admin users" Icon={UserCog} />;
      case "notifications":
        return <AdminPlaceholderSection title="Notification Center" description="Manage system notifications and alerts" Icon={Bell} />;
      case "reports":
        return <AdminPlaceholderSection title="Reports & Analytics" description="Generate detailed reports and analytics" Icon={FileText} />;
      case "settings":
        return <AdminPlaceholderSection title="Platform Settings" description="Configure platform-wide settings" Icon={Settings} />;
      default:
        return (
          <AdminOverview
            onSectionChange={setActiveSection}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      <div className="flex flex-1 min-h-0">
        <SidebarProvider>
          <AdminSidebar
            activeSection={activeSection}
            onSectionChange={setActiveSection}
          />
          
          <div className="flex-1 flex flex-col min-w-0">
            <div className="p-6 flex-1 overflow-auto">
              <AdminHeader activeSection={activeSection} />
              {renderContent()}
            </div>
          </div>
        </SidebarProvider>
      </div>
      
      <Footer />
    </div>
  );
};

export default AdminDashboard;
