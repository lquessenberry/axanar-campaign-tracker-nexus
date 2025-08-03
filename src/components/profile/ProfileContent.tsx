
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, BarChart3 } from "lucide-react";

interface Pledge {
  id: string;
  amount: number;
  created_at: string;
  campaigns?: {
    title: string;
  };
}

interface Campaign {
  id: string;
  title: string;
  created_at: string;
}

interface ProfileContentProps {
  profile: any;
  pledges: Pledge[] | undefined;
  campaigns: Campaign[] | undefined;
}

const ProfileContent: React.FC<ProfileContentProps> = ({
  profile,
  pledges,
  campaigns,
}) => {
  return (
    <div className="lg:col-span-2 space-y-6">
      {/* Bio Section */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-bold mb-4">About</h3>
          <p className="text-muted-foreground">
            {profile?.bio || 'No bio added yet. Click "Edit Profile" to add information about yourself.'}
          </p>
        </CardContent>
      </Card>

      {/* Participation Status */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-bold mb-4">Axanar Participation Status</h3>
          <div className="space-y-4">
            
            {/* Profile Completion */}
            <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
              <div className={`h-3 w-3 rounded-full flex-shrink-0 ${
                profile?.full_name && profile?.bio ? 'bg-green-500' : 'bg-yellow-500'
              }`} />
              <div className="flex-1">
                <p className="font-medium">Profile Information</p>
                <p className="text-sm text-muted-foreground">
                  {profile?.full_name && profile?.bio 
                    ? 'Complete - Thank you for updating your profile!'
                    : 'Incomplete - Please update your profile information'
                  }
                </p>
              </div>
              <div className="text-sm font-medium text-axanar-teal">
                {profile?.full_name && profile?.bio ? '+50 XP' : '0 XP'}
              </div>
            </div>

            {/* Address & Shipping */}
            <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
              <div className="h-3 w-3 rounded-full bg-yellow-500 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium">Shipping Information</p>
                <p className="text-sm text-muted-foreground">
                  Update your address for perk delivery eligibility
                </p>
              </div>
              <div className="text-sm font-medium text-muted-foreground">
                0 XP
              </div>
            </div>

            {/* Account Recovery Bounty */}
            <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
              <div className="h-3 w-3 rounded-full bg-blue-500 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium">Recovery Ambassador</p>
                <p className="text-sm text-muted-foreground">
                  Help fellow donors reconnect: 0 accounts re-enlisted
                </p>
              </div>
              <div className="text-sm font-medium text-axanar-teal">
                0 XP
              </div>
            </div>

            {/* Total XP */}
            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Participation XP</span>
                <span className="text-lg font-bold text-axanar-teal">
                  {(profile?.full_name && profile?.bio ? 50 : 0)} XP
                </span>
              </div>
              <div className="w-full bg-muted mt-2 rounded-full h-2">
                <div 
                  className="bg-axanar-teal h-2 rounded-full transition-all"
                  style={{ width: `${Math.min((profile?.full_name && profile?.bio ? 50 : 0) / 200 * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Next milestone: 200 XP - Veteran Supporter Badge
              </p>
            </div>

            {/* Recent Activity */}
            {(pledges && pledges.length > 0) && (
              <div className="border-t pt-4 mt-4">
                <h4 className="font-medium mb-3">Recent Contributions</h4>
                <div className="space-y-2">
                  {pledges.slice(0, 2).map((pledge) => (
                    <div key={pledge.id} className="flex items-center gap-3 text-sm">
                      <Heart className="h-4 w-4 text-axanar-teal flex-shrink-0" />
                      <span className="flex-1">
                        Backed "{pledge.campaigns?.title}" - ${Number(pledge.amount).toLocaleString()}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(pledge.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileContent;
