import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import AdminUserProfileManager from '@/components/admin/AdminUserProfileManager';
import { useAdminCheck } from '@/hooks/useAdminCheck';

const UserProfiles = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedUserId, setSelectedUserId] = useState<string>(searchParams.get('userId') || '');
  const { data: isAdmin, isLoading: isCheckingAdmin } = useAdminCheck();

  const handleUserSelect = (userId: string) => {
    setSelectedUserId(userId);
    setSearchParams({ userId });
  };

  if (isCheckingAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-destructive mb-4">Access Denied</h1>
        <p className="text-muted-foreground">
          You need admin privileges to access user profile management.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">User Profile Management</h1>
        <p className="text-muted-foreground mt-2">
          Search, view, and edit user profiles and donor information.
        </p>
      </div>

      <AdminUserProfileManager
        selectedUserId={selectedUserId}
        onUserSelect={handleUserSelect}
      />
    </div>
  );
};

export default UserProfiles;