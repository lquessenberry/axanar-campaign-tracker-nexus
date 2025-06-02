// src/pages/AdminPanel.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useAuth } from '../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { RefreshCw, Settings, Download } from 'lucide-react';
import { supabase } from '../integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../components/ui/alert-dialog";
import { Label } from "../components/ui/label";
import AdminRoleManager from "../components/AdminRoleManager";
import UserManagement from "../components/UserManagement";
import SupabaseDebugger from "../components/SupabaseDebugger";
import DonorManagement from "../components/DonorManagement";
import { DonorProfile } from '../api/donors';

const AdminPanel: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  
  // Donor dialog states
  const [currentDonor, setCurrentDonor] = useState<DonorProfile | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Form state for editing donor
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  
  // Check if user is admin
  useEffect(() => {
    if (user && !isAdmin) {
      // Redirect non-admin users
      navigate('/');
    }
  }, [user, isAdmin, navigate]);
  
  // Function to handle donor editing
  const handleEditDonor = (donor: DonorProfile) => {
    setCurrentDonor(donor);
    // Use the donor_name field if it exists, otherwise use full_name
    setDonorName(donor.donor_name || donor.full_name || "");
    setDonorEmail(donor.email || "");
    setIsEditDialogOpen(true);
  };

  // Function to handle donor deletion
  const handleDeleteDonor = (donor: DonorProfile) => {
    setCurrentDonor(donor);
    setIsDeleteDialogOpen(true);
  };

  // Function to save edited donor
  const saveDonorChanges = async () => {
    if (!currentDonor) return;
    
    try {
      // Update donor in Supabase
      const { error } = await supabase
        .from('donors')
        .update({
          donor_name: donorName,
          email: donorEmail,
        })
        .eq('id', currentDonor.id);
      
      if (error) throw error;
      
      console.log('Donor updated successfully');
      // Close the dialog
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating donor:', error);
    }
  };

  // Function to confirm donor deletion
  const confirmDeleteDonor = async () => {
    if (!currentDonor) return;
    
    try {
      // Delete donor from Supabase
      const { error } = await supabase
        .from('donors')
        .delete()
        .eq('id', currentDonor.id);
      
      if (error) throw error;
      
      console.log('Donor deleted successfully');
      // Close the dialog
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting donor:', error);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Admin Control Panel</h1>
            <p className="text-muted-foreground">Manage application settings and users</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-5 gap-4 w-full max-w-4xl">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="donors">Donors</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="roles">Roles</TabsTrigger>
            <TabsTrigger value="debug">Debug Tools</TabsTrigger>
          </TabsList>
          
          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Total Donors</CardTitle>
                  <CardDescription>Lifetime registered donor count</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">17,479</div>
                  <p className="text-xs text-muted-foreground">+2.5% from last month</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Total Donations</CardTitle>
                  <CardDescription>Lifetime donation count</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">24,702</div>
                  <p className="text-xs text-muted-foreground">+1.8% from last month</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Total Amount</CardTitle>
                  <CardDescription>Lifetime donation value</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">$1.48M</div>
                  <p className="text-xs text-muted-foreground">Across all campaigns</p>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest user and donor actions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">New donor registered</p>
                        <p className="text-xs text-muted-foreground">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Database backup completed</p>
                        <p className="text-xs text-muted-foreground">3 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">User role updated</p>
                        <p className="text-xs text-muted-foreground">5 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">New donation recorded</p>
                        <p className="text-xs text-muted-foreground">6 hours ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>System Status</CardTitle>
                  <CardDescription>Current system metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Supabase Connection</p>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '100%' }}></div>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-green-600">Healthy</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">API Performance</p>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '92%' }}></div>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-green-600">92%</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Database Usage</p>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: '68%' }}></div>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-yellow-500">68%</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Storage</p>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '23%' }}></div>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-green-600">23%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Donors Tab */}
          <TabsContent value="donors" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Donor Management</CardTitle>
                <CardDescription>View and manage campaign donors</CardDescription>
              </CardHeader>
              <CardContent>
                <DonorManagement 
                  onEditDonor={handleEditDonor} 
                  onDeleteDonor={handleDeleteDonor} 
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage user accounts and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <UserManagement />
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Roles Tab */}
          <TabsContent value="roles" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Role Management</CardTitle>
                <CardDescription>Define and assign user roles</CardDescription>
              </CardHeader>
              <CardContent>
                <AdminRoleManager />
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Debug Tools Tab */}
          <TabsContent value="debug" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Debug Tools</CardTitle>
                <CardDescription>Developer debug tools and database inspection</CardDescription>
              </CardHeader>
              <CardContent>
                <SupabaseDebugger />
                
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Backup & Restore</CardTitle>
                    <CardDescription>System backup controls</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Database Backup</h4>
                        <div className="text-sm text-muted-foreground mb-2">Last backup: May 30, 2023 at 2:30 AM</div>
                        <Button variant="outline" className="w-full">
                          <Download className="h-4 w-4 mr-2" />
                          Create Backup
                        </Button>
                      </div>
                      
                      <div className="border-t my-4 pt-4">
                        <h4 className="font-medium mb-2">Restore From Backup</h4>
                        <div className="text-sm text-muted-foreground mb-2">Upload a previous system backup file</div>
                        <div className="border-2 border-dashed rounded-md p-4 text-center text-muted-foreground">
                          Click to browse or drag and drop file
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      {/* Edit Donor Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Donor</DialogTitle>
            <DialogDescription>
              Make changes to the donor information below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="donor-name">Donor Name</Label>
              <Input 
                id="donor-name" 
                value={donorName} 
                onChange={(e) => setDonorName(e.target.value)} 
                placeholder="Enter donor name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="donor-email">Email</Label>
              <Input 
                id="donor-email" 
                type="email" 
                value={donorEmail} 
                onChange={(e) => setDonorEmail(e.target.value)} 
                placeholder="Enter donor email"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveDonorChanges}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Donor Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the donor 
              {currentDonor?.donor_name || currentDonor?.full_name ? ` ${currentDonor.donor_name || currentDonor.full_name}` : ''}
              and all associated data from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteDonor} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <Footer />
    </div>
  );
};

export default AdminPanel;
