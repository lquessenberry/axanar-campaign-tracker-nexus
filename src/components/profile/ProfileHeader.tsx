import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { User, Camera, Image, X, ChevronDown, Edit, Settings } from "lucide-react";
import { useAvatarUpload } from "@/hooks/useAvatarUpload";
import { useBackgroundUpload } from "@/hooks/useBackgroundUpload";
import { useUpdateProfile } from "@/hooks/useUserProfile";
import StarField from "@/components/StarField";
import MouseTracker from "@/components/auth/MouseTracker";

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
  const backgroundInputRef = useRef<HTMLInputElement>(null);
  const { uploadAvatar, isUploading } = useAvatarUpload();
  const { uploadBackground, removeBackground, isUploading: isUploadingBackground } = useBackgroundUpload();
  const updateProfile = useUpdateProfile();

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleBackgroundClick = () => {
    backgroundInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const avatarUrl = await uploadAvatar(file);
    if (avatarUrl) {
      // Update profile with new avatar URL
      await updateProfile.mutateAsync({ avatar_url: avatarUrl });
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

  return (
    <section 
      className="relative bg-axanar-dark text-white overflow-hidden min-h-[33vh]"
      onPointerMove={(e) => {
        const { currentTarget: el, clientX: x, clientY: y } = e;
        const { top: t, left: l, width: w, height: h } = el.getBoundingClientRect();
        el.style.setProperty('--posX', `${x - l - w / 2}`);
        el.style.setProperty('--posY', `${y - t - h / 2}`);
      }}
      style={{
        '--x': 'calc(var(--posX, 0) * 1px)',
        '--y': 'calc(var(--posY, 0) * 1px)',
        backgroundImage: profile?.background_url 
          ? `
              url(${profile.background_url}),
              radial-gradient(90% 100% at calc(50% + var(--x)) calc(0% + var(--y)), rgba(64, 224, 208, 0.9), rgba(255, 255, 255, 0.4)),
              radial-gradient(100% 100% at calc(80% - var(--x)) calc(0% - var(--y)), rgba(255, 255, 255, 0.8), rgba(64, 224, 208, 0.3)),
              radial-gradient(150% 210% at calc(100% + var(--x)) calc(0% + var(--y)), rgba(64, 224, 208, 0.7), rgba(0, 255, 255, 0.5)),
              radial-gradient(80% 80% at calc(20% + var(--x)) calc(80% + var(--y)), rgba(255, 255, 255, 0.6), rgba(64, 224, 208, 0.4))
            ` 
          : `
              radial-gradient(90% 100% at calc(50% + var(--x)) calc(0% + var(--y)), rgba(64, 224, 208, 1.0), rgba(0, 255, 255, 0.6)),
              radial-gradient(100% 100% at calc(80% - var(--x)) calc(0% - var(--y)), rgba(255, 255, 255, 0.9), rgba(64, 224, 208, 0.5)),
              radial-gradient(150% 210% at calc(100% + var(--x)) calc(0% + var(--y)), rgba(0, 255, 255, 0.8), rgba(64, 224, 208, 0.6)),
              radial-gradient(80% 80% at calc(20% + var(--x)) calc(80% + var(--y)), rgba(255, 255, 255, 0.7), rgba(0, 255, 255, 0.4)),
              linear-gradient(60deg, rgb(0, 10, 15), rgb(0, 20, 25))
            `,
        backgroundSize: '100% auto, 400% 400%, 400% 400%, 400% 400%, 400% 400%' + (profile?.background_url ? '' : ', 100% 100%'),
        backgroundPosition: 'center top, center, center, center, center' + (profile?.background_url ? '' : ', center'),
        backgroundRepeat: 'no-repeat',
        backgroundBlendMode: profile?.background_url ? 'normal, overlay, screen, multiply' : 'overlay, screen, multiply, normal'
      } as React.CSSProperties}
    >
      {/* StarField layer - subtle background effect */}
      <div className="absolute inset-0 opacity-10 z-5">
        <StarField />
      </div>
      
      {/* Mouse tracker effect */}
      <div className="absolute inset-0 z-15">
        <MouseTracker />
      </div>
      
      {/* Dark overlay for text readability */}
      {profile?.background_url && (
        <div className="absolute inset-x-0 top-0 h-[33vh] bg-black/50 z-10" />
      )}
      
      <div className="container mx-auto px-4 py-10 relative z-20">
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-axanar-teal/20 ring-4 ring-axanar-teal flex items-center justify-center">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name || profile.username || 'User'}
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
                  <Label htmlFor="full_name" className="text-white text-sm font-medium mb-1 block">
                    Full Name
                  </Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/15 focus:border-axanar-teal h-8"
                    placeholder="Enter your full name"
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
                <div>
                  <Label htmlFor="bio" className="text-white text-sm font-medium mb-1 block">
                    Bio
                  </Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Tell us about yourself..."
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/15 focus:border-axanar-teal resize-none"
                    rows={2}
                  />
                </div>
              </div>
            ) : (
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">
                  {profile?.full_name || profile?.username || 'Anonymous User'}
                </h1>
                {profile?.username && (
                  <p className="text-axanar-silver/80 mt-1">@{profile.username}</p>
                )}
                {profile?.bio && (
                  <p className="text-axanar-silver/80 mt-2">{profile.bio}</p>
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    className="bg-axanar-teal hover:bg-axanar-teal/90 text-white"
                    disabled={isUploading || isUploadingBackground}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Edit Profile
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="w-56 bg-white border border-gray-200 shadow-lg z-50"
                >
                  <DropdownMenuItem onClick={onEdit} className="cursor-pointer">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile Info
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem 
                    onClick={handleBackgroundClick} 
                    className="cursor-pointer"
                    disabled={isUploadingBackground}
                  >
                    <Image className="h-4 w-4 mr-2" />
                    {profile?.background_url ? 'Change Background' : 'Add Background'}
                  </DropdownMenuItem>
                  
                  {profile?.background_url && (
                    <DropdownMenuItem 
                      onClick={handleRemoveBackground} 
                      className="cursor-pointer text-red-600 focus:text-red-600"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Remove Background
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
        
        {/* Hidden file inputs */}
        <input
          ref={backgroundInputRef}
          type="file"
          accept="image/*"
          onChange={handleBackgroundFileChange}
          className="hidden"
        />
      </div>
    </section>
  );
};

export default ProfileHeader;