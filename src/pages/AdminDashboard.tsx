
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { useAuth } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Gift, 
  DollarSign, 
  Settings, 
  BarChart3, 
  UserCog,
  Home,
  Bell,
  FileText,
  Shield
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useAdminDonorsData } from "@/hooks/useAdminDonorsData";
import DonorStatsCards from "@/components/admin/DonorStatsCards";
import DonorTable from "@/components/admin/DonorTable";
import DonorPagination from "@/components/admin/DonorPagination";
import DonorSearchAndFilters from "@/components/admin/DonorSearchAndFilters";
import DonorBulkActions from "@/components/admin/DonorBulkActions";

const AdminDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { data: isAdmin, isLoading: adminLoading } = useAdminCheck();
  const navigate = useNavigate();
  
  const [activeSection, setActiveSection] = useState("overview");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDonors, setSelectedDonors] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState({
    searchTerm: '',
    sortBy: 'created_at',
    sortOrder: 'desc' as 'asc' | 'desc',
    statusFilter: 'all'
  });

  const {
    totalCount,
    activeDonorsCount,
    totalRaised,
    donors,
    isLoading: donorsLoading,
    totalPages,
    isLoadingTotal,
    isLoadingActive,
    isLoadingRaised
  } = useAdminDonorsData(currentPage, filters);

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

  const sidebarItems = [
    { id: "overview", label: "Dashboard", icon: Home },
    { id: "donors", label: "Donors", icon: Users },
    { id: "pledges", label: "Pledges", icon: DollarSign },
    { id: "rewards", label: "Rewards", icon: Gift },
    { id: "campaigns", label: "Campaigns", icon: BarChart3 },
    { id: "admins", label: "Admin Users", icon: UserCog },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "reports", label: "Reports", icon: FileText },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const handleSelectDonor = (donorId: string, checked: boolean) => {
    const newSelected = new Set(selectedDonors);
    if (checked) {
      newSelected.add(donorId);
    } else {
      newSelected.delete(donorId);
    }
    setSelectedDonors(newSelected);
  };

  const handleEdit = (donor: any) => {
    console.log('Edit donor:', donor);
    // TODO: Implement edit functionality
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

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Donors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCount?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">All registered donors</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Donors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeDonorsCount?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">Donors with pledges</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Raised</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalRaised?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">Across all campaigns</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalCount && activeDonorsCount 
                ? ((activeDonorsCount / totalCount) * 100).toFixed(1) + '%'
                : '0%'
              }
            </div>
            <p className="text-xs text-muted-foreground">Active vs total donors</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest donor activities and system events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              Activity feed coming soon...
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setActiveSection("donors")}
            >
              <Users className="h-4 w-4 mr-2" />
              Manage Donors
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setActiveSection("pledges")}
            >
              <DollarSign className="h-4 w-4 mr-2" />
              View Pledges
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setActiveSection("rewards")}
            >
              <Gift className="h-4 w-4 mr-2" />
              Manage Rewards
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderDonors = () => (
    <div className="space-y-6">
      <DonorStatsCards
        totalCount={totalCount}
        activeDonorsCount={activeDonorsCount}
        totalRaised={totalRaised}
        isLoadingTotal={isLoadingTotal}
        isLoadingActive={isLoadingActive}
        isLoadingRaised={isLoadingRaised}
      />
      
      <Card>
        <CardHeader>
          <CardTitle>Donor Management</CardTitle>
          <CardDescription>View and manage all donors in the system</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <DonorSearchAndFilters
            filters={filters}
            onFiltersChange={setFilters}
            onPageChange={setCurrentPage}
          />
          
          {selectedDonors.size > 0 && (
            <DonorBulkActions
              selectedDonors={selectedDonors}
              onClearSelection={() => setSelectedDonors(new Set())}
            />
          )}
          
          {donorsLoading ? (
            <div className="text-center py-8">Loading donors...</div>
          ) : (
            <>
              <DonorTable
                donors={donors || []}
                selectedDonors={selectedDonors}
                onSelectDonor={handleSelectDonor}
                onEdit={handleEdit}
                onSendEmail={handleSendEmail}
                onBan={handleBan}
                onActivate={handleActivate}
              />
              
              <DonorPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderPlaceholderSection = (title: string, description: string, icon: any) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon && <icon className="h-5 w-5" />}
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12 text-muted-foreground">
          <p>This section is under development.</p>
          <p className="text-sm mt-2">Check back soon for updates!</p>
        </div>
      </CardContent>
    </Card>
  );

  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return renderOverview();
      case "donors":
        return renderDonors();
      case "pledges":
        return renderPlaceholderSection("Pledge Management", "View and manage all campaign pledges", DollarSign);
      case "rewards":
        return renderPlaceholderSection("Reward Management", "Create and manage campaign rewards/perks", Gift);
      case "campaigns":
        return renderPlaceholderSection("Campaign Management", "View campaign performance and statistics", BarChart3);
      case "admins":
        return renderPlaceholderSection("Admin User Management", "Add, remove, and manage admin users", UserCog);
      case "notifications":
        return renderPlaceholderSection("Notification Center", "Manage system notifications and alerts", Bell);
      case "reports":
        return renderPlaceholderSection("Reports & Analytics", "Generate detailed reports and analytics", FileText);
      case "settings":
        return renderPlaceholderSection("Platform Settings", "Configure platform-wide settings", Settings);
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <SidebarProvider>
        <div className="flex w-full">
          <Sidebar className="border-r">
            <SidebarHeader className="p-4">
              <div className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                <h2 className="text-lg font-semibold">Admin Panel</h2>
              </div>
            </SidebarHeader>
            <SidebarContent>
              <SidebarMenu>
                {sidebarItems.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={() => setActiveSection(item.id)}
                      isActive={activeSection === item.id}
                      className="w-full"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarContent>
          </Sidebar>
          
          <main className="flex-1 p-6">
            <div className="mb-6 flex items-center gap-4">
              <SidebarTrigger />
              <div>
                <h1 className="text-2xl font-bold">
                  {sidebarItems.find(item => item.id === activeSection)?.label || "Dashboard"}
                </h1>
                <p className="text-muted-foreground">
                  {activeSection === "overview" && "Welcome to your admin dashboard"}
                  {activeSection === "donors" && "Manage and view all donors"}
                  {activeSection === "pledges" && "View and manage campaign pledges"}
                  {activeSection === "rewards" && "Create and manage rewards"}
                  {activeSection === "campaigns" && "Monitor campaign performance"}
                  {activeSection === "admins" && "Manage admin users"}
                  {activeSection === "notifications" && "System notifications"}
                  {activeSection === "reports" && "Analytics and reports"}
                  {activeSection === "settings" && "Platform configuration"}
                </p>
              </div>
            </div>
            
            {renderContent()}
          </main>
        </div>
      </SidebarProvider>
      
      <Footer />
    </div>
  );
};

export default AdminDashboard;
