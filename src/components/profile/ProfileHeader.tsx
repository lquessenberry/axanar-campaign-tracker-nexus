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

  return (
    <section 
      className="relative bg-axanar-dark text-white overflow-hidden min-h-[33vh] flex items-center"
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
              radial-gradient(90% 100% at calc(50% + var(--x)) calc(0% + var(--y)), rgba(64, 224, 208, 0.25), rgba(255, 255, 255, 0.15)),
              radial-gradient(100% 100% at calc(80% - var(--x)) calc(0% - var(--y)), rgba(255, 255, 255, 0.2), rgba(64, 224, 208, 0.1)),
              radial-gradient(150% 210% at calc(100% + var(--x)) calc(0% + var(--y)), rgba(0, 255, 255, 0.2), rgba(64, 224, 208, 0.15)),
              radial-gradient(80% 80% at calc(20% + var(--x)) calc(80% + var(--y)), rgba(255, 255, 255, 0.18), rgba(0, 255, 255, 0.12)),
              url(${profile.background_url})
            ` 
          : `
              radial-gradient(90% 100% at calc(50% + var(--x)) calc(0% + var(--y)), rgba(64, 224, 208, 0.4), rgba(0, 255, 255, 0.2)),
              radial-gradient(100% 100% at calc(80% - var(--x)) calc(0% - var(--y)), rgba(255, 255, 255, 0.3), rgba(64, 224, 208, 0.15)),
              radial-gradient(150% 210% at calc(100% + var(--x)) calc(0% + var(--y)), rgba(0, 255, 255, 0.25), rgba(64, 224, 208, 0.18)),
              radial-gradient(80% 80% at calc(20% + var(--x)) calc(80% + var(--y)), rgba(255, 255, 255, 0.22), rgba(0, 255, 255, 0.12)),
              linear-gradient(60deg, rgb(0, 10, 15), rgb(0, 20, 25))
            `,
        backgroundSize: profile?.background_url 
          ? '300% 300%, 300% 300%, 300% 300%, 300% 300%, 100% auto'
          : '300% 300%, 300% 300%, 300% 300%, 300% 300%, 100% 100%',
        backgroundPosition: profile?.background_url 
          ? 'center, center, center, center, center top'
          : 'center, center, center, center, center',
        backgroundRepeat: 'no-repeat',
        backgroundBlendMode: profile?.background_url ? 'overlay, screen, multiply, soft-light, normal' : 'overlay, screen, multiply, soft-light, normal'
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
      
      <div className="w-full mx-auto px-4 py-6 lg:py-10 relative z-20">
        <div className="flex flex-col md:flex-row md:items-start gap-4 lg:gap-6">
          <div className="relative flex-shrink-0">
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
              <div className="space-y-4 bg-white/5 p-4 rounded-lg backdrop-blur-sm border border-white/10">
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
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/15 focus:border-axanar-teal resize-none"
                    rows={3}
                    maxLength={5000}
                  />
                  {formData.bio.length > 4500 && (
                    <p className="text-xs text-amber-400 mt-1">
                      {5000 - formData.bio.length} characters remaining
                    </p>
                  )}
                </div>
                
                {/* Privacy Settings */}
                <div className="pt-3 border-t border-white/20">
                  <div className="flex items-center gap-2 mb-3">
                    <Eye className="h-4 w-4 text-white" />
                    <Label className="text-white text-sm font-medium">Public Profile Privacy</Label>
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
                <h1 className="text-2xl md:text-3xl font-bold">
                  {profile?.full_name || profile?.username || 'Anonymous User'}
                </h1>
                {profile?.username && (
                  <a 
                    href={`/u/${profile.username}`}
                    className="text-axanar-silver/80 mt-1 hover:text-axanar-teal transition-colors cursor-pointer inline-block"
                  >
                    @{profile.username}
                  </a>
                )}
                {profile?.bio && (
                  <p className="text-axanar-silver/80 mt-2">{profile.bio}</p>
                )}
                <p className="text-axanar-silver/80 mt-1">Member since {memberSince}</p>
              </div>
            )}
            
            {/* Quick Stats Pills */}
            <div className="flex flex-wrap gap-2 lg:gap-3 mt-3 lg:mt-4">
              <div className="bg-white/10 backdrop-blur-sm px-3 lg:px-4 py-1.5 lg:py-2 rounded-full border border-white/20">
                <span className="text-xs lg:text-sm font-medium text-white">
                  {pledgesCount} Projects Backed
                </span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm px-3 lg:px-4 py-1.5 lg:py-2 rounded-full border border-white/20">
                <span className="text-xs lg:text-sm font-medium text-white">
                  {campaignsCount} Campaigns Created
                </span>
              </div>
              <div className="bg-axanar-teal/20 backdrop-blur-sm px-3 lg:px-4 py-1.5 lg:py-2 rounded-full border border-axanar-teal/40">
                <span className="text-xs lg:text-sm font-medium text-axanar-teal">
                  ${totalPledged.toLocaleString()} Total Pledged
                </span>
              </div>
            </div>
          </div>
          
            {/* Unified Rank Display */}
            <div className="md:ml-auto flex flex-col gap-3 items-stretch w-full md:w-auto">
              {rankSystem && (
                <div className="rounded-lg border border-white/20 p-3 lg:p-4 bg-gradient-to-br from-axanar-teal/20 to-blue-500/20 backdrop-blur-sm w-full md:min-w-[240px] lg:min-w-[280px]">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-white">{(rankSystem.forumRank?.name || 'CADET').toUpperCase()}</h3>
                      <div className="text-xs text-axanar-teal font-medium">STARFLEET RANK</div>
                    </div>
                    <div className="flex gap-1">
                      {/* Rank pips based on level */}
                      {Array.from({ length: Math.min(rankSystem.militaryRank?.level || 1, 7) }).map((_, i) => (
                        <div
                          key={i}
                          className="w-2 h-6 rounded-sm bg-yellow-400 border border-white/30 shadow-sm"
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-white/90">
                      <span>ARES: {rankSystem.xp.total.toLocaleString()}</span>
                      <span>Level {rankSystem.militaryRank?.level}</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-yellow-400 transition-all"
                        style={{ width: `${rankSystem.progressToNext}%` }}
                      />
                    </div>
                    <div className="text-xs text-white/70 text-center">
                      Progress: {Math.round(rankSystem.progressToNext)}%
                    </div>
                  </div>
                </div>
              )}
              
              {/* Vanity URL Card */}
              {profile?.username && (
                <Card className="bg-white/10 border-white/20 backdrop-blur-sm w-full md:w-auto">
                  <CardContent className="p-3 lg:p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Link2 className="h-4 w-4 text-white" />
                      <span className="text-sm font-medium text-white">Your Public Profile</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-black/20 text-white px-2 py-1 rounded flex-1 truncate">
                        /u/{profile.username}
                      </code>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-6 w-6 p-0 text-white hover:bg-white/20"
                        onClick={() => {
                          const vanityURL = `${window.location.origin}/u/${profile.username}`;
                          navigator.clipboard.writeText(vanityURL);
                          toast.success("Public profile URL copied!");
                        }}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            
            <div className="flex gap-2 mt-4 md:mt-0">
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