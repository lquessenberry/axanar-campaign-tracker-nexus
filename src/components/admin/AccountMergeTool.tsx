import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Search, Link2, AlertTriangle, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';

interface DonorData {
  id: string;
  email: string;
  first_name: string | null;
  full_name: string | null;
  auth_user_id: string | null;
  pledges: Array<{
    id: string;
    amount: number;
    created_at: string;
    campaign_name: string | null;
    reward_name: string | null;
  }>;
  addresses: Array<{
    id: string;
    address1: string | null;
    city: string | null;
    state: string | null;
  }>;
  total_pledged: number;
}

export const AccountMergeTool = () => {
  const [sourceEmail, setSourceEmail] = useState('');
  const [targetEmail, setTargetEmail] = useState('');
  const [sourceDonor, setSourceDonor] = useState<DonorData | null>(null);
  const [targetDonor, setTargetDonor] = useState<DonorData | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isMerging, setIsMerging] = useState(false);
  const { toast } = useToast();

  const searchDonors = async () => {
    if (!sourceEmail.trim() || !targetEmail.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please provide both source and target email addresses',
        variant: 'destructive',
      });
      return;
    }

    setIsSearching(true);
    try {
      // Search source donor
      const { data: sourceData, error: sourceError } = await supabase
        .from('donors')
        .select(`
          id,
          email,
          first_name,
          full_name,
          auth_user_id,
          pledges:pledges(
            id,
            amount,
            created_at,
            campaigns(name),
            rewards(name)
          ),
          addresses:addresses(
            id,
            address1,
            city,
            state
          )
        `)
        .eq('email', sourceEmail.trim().toLowerCase())
        .single();

      if (sourceError) throw new Error(`Source donor not found: ${sourceError.message}`);

      // Search target donor
      const { data: targetData, error: targetError } = await supabase
        .from('donors')
        .select(`
          id,
          email,
          first_name,
          full_name,
          auth_user_id,
          pledges:pledges(
            id,
            amount,
            created_at,
            campaigns(name),
            rewards(name)
          ),
          addresses:addresses(
            id,
            address1,
            city,
            state
          )
        `)
        .eq('email', targetEmail.trim().toLowerCase())
        .single();

      if (targetError) throw new Error(`Target donor not found: ${targetError.message}`);

      // Format data
      const formatDonor = (data: any): DonorData => ({
        id: data.id,
        email: data.email,
        first_name: data.first_name,
        full_name: data.full_name,
        auth_user_id: data.auth_user_id,
        pledges: data.pledges?.map((p: any) => ({
          id: p.id,
          amount: p.amount,
          created_at: p.created_at,
          campaign_name: p.campaigns?.name || null,
          reward_name: p.rewards?.name || null,
        })) || [],
        addresses: data.addresses || [],
        total_pledged: data.pledges?.reduce((sum: number, p: any) => sum + Number(p.amount), 0) || 0,
      });

      setSourceDonor(formatDonor(sourceData));
      setTargetDonor(formatDonor(targetData));

      toast({
        title: 'Donors Found',
        description: 'Ready to merge accounts',
      });
    } catch (error: any) {
      console.error('Search error:', error);
      toast({
        title: 'Search Failed',
        description: error.message || 'Could not find donor records',
        variant: 'destructive',
      });
      setSourceDonor(null);
      setTargetDonor(null);
    } finally {
      setIsSearching(false);
    }
  };

  const mergeAccounts = async () => {
    if (!sourceDonor || !targetDonor) return;

    if (!targetDonor.auth_user_id) {
      toast({
        title: 'Cannot Merge',
        description: 'Target donor must have an authenticated account',
        variant: 'destructive',
      });
      return;
    }

    if (confirm(
      `This will move ${sourceDonor.pledges.length} pledge(s) totaling $${sourceDonor.total_pledged.toFixed(2)} ` +
      `from ${sourceDonor.email} to ${targetDonor.email}. This cannot be undone. Continue?`
    )) {
      setIsMerging(true);
      try {
        // Step 1: Move pledges
        const { error: pledgeError } = await supabase
          .from('pledges')
          .update({ donor_id: targetDonor.id, updated_at: new Date().toISOString() })
          .eq('donor_id', sourceDonor.id);

        if (pledgeError) throw pledgeError;

        // Step 2: Move addresses if target has none
        if (sourceDonor.addresses.length > 0 && targetDonor.addresses.length === 0) {
          const { error: addressError } = await supabase
            .from('addresses')
            .update({ donor_id: targetDonor.id, updated_at: new Date().toISOString() })
            .eq('donor_id', sourceDonor.id);

          if (addressError) console.warn('Address migration failed:', addressError);
        }

        // Step 3: Log merge
        const { error: logError } = await supabase
          .from('merged_accounts')
          .insert({
            source_donor_id: sourceDonor.id,
            source_email: sourceDonor.email,
            target_donor_id: targetDonor.id,
            target_auth_user_id: targetDonor.auth_user_id,
            target_email: targetDonor.email,
            merge_reason: 'Admin account merge via AccountMergeTool',
            pledges_moved: sourceDonor.pledges.length,
            total_amount_moved: sourceDonor.total_pledged,
            merged_by: 'admin',
            notes: `Source: ${sourceDonor.email} merged into ${targetDonor.email}`,
          });

        if (logError) console.warn('Merge log failed:', logError);

        // Step 4: Mark source as merged/inactive
        const { error: deactivateError } = await supabase
          .from('donors')
          .update({
            deleted: true,
            notes: `MERGED: Account consolidated into ${targetDonor.email} on ${new Date().toISOString().split('T')[0]}`,
          })
          .eq('id', sourceDonor.id);

        if (deactivateError) console.warn('Source deactivation failed:', deactivateError);

        toast({
          title: 'Merge Complete',
          description: `Successfully merged ${sourceDonor.pledges.length} pledge(s) totaling $${sourceDonor.total_pledged.toFixed(2)}`,
        });

        // Clear form
        setSourceEmail('');
        setTargetEmail('');
        setSourceDonor(null);
        setTargetDonor(null);
      } catch (error: any) {
        console.error('Merge error:', error);
        toast({
          title: 'Merge Failed',
          description: error.message || 'An error occurred during merge',
          variant: 'destructive',
        });
      } finally {
        setIsMerging(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Account Merge & Pledge Restoration
          </CardTitle>
          <CardDescription>
            Merge two donor accounts and restore pledge history from legacy records
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="source-email">Source Email (Legacy/Orphaned)</Label>
              <Input
                id="source-email"
                type="email"
                placeholder="old@example.com"
                value={sourceEmail}
                onChange={(e) => setSourceEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchDonors()}
              />
              <p className="text-xs text-muted-foreground">
                Account with pledges but no auth link
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="target-email">Target Email (Current/Auth)</Label>
              <Input
                id="target-email"
                type="email"
                placeholder="new@example.com"
                value={targetEmail}
                onChange={(e) => setTargetEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchDonors()}
              />
              <p className="text-xs text-muted-foreground">
                Account that user logs in with
              </p>
            </div>
          </div>

          <Button onClick={searchDonors} disabled={isSearching} className="w-full">
            {isSearching ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Search Donors
              </>
            )}
          </Button>

          {sourceDonor && targetDonor && (
            <div className="space-y-4 border-t pt-4">
              <div className="grid md:grid-cols-2 gap-4">
                {/* Source Donor */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center justify-between">
                      <span>Source (Legacy)</span>
                      {!sourceDonor.auth_user_id ? (
                        <Badge variant="secondary" className="text-xs">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          No Auth
                        </Badge>
                      ) : (
                        <Badge variant="default" className="text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Linked
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Email:</span>
                      <div className="text-muted-foreground">{sourceDonor.email}</div>
                    </div>
                    <div>
                      <span className="font-medium">Name:</span>
                      <div className="text-muted-foreground">
                        {sourceDonor.first_name || sourceDonor.full_name || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Pledges:</span>
                      <div className="text-muted-foreground">
                        {sourceDonor.pledges.length} pledge(s)
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Total:</span>
                      <div className="text-muted-foreground font-semibold">
                        ${sourceDonor.total_pledged.toFixed(2)}
                      </div>
                    </div>
                    {sourceDonor.pledges.length > 0 && (
                      <div className="space-y-1 mt-2 max-h-32 overflow-y-auto">
                        {sourceDonor.pledges.map((pledge) => (
                          <div key={pledge.id} className="text-xs bg-muted/50 p-2 rounded">
                            <div className="flex justify-between">
                              <span>${pledge.amount}</span>
                              <span>{new Date(pledge.created_at).toLocaleDateString()}</span>
                            </div>
                            {pledge.campaign_name && (
                              <div className="text-muted-foreground">{pledge.campaign_name}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="flex items-center justify-center">
                  <ArrowRight className="h-8 w-8 text-muted-foreground" />
                </div>

                {/* Target Donor */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center justify-between">
                      <span>Target (Current)</span>
                      {targetDonor.auth_user_id ? (
                        <Badge variant="default" className="text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Auth Active
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="text-xs">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          No Auth
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Email:</span>
                      <div className="text-muted-foreground">{targetDonor.email}</div>
                    </div>
                    <div>
                      <span className="font-medium">Name:</span>
                      <div className="text-muted-foreground">
                        {targetDonor.first_name || targetDonor.full_name || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Current Pledges:</span>
                      <div className="text-muted-foreground">
                        {targetDonor.pledges.length} pledge(s)
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Current Total:</span>
                      <div className="text-muted-foreground">
                        ${targetDonor.total_pledged.toFixed(2)}
                      </div>
                    </div>
                    <div className="pt-2 border-t">
                      <span className="font-medium">After Merge:</span>
                      <div className="text-primary font-semibold">
                        ${(targetDonor.total_pledged + sourceDonor.total_pledged).toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {targetDonor.pledges.length + sourceDonor.pledges.length} total pledge(s)
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Warning:</strong> This action will permanently move all pledges and data from the
                  source account to the target account. The source account will be marked as inactive. This
                  cannot be undone.
                </AlertDescription>
              </Alert>

              <Button
                onClick={mergeAccounts}
                disabled={isMerging || !targetDonor.auth_user_id}
                variant="default"
                className="w-full"
              >
                {isMerging ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Merging Accounts...
                  </>
                ) : (
                  <>
                    <Link2 className="mr-2 h-4 w-4" />
                    Merge Accounts & Restore Pledges
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Use Case:</strong> When a user signed up with a new email but their legacy pledges are on an
          old unlinked donor record. This tool merges both accounts so the user sees their full contribution
          history when they log in.
        </AlertDescription>
      </Alert>
    </div>
  );
};
