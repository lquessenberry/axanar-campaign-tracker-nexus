
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
import { CampaignDataModal } from "./CampaignDataModal";

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
  const [campaignDataModalOpen, setCampaignDataModalOpen] = useState(false);

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
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardContent className="p-6">
          <h3 className="font-bold text-xl mb-4 text-axanar-teal">Quick Stats</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-background/40 rounded-lg">
              <span className="text-sm text-muted-foreground">Account Created</span>
              <span className="text-sm font-semibold">{memberSince}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-background/40 rounded-lg">
              <span className="text-sm text-muted-foreground">Email</span>
              <span className="text-sm font-semibold truncate max-w-32">{user.email || 'No email'}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-background/40 rounded-lg">
              <span className="text-sm text-muted-foreground">Profile Views</span>
              <span className="text-sm font-semibold text-axanar-teal">0</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Quick Actions */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardContent className="p-6">
          <h3 className="font-bold text-xl mb-4 text-axanar-teal">Quick Actions</h3>
          <div className="space-y-3">
            <Link to="/dashboard">
              <Button variant="outline" className="w-full justify-start h-12 hover:bg-axanar-teal hover:text-white transition-colors">
                <BarChart3 className="h-5 w-5 mr-3" />
                <span className="font-medium">Dashboard</span>
              </Button>
            </Link>
            
            {profile?.username && (
              <a href={`/u/${profile.username}`} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="w-full justify-start h-12 hover:bg-axanar-teal hover:text-white transition-colors">
                  <Link2 className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Your Public Profile</div>
                    <div className="text-xs opacity-70">/u/{profile.username}</div>
                  </div>
                </Button>
              </a>
            )}
            
            <Button 
              variant="outline" 
              className="w-full justify-start h-12 hover:bg-yellow-500 hover:text-black transition-colors"
              onClick={() => setAddressDialogOpen(true)}
            >
              <MapPin className="h-5 w-5 mr-3" />
              <span className="font-medium">Update Shipping Address</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start h-12 hover:bg-blue-500 hover:text-white transition-colors"
              onClick={() => setRewardsDialogOpen(true)}
            >
              <Gift className="h-5 w-5 mr-3" />
              <span className="font-medium">Track Perks & Rewards</span>
            </Button>
            
            <Link to="/campaigns">
              <Button 
                variant="outline" 
                className="w-full justify-start h-12 hover:bg-purple-500 hover:text-white transition-colors"
              >
                <Heart className="h-5 w-5 mr-3" />
                <span className="font-medium">Explore Campaigns</span>
              </Button>
            </Link>
            
            <Button 
              variant="outline" 
              className="w-full justify-start h-12 text-red-400 border-red-400/30 hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors"
              onClick={onSignOut}
            >
              <Settings className="h-5 w-5 mr-3" />
              <span className="font-medium">Sign Out</span>
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
