import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { MapPin, Gift, User, Eye, Link2, Copy } from "lucide-react";
import AddressDialog from "../AddressDialog";
import RewardsDialog from "../RewardsDialog";
import { toast } from "sonner";
import { useUserProfile } from "@/hooks/useUserProfile";

interface SettingsSectionProps {
  profile: any;
  isEditing: boolean;
  formData: {
    full_name: string;
    username: string;
    bio: string;
    show_avatar_publicly: boolean;
    show_real_name_publicly: boolean;
    show_background_publicly: boolean;
  };
  setFormData: (data: any) => void;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({
  profile,
  isEditing,
  formData,
  setFormData,
  onEdit,
  onSave,
  onCancel,
  isLoading
}) => {
  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const [rewardsDialogOpen, setRewardsDialogOpen] = useState(false);
  const { data: currentProfile } = useUserProfile();

  const handleCopyVanityURL = () => {
    if (currentProfile?.username) {
      const vanityURL = `${window.location.origin}/u/${currentProfile.username}`;
      navigator.clipboard.writeText(vanityURL);
      toast.success("Vanity URL copied to clipboard!");
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Settings */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Settings
            </CardTitle>
            {!isEditing ? (
              <Button onClick={onEdit} variant="outline">
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button onClick={onCancel} variant="outline" disabled={isLoading}>
                  Cancel
                </Button>
                <Button onClick={onSave} disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              disabled={!isEditing}
              placeholder="Your full name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              disabled={!isEditing}
              placeholder="Your username"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              disabled={!isEditing}
              placeholder="Tell us about yourself..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Privacy Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="show_avatar">Show Avatar Publicly</Label>
              <p className="text-sm text-muted-foreground">
                Display your avatar on your public profile
              </p>
            </div>
            <Switch
              id="show_avatar"
              checked={formData.show_avatar_publicly}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, show_avatar_publicly: checked })
              }
              disabled={!isEditing}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="show_name">Show Real Name Publicly</Label>
              <p className="text-sm text-muted-foreground">
                Display your real name on your public profile
              </p>
            </div>
            <Switch
              id="show_name"
              checked={formData.show_real_name_publicly}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, show_real_name_publicly: checked })
              }
              disabled={!isEditing}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="show_background">Show Background Publicly</Label>
              <p className="text-sm text-muted-foreground">
                Display your profile background on your public profile
              </p>
            </div>
            <Switch
              id="show_background"
              checked={formData.show_background_publicly}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, show_background_publicly: checked })
              }
              disabled={!isEditing}
            />
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {currentProfile?.username && (
            <Button
              variant="outline"
              className="w-full justify-start h-12"
              onClick={handleCopyVanityURL}
            >
              <Link2 className="h-5 w-5 mr-3" />
              <div className="text-left flex-1">
                <div className="font-medium">Copy Public Profile Link</div>
                <div className="text-xs text-muted-foreground">/u/{currentProfile.username}</div>
              </div>
              <Copy className="h-4 w-4" />
            </Button>
          )}

          <Button
            variant="outline"
            className="w-full justify-start h-12"
            onClick={() => setAddressDialogOpen(true)}
          >
            <MapPin className="h-5 w-5 mr-3" />
            <span className="font-medium">Update Shipping Address</span>
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start h-12"
            onClick={() => setRewardsDialogOpen(true)}
          >
            <Gift className="h-5 w-5 mr-3" />
            <span className="font-medium">Track Perks & Rewards</span>
          </Button>
        </CardContent>
      </Card>

      <AddressDialog open={addressDialogOpen} onOpenChange={setAddressDialogOpen} />
      <RewardsDialog open={rewardsDialogOpen} onOpenChange={setRewardsDialogOpen} />
    </div>
  );
};

export default SettingsSection;