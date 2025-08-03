import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Camera } from "lucide-react";
import { useAvatarUpload } from "@/hooks/useAvatarUpload";
import { useUpdateProfile } from "@/hooks/useUserProfile";

interface ProfileData {
  id: string;
  username?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  avatar?: string | null;
  updated_at: string;
}

interface FormData {
  username: string;
  first_name: string;
  last_name: string;
}

interface ProfileHeaderProps {
  profile: ProfileData | undefined;
  isEditing: boolean;
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  isLoading: boolean;
  memberSince: string;
  pledgesCount: number;
  campaignsCount: number;
  totalPledged: number;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  isEditing,
  formData,
  setFormData,
  onEdit,
  onSave,
  onCancel,
  isLoading,
  memberSince,
  pledgesCount,
  campaignsCount,
  totalPledged,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadAvatar, isUploading } = useAvatarUpload();
  const updateProfile = useUpdateProfile();

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const avatarUrl = await uploadAvatar(file);
    if (avatarUrl) {
      // Update profile with new avatar URL
      await updateProfile.mutateAsync({ avatar: avatarUrl });
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const fullName = profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : '';

  return (
    <section className="bg-axanar-dark text-white">
      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-axanar-teal/20 ring-4 ring-axanar-teal flex items-center justify-center">
              {profile?.avatar ? (
                <img
                  src={profile.avatar}
                  alt={fullName || profile.username || 'User'}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="h-12 w-12 text-axanar-teal" />
              )}
            </div>
            {!isEditing && (
              <>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleAvatarClick}
                  disabled={isUploading}
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                >
                  <Camera className="h-4 w-4" />
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </>
            )}
          </div>
          
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-2 bg-white/5 p-3 rounded-lg backdrop-blur-sm border border-white/10">
                <div>
                  <Label htmlFor="first_name" className="text-white text-sm font-medium mb-1 block">
                    First Name
                  </Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/15 focus:border-axanar-teal h-8"
                    placeholder="Enter your first name"
                  />
                </div>
                <div>
                  <Label htmlFor="last_name" className="text-white text-sm font-medium mb-1 block">
                    Last Name
                  </Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/15 focus:border-axanar-teal h-8"
                    placeholder="Enter your last name"
                  />
                </div>
                <div>
                  <Label htmlFor="username" className="text-white text-sm font-medium mb-1 block">
                    Username
                  </Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/15 focus:border-axanar-teal h-8"
                    placeholder="Enter your username"
                  />
                </div>
              </div>
            ) : (
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">
                  {fullName || profile?.username || 'Anonymous User'}
                </h1>
                {profile?.username && (
                  <p className="text-axanar-silver/80 mt-1">@{profile.username}</p>
                )}
                <p className="text-axanar-silver/80 mt-1">Member since {memberSince}</p>
              </div>
            )}
            
            <div className="flex space-x-6 mt-4">
              <div>
                <p className="text-lg font-bold">{pledgesCount}</p>
                <p className="text-xs text-axanar-silver/60">Projects Backed</p>
              </div>
              <div>
                <p className="text-lg font-bold">{campaignsCount}</p>
                <p className="text-xs text-axanar-silver/60">Campaigns Created</p>
              </div>
              <div>
                <p className="text-lg font-bold">${totalPledged.toLocaleString()}</p>
                <p className="text-xs text-axanar-silver/60">Total Pledged</p>
              </div>
            </div>
          </div>
          
          <div className="md:ml-auto flex gap-2">
            {isEditing ? (
              <>
                <Button 
                  variant="outline" 
                  onClick={onCancel}
                  disabled={isLoading}
                  className="border-white/40 text-white hover:bg-white/20 hover:text-white bg-transparent"
                >
                  Cancel
                </Button>
                <Button 
                  className="bg-axanar-teal hover:bg-axanar-teal/90 text-white"
                  onClick={onSave}
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </>
            ) : (
              <Button 
                className="bg-axanar-teal hover:bg-axanar-teal/90 text-white"
                onClick={onEdit}
              >
                Edit Profile
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfileHeader;