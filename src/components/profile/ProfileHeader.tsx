import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { User, Camera, Image, X, ChevronDown, Edit, Settings, Link2, Copy, Eye } from "lucide-react";
import { useAvatarUpload } from "@/hooks/useAvatarUpload";
import { useBackgroundUpload } from "@/hooks/useBackgroundUpload";
import { useUpdateProfile } from "@/hooks/useUserProfile";
import StarField from "@/components/StarField";
import MouseTracker from "@/components/auth/MouseTracker";
import { toast } from "sonner";
import { useRankSystem } from "@/hooks/useRankSystem";

interface ProfileData {
  id: string;
  username?: string | null;
  full_name?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  background_url?: string | null;
  created_at: string;
  updated_at: string;
}

interface FormData {
  username: string;
  full_name: string;
  bio: string;
  show_avatar_publicly?: boolean;
  show_real_name_publicly?: boolean;
  show_background_publicly?: boolean;
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
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
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
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const backgroundInputRef = useRef<HTMLInputElement>(null);
  const { uploadAvatar, isUploading } = useAvatarUpload();
  const { uploadBackground, removeBackground, isUploading: isUploadingBackground } = useBackgroundUpload();
  const updateProfile = useUpdateProfile();
  const { data: rankSystem } = useRankSystem(undefined);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleBackgroundClick = () => {
    backgroundInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('📷 Avatar file selected:', file.name, 'Size:', file.size, 'Type:', file.type);

    const avatarUrl = await uploadAvatar(file);
    if (avatarUrl) {
      console.log('🎨 Updating profile with new avatar URL:', avatarUrl);
      // Update profile with new avatar URL
      try {
        await updateProfile.mutateAsync({ avatar_url: avatarUrl });
        toast.success('Avatar updated! Your profile photo has been changed.');
      } catch (error: any) {
        console.error('❌ Failed to update profile with avatar:', error);
        toast.error(`Failed to save avatar: ${error?.message || 'Unknown error'}`);
      }
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleBackgroundFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const backgroundUrl = await uploadBackground(file);
    if (backgroundUrl) {
      // Update profile with new background URL
      await updateProfile.mutateAsync({ background_url: backgroundUrl });
    }

    // Reset file input
    if (backgroundInputRef.current) {
      backgroundInputRef.current.value = '';
    }
  };

  const handleRemoveBackground = async () => {
    const success = await removeBackground();
    if (success) {
      // Update profile to remove background URL
      await updateProfile.mutateAsync({ background_url: null });
    }
  };

  // Collapsed state - minimal header
  if (isCollapsed) {
    return (
      <section className="relative bg-axanar-dark text-white border-b border-white/10">
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-axanar-teal/20 ring-2 ring-axanar-teal flex items-center justify-center flex-shrink-0">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name || profile.username || 'User'}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="h-6 w-6 text-axanar-teal" />
                )}
              </div>
              <div>
                <h1 className="text-lg font-bold">
                  {profile?.full_name || profile?.username || 'Anonymous User'}
                </h1>
                {profile?.username && (
                  <a 
                    href={`/u/${profile.username}`}
                    className="text-sm text-axanar-silver/80 hover:text-axanar-teal transition-colors"
                  >
                    @{profile.username}
                  </a>
                )}
              </div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={onToggleCollapse}
              className="text-white hover:bg-white/10"
            >
              <ChevronDown className="h-4 w-4 rotate-180" />
              <span className="ml-2">Expand</span>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  // Expanded state - LCARS-styled info panel (complements IdentityPanel above)
  return (
    <section className="relative text-white border-t-2 border-[#FFCC33]">
      {/* LCARS Info Container */}
      <div className="relative z-10 w-full max-w-[1200px] mx-auto px-6 py-6">
        <div className="flex flex-col gap-4">
          {/* Bio Section */}
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="space-y-4 bg-[#1a1a1a] p-4 border-2 border-[#FFCC33]">
                <div>
                  <Label htmlFor="full_name" className="text-[#FFCC33] text-sm font-bold mb-1 block uppercase tracking-wider">
                    Full Name
                  </Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                    className="bg-black border-2 border-[#FFCC33] text-white placeholder:text-white/50 focus:border-[#33CCFF] h-10"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <Label htmlFor="username" className="text-[#FFCC33] text-sm font-bold mb-1 block uppercase tracking-wider">
                    Username
                  </Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                    className="bg-black border-2 border-[#FFCC33] text-white placeholder:text-white/50 focus:border-[#33CCFF] h-10"
                    placeholder="Enter your username"
                  />
                </div>
                <div>
                  <Label htmlFor="bio" className="text-[#FFCC33] text-sm font-bold mb-1 block uppercase tracking-wider">
                    Bio <span className="text-white/60 text-xs">({formData.bio.length}/5000 characters)</span>
                  </Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => {
                      if (e.target.value.length <= 5000) {
                        setFormData(prev => ({ ...prev, bio: e.target.value }));
                      }
                    }}
                    placeholder="Tell us about yourself..."
                    className="bg-black border-2 border-[#FFCC33] text-white placeholder:text-white/50 focus:border-[#33CCFF] resize-none"
                    rows={3}
                    maxLength={5000}
                  />
                  {formData.bio.length > 4500 && (
                    <p className="text-xs text-[#FFCC33] mt-1">
                      {5000 - formData.bio.length} characters remaining
                    </p>
                  )}
                </div>
                
                {/* Privacy Settings */}
                <div className="pt-3 border-t-2 border-[#FFCC33]">
                  <div className="flex items-center gap-2 mb-3">
                    <Eye className="h-4 w-4 text-[#FFCC33]" />
                    <Label className="text-[#FFCC33] text-sm font-bold uppercase tracking-wider">Public Profile Privacy</Label>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="show-avatar" className="text-white text-sm">
                          Show Profile Photo
                        </Label>
                        <p className="text-xs text-white/60">Display on public profile</p>
                      </div>
                      <Switch
                        id="show-avatar"
                        checked={formData.show_avatar_publicly ?? true}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, show_avatar_publicly: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="show-name" className="text-white text-sm">
                          Show Real Name
                        </Label>
                        <p className="text-xs text-white/60">Display full name publicly</p>
                      </div>
                      <Switch
                        id="show-name"
                        checked={formData.show_real_name_publicly ?? true}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, show_real_name_publicly: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="show-background" className="text-white text-sm">
                          Show Background Image
                        </Label>
                        <p className="text-xs text-white/60">Display custom background</p>
                      </div>
                      <Switch
                        id="show-background"
                        checked={formData.show_background_publicly ?? true}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, show_background_publicly: checked }))}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                {profile?.bio && (
                  <p className="text-white/90 text-lg leading-relaxed">{profile.bio}</p>
                )}
                <p className="text-[#FFCC33] mt-2 text-sm uppercase tracking-wider">Member since {memberSince}</p>
              </div>
            )}
            
            {/* Quick Stats Pills - LCARS Module Style */}
            <div className="flex flex-wrap gap-3 mt-4">
              <div className="bg-[#1a1a1a] border-2 border-[#33CCFF] px-4 py-2">
                <span className="text-sm font-bold text-white uppercase tracking-wider">
                  {pledgesCount} Projects Backed
                </span>
              </div>
              <div className="bg-[#1a1a1a] border-2 border-[#33CCFF] px-4 py-2">
                <span className="text-sm font-bold text-white uppercase tracking-wider">
                  {campaignsCount} Campaigns Created
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        ref={backgroundInputRef}
        type="file"
        accept="image/*"
        onChange={handleBackgroundFileChange}
        className="hidden"
      />
    </section>
  );
};

export default ProfileHeader;