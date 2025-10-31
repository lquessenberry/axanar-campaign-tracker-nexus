import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

interface PrivacySettingsProps {
  profile: any;
}

export const PrivacySettings: React.FC<PrivacySettingsProps> = ({ profile }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [settings, setSettings] = React.useState({
    show_avatar_publicly: profile?.show_avatar_publicly ?? true,
    show_real_name_publicly: profile?.show_real_name_publicly ?? true,
    show_background_publicly: profile?.show_background_publicly ?? true,
  });

  const handleToggle = async (field: keyof typeof settings) => {
    if (!user) return;

    const newValue = !settings[field];
    setSettings(prev => ({ ...prev, [field]: newValue }));

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ [field]: newValue })
        .eq('id', user.id);

      if (error) throw error;

      // Invalidate profile query to refresh data
      queryClient.invalidateQueries({ queryKey: ['user-profile', user.id] });
      queryClient.invalidateQueries({ queryKey: ['vanity-profile', profile?.username] });

      toast.success('Privacy settings updated');
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      // Revert on error
      setSettings(prev => ({ ...prev, [field]: !newValue }));
      toast.error('Failed to update privacy settings');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Public Profile Privacy
        </CardTitle>
        <CardDescription>
          Control what information is visible on your public profile (/profile/{profile?.username || 'username'})
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5 flex-1">
            <Label htmlFor="show-avatar" className="text-base font-medium">
              Show Profile Photo
            </Label>
            <p className="text-sm text-muted-foreground">
              Display your avatar image on your public profile
            </p>
          </div>
          <Switch
            id="show-avatar"
            checked={settings.show_avatar_publicly}
            onCheckedChange={() => handleToggle('show_avatar_publicly')}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5 flex-1">
            <Label htmlFor="show-name" className="text-base font-medium">
              Show Real Name
            </Label>
            <p className="text-sm text-muted-foreground">
              Display your full name instead of just your username
            </p>
          </div>
          <Switch
            id="show-name"
            checked={settings.show_real_name_publicly}
            onCheckedChange={() => handleToggle('show_real_name_publicly')}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5 flex-1">
            <Label htmlFor="show-background" className="text-base font-medium">
              Show Background Image
            </Label>
            <p className="text-sm text-muted-foreground">
              Display your custom background image on your profile header
            </p>
          </div>
          <Switch
            id="show-background"
            checked={settings.show_background_publicly}
            onCheckedChange={() => handleToggle('show_background_publicly')}
          />
        </div>

        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <EyeOff className="h-4 w-4" />
            Hidden information will be replaced with defaults on your public profile
          </p>
        </div>
      </CardContent>
    </Card>
  );
};