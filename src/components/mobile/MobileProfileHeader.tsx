import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { User, Camera, Edit3, Check, X } from 'lucide-react';
import { useAvatarUpload } from '@/hooks/useAvatarUpload';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface MobileProfileHeaderProps {
  profile: any;
  onProfileUpdate: (data: any) => Promise<void>;
  memberSince: string;
  pledgesCount: number;
  campaignsCount: number;
  totalPledged: number;
}

export function MobileProfileHeader({ 
  profile, 
  onProfileUpdate, 
  memberSince, 
  pledgesCount, 
  campaignsCount, 
  totalPledged 
}: MobileProfileHeaderProps) {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadAvatar, isUploading } = useAvatarUpload();

  const startEditing = (field: string, currentValue: string) => {
    setEditingField(field);
    setTempValue(currentValue || '');
  };

  const cancelEditing = () => {
    setEditingField(null);
    setTempValue('');
    // Add haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  const saveField = async () => {
    if (!editingField) {
      console.log('⚠️ No editing field set');
      return;
    }
    
    console.log('💾 Mobile: Saving field', editingField, 'with value:', tempValue);
    
    try {
      const updateData = { [editingField]: tempValue };
      console.log('📡 Mobile: Calling onProfileUpdate with:', updateData);
      
      await onProfileUpdate(updateData);
      
      console.log('✅ Mobile: Profile field updated successfully');
      setEditingField(null);
      setTempValue('');
      toast.success('Profile updated!');
      
      // Add haptic feedback for success
      if (navigator.vibrate) {
        navigator.vibrate([50, 50, 50]);
      }
    } catch (error) {
      console.error('❌ Mobile: Failed to update profile field:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const avatarUrl = await uploadAvatar(file);
    if (avatarUrl) {
      await onProfileUpdate({ avatar_url: avatarUrl });
      toast.success('Avatar updated!');
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-gradient-to-b from-primary/20 to-background p-6 space-y-6">
      {/* Avatar Section */}
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <div 
            className="w-24 h-24 rounded-full bg-primary/20 ring-4 ring-primary flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
            onClick={handleAvatarClick}
          >
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.full_name || 'User'}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="h-12 w-12 text-primary" />
            )}
          </div>
          <Button
            size="sm"
            variant="secondary"
            onClick={handleAvatarClick}
            disabled={isUploading}
            className="absolute -bottom-2 -right-2 h-10 w-10 rounded-full p-0 shadow-lg"
          >
            <Camera className="h-4 w-4" />
          </Button>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleAvatarChange}
          className="hidden"
        />
      </div>

      {/* Name Section - Tap to Edit */}
      <div className="space-y-4">
        {editingField === 'full_name' ? (
          <div className="space-y-3">
            <Input
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              placeholder="Enter your full name"
              className="text-lg font-bold text-center h-12 text-base"
              style={{ fontSize: '16px' }} // Prevents iOS zoom
              autoFocus
            />
            <div className="flex gap-3 justify-center">
              <Button
                size="sm"
                variant="outline"
                onClick={cancelEditing}
                className="h-12 px-6"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={saveField}
                className="h-12 px-6 bg-primary hover:bg-primary/90"
              >
                <Check className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        ) : (
          <div 
            className="flex items-center justify-center gap-2 p-4 rounded-lg hover:bg-muted/50 active:bg-muted cursor-pointer min-h-[48px] transition-colors"
            onClick={() => startEditing('full_name', profile?.full_name || '')}
          >
            <h1 className="text-xl font-bold text-center">
              {profile?.full_name || 'Tap to add name'}
            </h1>
            <Edit3 className="h-4 w-4 text-muted-foreground" />
          </div>
        )}

        {/* Username */}
        {editingField === 'username' ? (
          <div className="space-y-3">
            <Input
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              placeholder="Enter username"
              className="text-center h-12"
              style={{ fontSize: '16px' }}
              autoFocus
            />
            <div className="flex gap-3 justify-center">
              <Button
                size="sm"
                variant="outline"
                onClick={cancelEditing}
                className="h-12 px-6"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={saveField}
                className="h-12 px-6"
              >
                <Check className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        ) : (
          <div 
            className="flex items-center justify-center gap-2 p-3 rounded-lg hover:bg-muted/50 active:bg-muted cursor-pointer min-h-[44px] transition-colors"
            onClick={() => startEditing('username', profile?.username || '')}
          >
            <p className="text-muted-foreground text-center">
              @{profile?.username || 'tap-to-add-username'}
            </p>
            <Edit3 className="h-3 w-3 text-muted-foreground" />
          </div>
        )}

        {/* Bio */}
        {editingField === 'bio' ? (
          <div className="space-y-3">
            <Textarea
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              placeholder="Tell us about yourself..."
              className="text-center resize-none min-h-[80px]"
              style={{ fontSize: '16px' }}
              rows={3}
              autoFocus
            />
            <div className="flex gap-3 justify-center">
              <Button
                size="sm"
                variant="outline"
                onClick={cancelEditing}
                className="h-12 px-6"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={saveField}
                className="h-12 px-6"
              >
                <Check className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        ) : (
          <div 
            className="flex items-center justify-center gap-2 p-4 rounded-lg hover:bg-muted/50 active:bg-muted cursor-pointer min-h-[48px] transition-colors"
            onClick={() => startEditing('bio', profile?.bio || '')}
          >
            <p className="text-muted-foreground text-center text-sm">
              {profile?.bio || 'Tap to add bio'}
            </p>
            <Edit3 className="h-3 w-3 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t">
        <div className="text-center">
          <p className="text-lg font-bold">{pledgesCount}</p>
          <p className="text-xs text-muted-foreground">Projects</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold">{campaignsCount}</p>
          <p className="text-xs text-muted-foreground">Campaigns</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold">${totalPledged.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Pledged</p>
        </div>
      </div>

      {/* Member Since */}
      <p className="text-center text-xs text-muted-foreground">
        Member since {memberSince}
      </p>
    </div>
  );
}