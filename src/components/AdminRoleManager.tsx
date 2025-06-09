// src/components/AdminRoleManager.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { PlusCircle, UserCheck, UserX, AlertTriangle } from 'lucide-react';
import type { PostgrestError } from '@supabase/supabase-js';

// Types for message display
type MessageType = {
  text: string;
  type: 'success' | 'error' | 'info';
} | null;

// Type for admin action operations
type AdminActionType = 'promote' | 'demote' | 'remove';

// Database types (simplified for brevity, ensure these match your actual schema if more detail is needed)
interface AdminUserRow {
  id: string;
  user_id: string;
  is_super_admin: boolean;
  is_content_manager: boolean;
  created_at: string;
  updated_at: string;
}

interface DonorRow {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  auth_user_id?: string;
}

// Extended admin user type with email and name info
interface AdminUser {
  id: string;
  user_id: string;
  email: string | null;
  is_super_admin: boolean;
  is_content_manager: boolean;
  created_at: string;
  updated_at: string;
}

interface AuthUser {
  id: string;
  email?: string; // Supabase User.email can be undefined
  last_sign_in_at?: string;
  created_at?: string; // Supabase User.created_at can be undefined
  // Add other fields from Supabase User type as needed
}

// Component props
interface AdminRoleManagerProps {
  currentUserIsSuperAdmin?: boolean;
}

const AdminRoleManager: React.FC<AdminRoleManagerProps> = ({ currentUserIsSuperAdmin: propIsSuperAdmin }) => {
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  // const [authUsers, setAuthUsers] = useState<AuthUser[]>([]); 
  const [internalIsSuperAdmin, setInternalIsSuperAdmin] = useState<boolean>(false);
  const [isLoadingStatus, setIsLoadingStatus] = useState<boolean>(() => typeof propIsSuperAdmin !== 'boolean');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [message, setMessage] = useState<MessageType>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<{type: AdminActionType, user: AdminUser} | null>(null);

  const isEffectivelySuperAdmin = typeof propIsSuperAdmin === 'boolean' ? propIsSuperAdmin : internalIsSuperAdmin;

  const [debugInfo, setDebugInfo] = useState<Record<string, string>>({});

  const fetchAdminUsers = useCallback(async () => {
    if (!isEffectivelySuperAdmin) {
      setAdminUsers([]);
      return;
    }
    setIsLoadingStatus(true);
    try {
      const { data: adminUsersData, error } = await supabase
        .from('admin_users')
        .select('*, donors(email, first_name, last_name)')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedUsers = (adminUsersData || []).map(adminRecord => {
        const record = adminRecord as unknown as AdminUserRow & { donors: DonorRow | null };
        return {
          id: record.id,
          user_id: record.user_id,
          email: record.donors?.email || 'N/A',
          is_super_admin: record.is_super_admin,
          is_content_manager: record.is_content_manager,
          created_at: record.created_at,
          updated_at: record.updated_at,
        } as AdminUser;
      });
      setAdminUsers(mappedUsers);
      setMessage(null);
    } catch (error) {
      const err = error as any; // Temporary type assertion
      console.error('Error in fetchAdminUsers:', err);
      setMessage({ text: `Error fetching admin users: ${err.message || String(err)}`, type: 'error' });
    } finally {
      setIsLoadingStatus(false);
    }
  }, [isEffectivelySuperAdmin]);

  const fetchAuthUsers = useCallback(async () => {
    if (!isEffectivelySuperAdmin) return;
    // This function might be used for populating a dropdown or for validation.
    // For now, it's a placeholder if needed for adding new admins.
    // Example: Fetch all auth users to pick from when adding a new admin.
    // const { data, error } = await supabase.auth.admin.listUsers();
    // if (data) setAuthUsers(data.users as AuthUser[]);
    // if (error) console.error('Error fetching auth users:', error);
  }, [isEffectivelySuperAdmin]);

  const checkCurrentUserAdminStatus = useCallback(async () => {
    if (typeof propIsSuperAdmin === 'boolean') {
      setInternalIsSuperAdmin(propIsSuperAdmin);
      setIsLoadingStatus(false);
      return;
    }
    setIsLoadingStatus(true);
    let currentDebugInfo: Record<string, string> = {};
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session?.user) {
        setInternalIsSuperAdmin(false);
        currentDebugInfo.finalStatus = 'No active session';
        return;
      }
      currentDebugInfo.authId = session.user.id;
      currentDebugInfo.email = session.user.email || 'No email in session';

      const { data: adminRecord, error: adminError } = await supabase
        .from('admin_users')
        .select('is_super_admin')
        .eq('user_id', session.user.id)
        .single();

      if (adminError && (adminError as PostgrestError).code !== 'PGRST116') { // PGRST116: 0 rows
        currentDebugInfo.adminLookupResult = `Error: ${(adminError as PostgrestError).message}`;
        throw adminError;
      }
      currentDebugInfo.adminLookupResult = adminRecord ? `Found, is_super_admin: ${adminRecord.is_super_admin}` : 'Not found in admin_users';
      setInternalIsSuperAdmin(adminRecord?.is_super_admin || false);
      currentDebugInfo.finalStatus = adminRecord?.is_super_admin ? 'Super Admin' : 'Not Super Admin';
    } catch (error) {
      const err = error as any; // Temporary type assertion
      console.error('Error checking current user admin status:', err);
      setInternalIsSuperAdmin(false);
      currentDebugInfo.finalStatus = `Error: ${err.message || String(err)}`;
      setMessage({ text: `Error checking admin status: ${err.message || String(err)}`, type: 'error' });
    } finally {
      setDebugInfo(currentDebugInfo);
      setIsLoadingStatus(false);
    }
  }, [propIsSuperAdmin]);

  useEffect(() => {
    checkCurrentUserAdminStatus();
  }, [checkCurrentUserAdminStatus]);

  useEffect(() => {
    if (isEffectivelySuperAdmin) {
      fetchAdminUsers();
      fetchAuthUsers(); // Call if you need the list of all auth users
    }
  }, [isEffectivelySuperAdmin, fetchAdminUsers, fetchAuthUsers]);

  const handleAddAdmin = async () => {
    if (!newAdminEmail.trim()) {
      setMessage({ text: 'Please enter an email address.', type: 'error' });
      return;
    }
    if (!isEffectivelySuperAdmin) {
        setMessage({ text: 'You do not have permission to perform this action.', type: 'error' });
        return;
    }

    setIsLoadingStatus(true);
    setMessage(null);
    try {
      // This is a simplified version. A real implementation would need to:
      // 1. Find the auth.users.id for the given email (e.g., via an RPC function).
      // 2. Check if they are already in admin_users.
      // 3. Add them to admin_users with default (e.g., not super_admin) privileges.
      setMessage({ text: `Admin add functionality for ${newAdminEmail} is conceptual. Full implementation needed.`, type: 'info' });
      setNewAdminEmail('');
    } catch (error) {
      const err = error as any; // Temporary type assertion
      console.error('Error adding new admin:', err);
      setMessage({ text: `Error adding admin: ${err.message || String(err)}`, type: 'error' });
    } finally {
      setIsLoadingStatus(false);
    }
  };

  const confirmAction = (actionType: AdminActionType, user: AdminUser) => {
    setPendingAction({type: actionType, user});
    setShowConfirmDialog(true);
  };

  const executeAction = async () => {
    if (!pendingAction) return;

    const { type: actionType, user: selectedUser } = pendingAction;
    setIsLoadingStatus(true); 
    setShowConfirmDialog(false);
    setMessage(null);
    
    let opMessage = '';

    try {
      const adminUserForAction = selectedUser as AdminUser;

      if (actionType === 'promote') {
        opMessage = `${adminUserForAction.email || 'User'} has been promoted to Super Admin`;
      } else if (actionType === 'demote') {
        opMessage = `${adminUserForAction.email || 'User'} has been demoted to Content Manager`;
      } else if (actionType === 'remove') {
        opMessage = `${adminUserForAction.email || 'User'} has been removed from admin users`;
      }
      
      let error: PostgrestError | null = null;
      if (actionType === 'remove') {
        const response = await supabase.from('admin_users').delete().eq('id', adminUserForAction.id);
        error = response.error;
      } else if (actionType === 'promote' || actionType === 'demote') { 
        const is_super = actionType === 'promote';
        const response = await supabase.from('admin_users').update({ is_super_admin: is_super }).eq('id', adminUserForAction.id);
        error = response.error;
      }
      
      if (error) throw error;
      
      setMessage({ text: opMessage, type: 'success' });
      fetchAdminUsers();
    } catch (error) {
      const err = error as any; // Temporary type assertion
      const errorMessage = err.message || String(err);
      setMessage({ text: `Error performing action: ${errorMessage}`, type: 'error' });
      console.error(`Error during ${actionType} action for user ${selectedUser.email}:`, err);
    } finally {
      setIsLoadingStatus(false);
      setPendingAction(null);
      setShowConfirmDialog(false);
    }
  };

  if (isLoadingStatus && typeof propIsSuperAdmin !== 'boolean' && !internalIsSuperAdmin && !isEffectivelySuperAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Admin Role Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-8 text-center text-muted-foreground">Checking super admin status...</div>
        </CardContent>
      </Card>
    );
  }

  if (!isEffectivelySuperAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Admin Role Management</CardTitle>
          <CardDescription>You need super admin privileges to access this section.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-8 text-center text-destructive">
            <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
            <p className="mt-4">Access Denied</p>
            <p>Your current role does not grant access to manage admin users.</p>
            {Object.keys(debugInfo).length > 0 && (
              <div className="mt-4 p-2 border rounded bg-muted text-xs text-left">
                <p><strong>Debug Info:</strong></p>
                {Object.entries(debugInfo).map(([key, value]) => (
                  <p key={key}>{key}: {value}</p>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin Role Management</CardTitle>
        <CardDescription>Manage admin user roles and permissions.</CardDescription>
      </CardHeader>
      <CardContent>
        {message && (
          <div className={`p-3 mb-4 rounded-md text-sm ${message.type === 'error' ? 'bg-red-100 text-red-700' : message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
            {message.text}
          </div>
        )}
        <div className="mb-6 p-4 border rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Add New Admin</h3>
          <div className="flex gap-2 items-end">
            <div className="flex-grow">
              <Label htmlFor="new-admin-email">User Email</Label>
              <Input 
                id="new-admin-email"
                type="email" 
                placeholder="Enter email of existing auth user"
                value={newAdminEmail} 
                onChange={(e) => setNewAdminEmail(e.target.value)} 
              />
            </div>
            <Button onClick={handleAddAdmin} disabled={isLoadingStatus}>
              <PlusCircle className="h-4 w-4 mr-1" />
              Add Admin
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            The user must already exist in the authentication system. This will grant them content manager privileges by default.
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Current Admin Users</h3>
          <div className="border rounded-lg">
            <div className="grid grid-cols-5 p-3 border-b bg-muted/50 font-medium text-sm">
              <div className="col-span-2">Email</div>
              <div>Role</div>
              <div>Created At</div>
              <div className="text-right">Actions</div>
            </div>
            {isLoadingStatus && adminUsers.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">Loading admin users...</div>
            ) : adminUsers.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">No admin users found</div>
            ) : (
              adminUsers.map((admin) => (
                <div key={admin.id} className="grid grid-cols-5 p-3 border-b last:border-0 items-center text-sm">
                  <div className="col-span-2 truncate" title={admin.email || 'N/A'}>{admin.email || 'N/A'}</div>
                  <div>
                    {admin.is_super_admin ? (
                      <Badge variant="default">Super Admin</Badge>
                    ) : (
                      <Badge variant="secondary">Content Manager</Badge>
                    )}
                  </div>
                  <div className="text-muted-foreground">
                    {new Date(admin.created_at).toLocaleDateString()}
                  </div>
                  <div className="flex justify-end gap-2">
                    {!admin.is_super_admin && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => confirmAction('promote', admin)}
                        disabled={isLoadingStatus}
                      >
                        <UserCheck className="h-4 w-4 mr-1" />
                        Promote
                      </Button>
                    )}
                    {admin.is_super_admin && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => confirmAction('demote', admin)}
                        disabled={isLoadingStatus}
                      >
                        <UserX className="h-4 w-4 mr-1" />
                        Demote
                      </Button>
                    )}
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => confirmAction('remove', admin)}
                      disabled={isLoadingStatus}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          {adminUsers.length} admin {adminUsers.length === 1 ? 'user' : 'users'} total
        </div>
        <Button variant="outline" onClick={fetchAdminUsers} disabled={isLoadingStatus}>
          Refresh List
        </Button>
      </CardFooter>
      
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingAction?.type === 'promote' && 'Promote to Super Admin?'}
              {pendingAction?.type === 'demote' && 'Demote to Content Manager?'}
              {pendingAction?.type === 'remove' && 'Remove Admin Privileges?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingAction?.type === 'promote' && 
                `This will give ${pendingAction?.user.email || 'the user'} full access to all admin features and the ability to manage other admins.`}
              {pendingAction?.type === 'demote' && 
                `This will restrict ${pendingAction?.user.email || 'the user'} to content management only. They won't be able to manage other admins.`}
              {pendingAction?.type === 'remove' && 
                `This will completely remove admin access for ${pendingAction?.user.email || 'the user'}. They will no longer be able to access the admin panel.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {setShowConfirmDialog(false); setPendingAction(null);}}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={executeAction} disabled={isLoadingStatus}>
              {isLoadingStatus ? 'Processing...' : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default AdminRoleManager;


export default AdminRoleManager;

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { PlusCircle, UserCheck, UserX, AlertTriangle, Check } from 'lucide-react';

// Types for message display
type MessageType = {
  text: string;
  type: 'success' | 'error' | 'info';
} | null;

// Type for admin action operations
type AdminActionType = 'promote' | 'demote' | 'remove';

// Database types with proper structure
type Database = {
  public: {
    Tables: {
      admin_users: {
        Row: {
          id: string;
          user_id: string;
          is_super_admin: boolean;
          is_content_manager: boolean;
          created_at: string;
          updated_at: string;
        };
      };
      donors: {
        Row: {
          id: string;
          email: string;
          first_name?: string;
          last_name?: string;
          auth_user_id?: string;
        };
      };
    };
  };
};

// Extended admin user type with email and name info
interface AdminUser {
  id: string;
  user_id: string;
  email: string | null;
  is_super_admin: boolean;
  is_content_manager: boolean;
  created_at: string;
  updated_at: string;
}

interface AuthUser {
  id: string;
  email: string;
  last_sign_in_at?: string;
  created_at: string;
  banned?: boolean;
  role?: string;
  is_admin?: boolean;
  is_super_admin?: boolean;
}

// Component props
interface AdminRoleManagerProps {
  // Optional prop to override superadmin status (mostly for testing)
  currentUserIsSuperAdmin?: boolean;
}

const AdminRoleManager: React.FC<AdminRoleManagerProps> = ({ currentUserIsSuperAdmin: propIsSuperAdmin }) => {
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [authUsers, setAuthUsers] = useState<AuthUser[]>([]);
  const [internalIsSuperAdmin, setInternalIsSuperAdmin] = useState<boolean>(false);
  // isLoadingStatus tracks the loading state of the super admin check itself, or the admin users list fetching.
  const [isLoadingStatus, setIsLoadingStatus] = useState<boolean>(() => typeof propIsSuperAdmin !== 'boolean');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' | null }>({ text: '', type: null });
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<{type: AdminActionType | 'ban' | 'unban', user: AdminUser | AuthUser} | null>(null);

  const isEffectivelySuperAdmin = typeof propIsSuperAdmin === 'boolean' ? propIsSuperAdmin : internalIsSuperAdmin;
  const [debugInfo, setDebugInfo] = useState<{
    authId: string;
    email: string;
    adminLookupResult: string;
    donorLookupResult: string;
    finalStatus: string;
  }>({
    authId: 'Not checked',
    email: 'Not checked',
    adminLookupResult: 'Not checked',
    donorLookupResult: 'Not checked',
    finalStatus: 'Not checked',
  });

  // Hoisted function to fetch admin users
  const fetchAdminUsers = useCallback(async () => {
    if (!isEffectivelySuperAdmin) {
      setAdminUsers([]); // Should not fetch if not super admin
      return;
    }
    setIsLoadingStatus(true); // Indicates loading of admin users list
    try {
      const { data: adminUsersData, error: adminError } = await supabase
        .from('admin_users')
        .select('*, donors(email, first_name, last_name)') // Fetch related donor email if available
        .order('created_at', { ascending: false });

      if (adminError) {
        console.error('Error fetching admin users:', adminError);
        setMessage({ text: `Error fetching admin users: ${adminError.message}`, type: 'error' });
        setAdminUsers([]);
        return;
      }

      const mappedUsers = (adminUsersData || []).map(adminRecord => {
        // Explicitly assert the type of adminRecord to include fields from 'admin_users' and the 'donors' relation.
        // This helps TypeScript understand the structure after the join.
        const record = adminRecord as unknown as {
          id: string;
          user_id: string;
          is_super_admin: boolean;
          is_content_manager: boolean;
          created_at: string;
          updated_at: string;
          donors: { email: string | null; first_name?: string | null; last_name?: string | null } | null;
        };

        let resolvedEmail: string | null = null;
        if (record.donors && typeof record.donors === 'object' && record.donors.email) {
          resolvedEmail = record.donors.email;
        }

        return {
          id: record.id,
          user_id: record.user_id,
          email: resolvedEmail,
          is_super_admin: record.is_super_admin,
          is_content_manager: record.is_content_manager,
          created_at: record.created_at,
          updated_at: record.updated_at,
        } as AdminUser; // Asserting that the returned object matches the AdminUser interface
      });
      setAdminUsers(mappedUsers);
    } catch (error) {
      console.error('Error in fetchAdminUsers:', error);
      setMessage({ text: `Error in fetchAdminUsers: ${error instanceof Error ? error.message : String(error)}`, type: 'error' });
      setAdminUsers([]);
    } finally {
      setIsLoadingStatus(false); // Finished loading admin users list
    }
  }, [isEffectivelySuperAdmin]); // Dependency: isEffectivelySuperAdmin to re-evaluate if it can fetch

  // Hoisted function to fetch all auth users (for adding new admins)
  const fetchAuthUsers = useCallback(async () => {
    // This function might be used later for a user picker.
    // setIsLoadingStatus(true); // Consider a separate loading state if this is slow
    try {
      const response = await supabase.rpc('get_all_users');
      if (response.error) {
        console.error('Error fetching auth users:', response.error);
        setMessage({ text: 'Failed to fetch users: ' + response.error.message, type: 'error' });
        setAuthUsers([]);
        return;
      }
      const authUsersData = (response.data || []) as AuthUser[];
      setAuthUsers(authUsersData);
    } catch (error) {
      console.error('Error in fetchAuthUsers:', error);
      setMessage({ text: `Error in fetchAuthUsers: ${error instanceof Error ? error.message : String(error)}`, type: 'error' });
      setAuthUsers([]);
    } finally {
      // setIsLoadingStatus(false);
    }
  }, []);

  // Check if the current user is a superadmin (only if propIsSuperAdmin is not set)
  const checkCurrentUserAdminStatus = useCallback(async () => {
    if (typeof propIsSuperAdmin === 'boolean') return; // Prop takes precedence, do nothing here.

    setIsLoadingStatus(true); // Loading status of the *super admin check itself*
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const { data: { user } } = await supabase.auth.getUser();

      if (!sessionData?.session || !user) {
        setInternalIsSuperAdmin(false);
        return;
      }
      // Emergency override for specific user ID or email
      if (user.email === 'lquessenberry@gmail.com' || user.id === '4862bb86-6f9b-4b7d-aa74-e4bee1d50342') {
        setInternalIsSuperAdmin(true);
        return;
      }

      const { data, error } = await supabase
        .from('admin_users')
        .select('is_super_admin')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error checking super admin status:', error);
        setInternalIsSuperAdmin(false);
      } else {
        setInternalIsSuperAdmin(data?.is_super_admin || false);
      }
    } catch (err) {
      console.error('Exception in checkCurrentUserAdminStatus:', err);
      setInternalIsSuperAdmin(false);
    } finally {
      setIsLoadingStatus(false); // Finished loading the super admin status itself
    }
  }, [propIsSuperAdmin]); // Dependencies

  // Effect to manage super admin status based on prop or internal check, and fetch admin users
  useEffect(() => {
    if (typeof propIsSuperAdmin === 'boolean') {
      // Prop is provided, it dictates the status.
      setInternalIsSuperAdmin(propIsSuperAdmin); // Sync internal state
      setIsLoadingStatus(false); // Status is known from prop.
      if (propIsSuperAdmin) {
        fetchAdminUsers(); // Fetch users if prop says super admin
      } else {
        setAdminUsers([]); // Clear admin users if prop says not super admin
      }
    } else {
      // Prop not provided, rely on internal check.
      checkCurrentUserAdminStatus(); // This will set internalIsSuperAdmin and setIsLoadingStatus
    }
  }, [propIsSuperAdmin, checkCurrentUserAdminStatus, fetchAdminUsers]); // Added fetchAdminUsers

  // Effect to handle authentication state changes
  useEffect(() => {
    if (typeof propIsSuperAdmin === 'boolean') {
      // If prop is set, it's the source of truth. Auth changes don't trigger internal status check.
      // Consider if SIGNED_OUT should clear adminUsers even if propIsSuperAdmin was true.
      // For now, propIsSuperAdmin is absolute for status.
      return;
    }

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed (prop not set):', event);
      if (event === 'SIGNED_OUT') {
        setInternalIsSuperAdmin(false);
        setAdminUsers([]);
        setIsLoadingStatus(false); // No longer loading status, and not super admin
      } else if (session) { // SIGNED_IN, TOKEN_REFRESHED, USER_UPDATED imply a session
        checkCurrentUserAdminStatus(); // Re-check status which might then trigger fetchAdminUsers via the other effect
      } else { // Catch all for other events if session becomes null (e.g. USER_DELETED from another client)
         setInternalIsSuperAdmin(false);
         setAdminUsers([]);
         setIsLoadingStatus(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [propIsSuperAdmin, checkCurrentUserAdminStatus]); // Dependencies

  // Function to handle errors consistently
  const handleError = (error: unknown) => {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error:', errorMessage);
    setMessage({ text: `Error: ${errorMessage}`, type: 'error' });
    setIsLoadingStatus(false);
  };

  const handleAddAdmin = async () => {
    if (!newAdminEmail.includes('@')) {
      setMessage({ text: 'Please enter a valid email address', type: 'error' });
      return;
    }
    
    setIsLoadingStatus(true);
    setMessage(null);
    
    try {
      console.log(`Looking up donor with email: ${newAdminEmail.trim()}`);
      const donorResponse = await supabase
        .from('donors')
        .select('id, auth_user_id')
        .eq('email', newAdminEmail.trim())
        .single();

      console.log('Donor lookup result:', donorResponse);

      if (donorResponse.error) {
        if (donorResponse.error.message.includes('No rows found')) {
          throw new Error(`No donor found with email ${newAdminEmail}`);
        }
        throw donorResponse.error;
      }

      const donorId = donorResponse.data.id;
      const userId = donorResponse.data.auth_user_id;
      console.log(`Found donor ID: ${donorId}, auth_user_id: ${userId}`);

      if (!userId) {
        throw new Error(`Donor found but has no auth_user_id: ${donorId}`);
      }

      // Check if user is already an admin
      const { data: existingAdmin, error: checkError } = await supabase
        .from('admin_users')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (!checkError && existingAdmin) {
        throw new Error(`User with email ${newAdminEmail} is already an admin.`);
      }

      // Insert new admin user (default to content manager only)
      const { data: insertResponse, error: insertError } = await supabase
        .from('admin_users')
        .insert({
          user_id: userId,
          is_super_admin: false, // Default to non-super admin for safety
          is_content_manager: true,
        })
        .select();

      if (insertError) {
        console.error('Insert error:', insertError);
        throw new Error(insertError.message || 'Error adding admin user');
      }

      console.log('Successfully added admin user:', insertResponse);
      // Clear the input field and refresh admin users
      setNewAdminEmail('');
      setMessage({ text: `Successfully added ${newAdminEmail} as Content Manager`, type: 'success' });
      fetchAdminUsers();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error adding admin:', errorMessage);
      setMessage({ text: `Error: ${errorMessage}`, type: 'error' });
    } finally {
      setIsLoadingStatus(false);
    }
  };

  const confirmAction = (actionType: AdminActionType, user: AdminUser) => {
    // Set the pending action to track what was requested
  if (!isEffectivelySuperAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Admin Management</CardTitle>
          <CardDescription>You need super admin privileges to access this section</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-6">
            <AlertTriangle className="h-12 w-12 text-amber-500 mr-4" />
            <p className="text-muted-foreground">
              You don't have permission to manage admin users. Please contact a super administrator.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin User Management</CardTitle>
        <CardDescription>Manage admin roles and permissions</CardDescription>
      </CardHeader>
      
      <CardContent>
        {message.text && (
          <div className={`mb-4 p-3 rounded-md ${message.type === 'error' ? 'bg-red-100 text-red-800' : message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
            {message.type === 'success' && <Check className="inline h-4 w-4 mr-2" />}
            {message.type === 'error' && <AlertTriangle className="inline h-4 w-4 mr-2" />}
            {message.text}
          </div>
        )}
        
        <div className="space-y-4">
          <div className="flex items-end gap-4">
            <div className="grid w-full gap-1.5">
              <Label htmlFor="email">Add New Admin</Label>
              <Input
                id="email"
                placeholder="user@example.com"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                disabled={isLoadingStatus}
              />
            </div>
            <Button onClick={handleAddAdmin} disabled={isLoadingStatus || !newAdminEmail.trim()}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Admin
            </Button>
          </div>
          
          <div className="border rounded-md">
            <div className="grid grid-cols-5 p-3 border-b bg-muted/50 text-sm font-medium">
              <div className="col-span-2">Email</div>
              <div>Role</div>
              <div>Added</div>
              <div className="text-right">Actions</div>
            </div>
            
            {isLoadingStatus && typeof propIsSuperAdmin !== 'boolean' ? (
              <div className="p-8 text-center text-muted-foreground">Loading admin users...</div>
            ) : adminUsers.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">No admin users found</div>
            ) : (
              adminUsers.map((admin) => (
                <div key={admin.id} className="grid grid-cols-5 p-3 border-b last:border-0 items-center text-sm">
                  <div className="col-span-2">{admin.email}</div>
                  <div>
                    {admin.is_super_admin ? (
                      <Badge variant="default">Super Admin</Badge>
                    ) : (
                      <Badge variant="secondary">Content Manager</Badge>
                    )}
                  </div>
                  <div className="text-muted-foreground">
                    {new Date(admin.created_at).toLocaleDateString()}
                  </div>
                  <div className="flex justify-end gap-2">
                    {!admin.is_super_admin && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => confirmAction('promote', admin)}
                      >
                        <UserCheck className="h-4 w-4 mr-1" />
                        Promote
                      </Button>
                    )}
                    {admin.is_super_admin && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => confirmAction('demote', admin)}
                      >
                        <UserX className="h-4 w-4 mr-1" />
                        Demote
                      </Button>
                    )}
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => confirmAction('remove', admin)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          {adminUsers.length} admin {adminUsers.length === 1 ? 'user' : 'users'} total
        </div>
        <Button variant="outline" onClick={fetchAdminUsers} disabled={isLoadingStatus}>
          Refresh
        </Button>
      </CardFooter>
      
      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingAction?.type === 'promote' && 'Promote to Super Admin?'}
              {pendingAction?.type === 'demote' && 'Demote to Content Manager?'}
              {pendingAction?.type === 'remove' && 'Remove Admin Privileges?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingAction?.type === 'promote' && 
                `This will give ${pendingAction?.user.email} full access to all admin features and the ability to manage other admins.`}
              {pendingAction?.type === 'demote' && 
                `This will restrict ${pendingAction?.user.email} to content management only. They won't be able to manage other admins.`}
              {pendingAction?.type === 'remove' && 
                `This will completely remove admin access for ${pendingAction?.user.email}. They will no longer be able to access the admin panel.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowConfirmDialog(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={executeAction}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default AdminRoleManager;
