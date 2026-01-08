import React, { useState } from 'react';
import { Search, User, Mail, Calendar, Edit2, Save, X, ExternalLink, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useAdminUserProfile, useAdminUpdateUserProfile, useAdminSearchUsers } from '@/hooks/useAdminUserProfile';
import { useImpersonation } from '@/contexts/ImpersonationContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface AdminUserProfileManagerProps {
  selectedUserId?: string;
  onUserSelect?: (userId: string) => void;
}

const AdminUserProfileManager: React.FC<AdminUserProfileManagerProps> = ({
  selectedUserId,
  onUserSelect
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    bio: '',
    email: '',
    first_name: '',
    last_name: '',
    donor_name: ''
  });

  const { data: searchResults, isLoading: isSearching } = useAdminSearchUsers(searchTerm);
  const { data: userData, isLoading: isLoadingProfile } = useAdminUserProfile(selectedUserId || '');
  const updateProfile = useAdminUpdateUserProfile();
  const { startImpersonation } = useImpersonation();
  const navigate = useNavigate();
  const { toast } = useToast();

  React.useEffect(() => {
    if (userData?.profile || userData?.donor) {
      setFormData({
        full_name: userData.profile?.full_name || '',
        username: userData.profile?.username || '',
        bio: userData.profile?.bio || '',
        email: userData.donor?.email || '',
        first_name: userData.donor?.first_name || '',
        last_name: userData.donor?.last_name || '',
        donor_name: userData.donor?.donor_name || ''
      });
    }
  }, [userData]);

  const handleUserSelect = (userId: string) => {
    onUserSelect?.(userId);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!selectedUserId) return;

    try {
      await updateProfile.mutateAsync({
        userId: selectedUserId,
        profileData: {
          full_name: formData.full_name || null,
          username: formData.username || null,
          bio: formData.bio || null
        },
        donorData: {
          email: formData.email,
          first_name: formData.first_name || null,
          last_name: formData.last_name || null,
          donor_name: formData.donor_name || null
        }
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const handleCancel = () => {
    if (userData?.profile || userData?.donor) {
      setFormData({
        full_name: userData.profile?.full_name || '',
        username: userData.profile?.username || '',
        bio: userData.profile?.bio || '',
        email: userData.donor?.email || '',
        first_name: userData.donor?.first_name || '',
        last_name: userData.donor?.last_name || '',
        donor_name: userData.donor?.donor_name || ''
      });
    }
    setIsEditing(false);
  };

  const handleViewAsUser = () => {
    if (!selectedUserId || !userData) return;
    
    startImpersonation({
      id: selectedUserId,
      username: userData.profile?.username || undefined,
      full_name: userData.profile?.full_name || userData.donor?.donor_name || undefined,
      email: userData.donor?.email || undefined,
      donor_id: userData.donor?.id || undefined,
    });
    
    toast({
      title: "Impersonation Started",
      description: `Now viewing site as ${userData.profile?.full_name || userData.donor?.donor_name || 'this user'}`,
    });
    
    // Navigate to the dashboard to see their view
    navigate('/dashboard');
  };

  return (
    <div className="space-y-6">
      {/* User Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              placeholder="Search by name, email, or username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
            
            {isSearching && (
              <div className="text-sm text-muted-foreground">Searching...</div>
            )}
            
            {searchResults && searchResults.length > 0 && (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {searchResults.map((user) => (
                  <div
                    key={user.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedUserId === user.id 
                        ? 'border-primary bg-primary/5' 
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => handleUserSelect(user.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{user.name}</div>
                        {user.email && (
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        )}
                      </div>
                      <Badge variant="outline">{user.source}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {searchTerm.length >= 2 && searchResults?.length === 0 && !isSearching && (
              <div className="text-sm text-muted-foreground">No users found</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Selected User Profile */}
      {selectedUserId && (
        <Card>
          <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  User Profile
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleViewAsUser}
                    className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-black"
                  >
                    <Eye className="h-4 w-4" />
                    View as User
                  </Button>
                  {userData?.profile?.username && (
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="flex items-center gap-2"
                    >
                      <a 
                        href={`/u/${userData.profile.username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4" />
                        View Public Profile
                      </a>
                    </Button>
                  )}
                  {!isEditing ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2"
                    >
                      <Edit2 className="h-4 w-4" />
                      Edit
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancel}
                        className="flex items-center gap-2"
                      >
                        <X className="h-4 w-4" />
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSave}
                        disabled={updateProfile.isPending}
                        className="flex items-center gap-2"
                      >
                        <Save className="h-4 w-4" />
                        Save
                      </Button>
                    </div>
                  )}
                </div>
              </div>
          </CardHeader>
          <CardContent>
            {isLoadingProfile ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-2 text-muted-foreground">Loading user data...</span>
              </div>
            ) : userData?.donor || userData?.profile ? (
              <div className="space-y-6">
                {/* Show legacy donor notice if no profile exists */}
                {userData?.donor && !userData?.profile && (
                  <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                    <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-2">
                      Legacy Donor Profile
                    </h4>
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      This is a legacy donor who hasn't created an authentication account yet. 
                      Profile information may be limited and editing is restricted to donor details only.
                    </p>
                  </div>
                )}

                {/* Profile Information - only show if user has a profile */}
                {userData?.profile && (
                  <>
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Profile Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="full_name">Full Name</Label>
                          <Input
                            id="full_name"
                            value={formData.full_name}
                            onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                            disabled={!isEditing}
                            placeholder="Enter full name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="username">Username</Label>
                          <Input
                            id="username"
                            value={formData.username}
                            onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                            disabled={!isEditing}
                            placeholder="Enter username"
                          />
                        </div>
                      </div>
                      <div className="mt-4">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          value={formData.bio}
                          onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                          disabled={!isEditing}
                          placeholder="Enter bio"
                          rows={3}
                        />
                      </div>
                    </div>

                    <Separator />
                  </>
                )}

                {/* Donor Information */}
                {userData?.donor && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Donor Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        disabled={!isEditing}
                        placeholder="Enter email"
                      />
                    </div>
                    <div>
                      <Label htmlFor="donor_name">Donor Display Name</Label>
                      <Input
                        id="donor_name"
                        value={formData.donor_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, donor_name: e.target.value }))}
                        disabled={!isEditing}
                        placeholder="Enter donor display name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="first_name">First Name</Label>
                      <Input
                        id="first_name"
                        value={formData.first_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                        disabled={!isEditing}
                        placeholder="Enter first name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="last_name">Last Name</Label>
                      <Input
                        id="last_name"
                        value={formData.last_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                        disabled={!isEditing}
                        placeholder="Enter last name"
                      />
                    </div>
                  </div>
                </div>
                )}

                {/* Account Information */}
                {userData?.profile && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Account Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Created:</span>
                          <span>{new Date(userData.profile.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Updated:</span>
                          <span>{new Date(userData.profile.updated_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No user data found</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!selectedUserId && (
        <Card>
          <CardContent className="text-center py-12">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No User Selected</h3>
            <p className="text-muted-foreground">
              Search for a user above to view and edit their profile
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminUserProfileManager;