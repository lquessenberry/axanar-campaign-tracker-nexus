
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, BarChart3, PlusCircle } from "lucide-react";
import { useDonorAddresses } from "@/hooks/useAddressOperations";
import AddressCard from "./AddressCard";
import AddressForm from "./AddressForm";
import { UserProfile } from "@/types/profile";

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
  profile: UserProfile | null;
  pledges: Pledge[] | undefined;
  campaigns: Campaign[] | undefined;
  donorId?: string | null;
}

const ProfileContent: React.FC<ProfileContentProps> = ({
  profile,
  pledges,
  campaigns,
  donorId,
}) => {
  const [showAddAddressForm, setShowAddAddressForm] = useState(false);
  const { data: addresses, isLoading: addressesLoading, refetch: refetchAddresses } = useDonorAddresses(donorId);
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

      {/* Address Section */}
      {donorId && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Shipping Address</CardTitle>
              {!showAddAddressForm && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowAddAddressForm(true)}
                  disabled={addressesLoading}
                >
                  <PlusCircle className="h-4 w-4 mr-2" /> Add Address
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {addressesLoading ? (
              <p className="text-center py-4 text-muted-foreground">Loading addresses...</p>
            ) : addresses && addresses.length > 0 ? (
              <div className="space-y-4">
                {addresses.map(address => (
                  <AddressCard 
                    key={address.id} 
                    address={address} 
                    donorId={donorId} 
                    onAddressUpdated={refetchAddresses}
                  />
                ))}
              </div>
            ) : showAddAddressForm ? null : (
              <p className="text-center py-4 text-muted-foreground">
                No addresses found. Add a shipping address to receive physical rewards.
              </p>
            )}
            
            {showAddAddressForm && (
              <div className="mt-4">
                <AddressForm 
                  address={null} 
                  donorId={donorId} 
                  onSuccess={() => {
                    setShowAddAddressForm(false);
                    refetchAddresses();
                  }}
                />
                <div className="mt-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowAddAddressForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProfileContent;
