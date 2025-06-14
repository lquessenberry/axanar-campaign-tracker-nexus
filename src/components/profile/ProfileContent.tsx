
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

      {/* Recent Activity */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-bold mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {pledges?.slice(0, 3).map((pledge) => (
              <div key={pledge.id} className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
                <Heart className="h-5 w-5 text-axanar-teal flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium">
                    Backed "{pledge.campaigns?.title}" with ${Number(pledge.amount).toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(pledge.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
            
            {campaigns?.slice(0, 2).map((campaign) => (
              <div key={campaign.id} className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
                <BarChart3 className="h-5 w-5 text-axanar-teal flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium">
                    Created campaign "{campaign.title}"
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(campaign.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
            
            {(!pledges || pledges.length === 0) && (!campaigns || campaigns.length === 0) && (
              <p className="text-muted-foreground text-center py-4">
                No recent activity. Start by backing a campaign or creating your own!
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileContent;
