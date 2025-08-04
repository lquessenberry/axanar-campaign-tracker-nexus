import React, { useState } from 'react';
import { Search, User, Link, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useAdminUpdateUserProfile } from '@/hooks/useAdminUserProfile';
import { supabase } from '@/integrations/supabase/client';

interface DonorReunificationToolProps {
  adminUserId?: string;
}

const DonorReunificationTool: React.FC<DonorReunificationToolProps> = ({ adminUserId }) => {
  const [searchEmail, setSearchEmail] = useState('');
  const [donorData, setDonorData] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    donor_name: ''
  });
  
  const updateProfile = useAdminUpdateUserProfile();

  const searchDonor = async () => {
    if (!searchEmail.trim()) return;
    
    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from('donors')
        .select(`
          *,
          pledges:pledges(amount, created_at, campaign_id)
        `)
        .eq('email', searchEmail.trim())
        .single();

      if (error) {
        console.error('Error searching donor:', error);
        setDonorData(null);
      } else {
        setDonorData(data);
        setFormData({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          donor_name: data.donor_name || ''
        });
      }
    } catch (error) {
      console.error('Search failed:', error);
      setDonorData(null);
    } finally {
      setIsSearching(false);
    }
  };

  const linkToAdmin = async () => {
    if (!adminUserId || !donorData) return;

    try {
      // Update the donor record to link to admin user
      const { error: donorError } = await supabase
        .from('donors')
        .update({ 
          auth_user_id: adminUserId,
          first_name: formData.first_name || null,
          last_name: formData.last_name || null,
          donor_name: formData.donor_name || null
        })
        .eq('id', donorData.id);

      if (donorError) {
        throw donorError;
      }

      // Refresh donor data
      await searchDonor();
      
      alert('Successfully linked donor record to admin account!');
    } catch (error) {
      console.error('Error linking donor:', error);
      alert('Failed to link donor record');
    }
  };

  const updateDonorInfo = async () => {
    if (!donorData) return;

    try {
      const { error } = await supabase
        .from('donors')
        .update({
          first_name: formData.first_name || null,
          last_name: formData.last_name || null,
          donor_name: formData.donor_name || null
        })
        .eq('id', donorData.id);

      if (error) {
        throw error;
      }

      await searchDonor();
      alert('Donor information updated successfully!');
    } catch (error) {
      console.error('Error updating donor:', error);
      alert('Failed to update donor information');
    }
  };

  const totalDonated = donorData?.pledges?.reduce((sum: number, pledge: any) => sum + (pledge.amount || 0), 0) || 0;
  const isLinked = donorData?.auth_user_id === adminUserId;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link className="h-5 w-5" />
          Donor Reunification Tool
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="search-email">Search Donor by Email</Label>
          <div className="flex gap-2">
            <Input
              id="search-email"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              placeholder="Enter donor email (e.g., lee@bbqberry.com)"
              onKeyPress={(e) => e.key === 'Enter' && searchDonor()}
            />
            <Button 
              onClick={searchDonor} 
              disabled={isSearching || !searchEmail.trim()}
              size="sm"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {donorData && (
          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Donor Found</h3>
              <div className="flex gap-2">
                {isLinked ? (
                  <Badge variant="default" className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Linked to Admin
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Not Linked
                  </Badge>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Email:</span> {donorData.email}
              </div>
              <div>
                <span className="font-medium">Total Donated:</span> ${totalDonated.toFixed(2)}
              </div>
              <div>
                <span className="font-medium">Pledges:</span> {donorData.pledges?.length || 0}
              </div>
              <div>
                <span className="font-medium">Legacy ID:</span> {donorData.legacy_id || 'N/A'}
              </div>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="first-name">First Name</Label>
                  <Input
                    id="first-name"
                    value={formData.first_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <Label htmlFor="last-name">Last Name</Label>
                  <Input
                    id="last-name"
                    value={formData.last_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                    placeholder="Enter last name"
                  />
                </div>
                <div>
                  <Label htmlFor="donor-name">Display Name</Label>
                  <Input
                    id="donor-name"
                    value={formData.donor_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, donor_name: e.target.value }))}
                    placeholder="Enter display name"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                {!isLinked && adminUserId && (
                  <Button onClick={linkToAdmin} className="flex items-center gap-2">
                    <Link className="h-4 w-4" />
                    Link to Admin Account
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  onClick={updateDonorInfo}
                  className="flex items-center gap-2"
                >
                  <User className="h-4 w-4" />
                  Update Donor Info
                </Button>
              </div>
            </div>

            {donorData.pledges && donorData.pledges.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Pledge History</h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {donorData.pledges.map((pledge: any, index: number) => (
                    <div key={pledge.id || index} className="flex justify-between text-sm bg-muted/50 p-2 rounded">
                      <span>${pledge.amount}</span>
                      <span>{pledge.created_at ? new Date(pledge.created_at).toLocaleDateString() : 'Date unknown'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            This tool helps reunify existing donor data with admin accounts. 
            Search for donor records by email to link them or update their information.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default DonorReunificationTool;