import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AlertCircle, CheckCircle, Search } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PledgeIssue {
  donor_email: string;
  donor_id: string;
  pledge_id: string;
  current_amount: number;
  source_amount: string;
  campaign_name: string;
  reported_amount?: number;
}

export const PledgeDataCorrection = () => {
  const [searchEmail, setSearchEmail] = useState('');
  const [issues, setIssues] = useState<PledgeIssue[]>([]);
  const [corrections, setCorrections] = useState<Record<string, number>>({});
  const [isSearching, setIsSearching] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const searchForIssues = async () => {
    if (!searchEmail) {
      toast({
        title: 'Error',
        description: 'Please enter an email address',
        variant: 'destructive',
      });
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase.rpc('find_pledge_data_issues', {
        search_email: searchEmail.toLowerCase()
      });

      if (error) throw error;

      const issuesData = data as PledgeIssue[];
      
      if (issuesData && issuesData.length > 0) {
        setIssues(issuesData);
        toast({
          title: 'Issues Found',
          description: `Found ${issuesData.length} pledge(s) with potential data issues`,
        });
      } else {
        setIssues([]);
        toast({
          title: 'No Issues',
          description: 'No data integrity issues found for this email',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Search Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSearching(false);
    }
  };

  const updatePledgeAmount = async (pledgeId: string, newAmount: number) => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('pledges')
        .update({ 
          amount: newAmount,
          updated_at: new Date().toISOString(),
          source: 'manual_correction'
        })
        .eq('id', pledgeId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Pledge amount corrected',
      });

      // Refresh the search
      searchForIssues();
    } catch (error: any) {
      toast({
        title: 'Update Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-warning" />
          Pledge Data Correction Tool
        </CardTitle>
        <CardDescription>
          Search for and correct pledge amounts that were imported with incorrect data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This tool identifies pledges with suspicious amounts (e.g., $1 or $2) that likely indicate
            data corruption during import. Use this to correct pledge amounts based on donor reports or
            verified source data.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search-email">Search by Donor Email</Label>
              <Input
                id="search-email"
                type="email"
                placeholder="donor@example.com"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchForIssues()}
              />
            </div>
            <Button
              onClick={searchForIssues}
              disabled={isSearching || !searchEmail}
              className="mt-6"
            >
              {isSearching ? (
                <>Searching...</>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </>
              )}
            </Button>
          </div>

          {issues.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Found Issues:</h3>
              {issues.map((issue) => (
                <Card key={issue.pledge_id} className="border-warning">
                  <CardContent className="pt-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Donor:</span>
                        <p className="font-medium">{issue.donor_email}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Campaign:</span>
                        <p className="font-medium">{issue.campaign_name}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Current Amount:</span>
                        <p className="font-medium text-destructive">
                          ${issue.current_amount.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Source Data:</span>
                        <p className="font-medium">{issue.source_amount || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="flex gap-4 items-end">
                      <div className="flex-1">
                        <Label htmlFor={`correct-amount-${issue.pledge_id}`}>
                          Correct Amount ($)
                        </Label>
                        <Input
                          id={`correct-amount-${issue.pledge_id}`}
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="Enter correct amount"
                          value={corrections[issue.pledge_id] || ''}
                          onChange={(e) =>
                            setCorrections({
                              ...corrections,
                              [issue.pledge_id]: parseFloat(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                      <Button
                        onClick={() =>
                          updatePledgeAmount(
                            issue.pledge_id,
                            corrections[issue.pledge_id] || 0
                          )
                        }
                        disabled={
                          isUpdating ||
                          !corrections[issue.pledge_id] ||
                          corrections[issue.pledge_id] <= 0
                        }
                        variant="default"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Update
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {issues.length === 0 && searchEmail && !isSearching && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                No data integrity issues found for this donor.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <Alert>
          <AlertDescription className="text-sm">
            <strong>Note:</strong> All corrections are logged with timestamp and marked as 'manual_correction'.
            Donors should be notified after corrections are made.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};
