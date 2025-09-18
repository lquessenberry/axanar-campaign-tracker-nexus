
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, Heart, Settings, Link2, Copy, MapPin, Gift } from "lucide-react";
import { Link } from "react-router-dom";
import { User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { useUserProfile } from "@/hooks/useUserProfile";
import AddressDialog from "./AddressDialog";
import RewardsDialog from "./RewardsDialog";

interface ProfileSidebarProps {
  user: User;
  memberSince: string;
  onSignOut: () => void;
}

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({
  user,
  memberSince,
  onSignOut,
}) => {
  const { data: profile } = useUserProfile();
  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const [rewardsDialogOpen, setRewardsDialogOpen] = useState(false);

  const handleCopyVanityURL = () => {
    if (profile?.username) {
      const vanityURL = `${window.location.origin}/u/${profile.username}`;
      navigator.clipboard.writeText(vanityURL);
      toast.success("Vanity URL copied to clipboard!");
    }
  };
  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-bold mb-4">Quick Stats</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Account Created</span>
              <span className="text-sm font-medium">{memberSince}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Email</span>
              <span className="text-sm font-medium truncate">{user.email || 'No email'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Profile Views</span>
              <span className="text-sm font-medium">-</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Quick Actions */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-bold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link to="/dashboard">
              <Button variant="outline" className="w-full justify-start">
                <BarChart3 className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            
            {/* Vanity URL Card */}
            {profile?.username && (
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Link2 className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Your Public Profile</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-background/50 px-2 py-1 rounded flex-1 truncate">
                      /u/{profile.username}
                    </code>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-6 w-6 p-0"
                      onClick={handleCopyVanityURL}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setAddressDialogOpen(true)}
            >
              <MapPin className="h-4 w-4 mr-2" />
              Update Shipping Address
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setRewardsDialogOpen(true)}
            >
              <Gift className="h-4 w-4 mr-2" />
              Track Perks & Rewards
            </Button>
            
            <Link to="/">
              <Button variant="outline" className="w-full justify-start">
                <Heart className="h-4 w-4 mr-2" />
                Explore Campaigns
              </Button>
            </Link>
            <Button 
              variant="outline" 
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={onSignOut}
            >
              <Settings className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <AddressDialog 
        open={addressDialogOpen} 
        onOpenChange={setAddressDialogOpen} 
      />
      
      <RewardsDialog 
        open={rewardsDialogOpen} 
        onOpenChange={setRewardsDialogOpen} 
      />
    </div>
  );
};

export default ProfileSidebar;
