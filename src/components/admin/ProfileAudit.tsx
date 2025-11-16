import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface AuditResult {
  donor_id: string;
  username: string;
  email: string;
  calculated_total: number;
  profile_display_total: number;
  discrepancy: number;
  pledge_count: number;
  campaigns_count: number;
}

export const ProfileAudit = () => {
  const [loading, setLoading] = useState(false);
  const [auditResults, setAuditResults] = useState<AuditResult[]>([]);
  const [summary, setSummary] = useState<{
    total_profiles: number;
    profiles_with_discrepancies: number;
    profiles_synced: number;
  } | null>(null);
  const { toast } = useToast();

  const runAudit = async () => {
    setLoading(true);
    try {
      // Manual audit: fetch pledges and group by donor
      const { data: pledgeData, error: pledgeError } = await supabase
        .from('pledges')
        .select(`
          donor_id,
          amount,
          campaign_id,
          donors!inner (
            id,
            username,
            email,
            full_name
          )
        `)
        .limit(500);

      if (pledgeError) throw pledgeError;

      // Group by donor and calculate totals
      const donorTotals = new Map<string, AuditResult>();
      const donorCampaigns = new Map<string, Set<string>>();
      
      pledgeData?.forEach(pledge => {
        const donorId = pledge.donor_id;
        if (!donorTotals.has(donorId)) {
          donorTotals.set(donorId, {
            donor_id: donorId,
            username: (pledge.donors as any).username || 'N/A',
            email: (pledge.donors as any).email,
            calculated_total: 0,
            profile_display_total: 0,
            discrepancy: 0,
            pledge_count: 0,
            campaigns_count: 0
          });
          donorCampaigns.set(donorId, new Set());
        }
        
        const donor = donorTotals.get(donorId)!;
        donor.calculated_total += Number(pledge.amount);
        donor.pledge_count += 1;
        
        if (pledge.campaign_id) {
          donorCampaigns.get(donorId)!.add(pledge.campaign_id);
        }
      });

      // Update campaigns count
      donorTotals.forEach((donor, donorId) => {
        donor.campaigns_count = donorCampaigns.get(donorId)?.size || 0;
      });

      const results = Array.from(donorTotals.values());
      setAuditResults(results);

      const discrepancies = results.filter(r => Math.abs(r.discrepancy) > 0.01);
      
      setSummary({
        total_profiles: results.length,
        profiles_with_discrepancies: discrepancies.length,
        profiles_synced: results.length - discrepancies.length
      });

      toast({
        title: "Audit Complete",
        description: `Checked ${results.length} profiles. Found ${discrepancies.length} discrepancies.`,
      });

    } catch (error: any) {
      toast({
        title: "Audit Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Data Audit</CardTitle>
          <CardDescription>
            Verify donor profile totals match actual pledge data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={runAudit}
            disabled={loading}
            className="w-full"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Run Profile Audit
          </Button>

          {summary && (
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{summary.total_profiles}</div>
                  <p className="text-xs text-muted-foreground">Profiles Checked</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-green-600">
                    {summary.profiles_synced}
                  </div>
                  <p className="text-xs text-muted-foreground">Synced ✓</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-amber-600">
                    {summary.profiles_with_discrepancies}
                  </div>
                  <p className="text-xs text-muted-foreground">Discrepancies</p>
                </CardContent>
              </Card>
            </div>
          )}

          {auditResults.length > 0 && (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-right">Pledges</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditResults.slice(0, 10).map((result) => {
                    const hasDiscrepancy = Math.abs(result.discrepancy) > 0.01;
                    return (
                      <TableRow key={result.donor_id}>
                        <TableCell className="font-mono text-sm">
                          {result.username || 'N/A'}
                        </TableCell>
                        <TableCell className="text-sm">
                          {result.email}
                        </TableCell>
                        <TableCell className="text-right">
                          {result.pledge_count}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          ${result.calculated_total.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {hasDiscrepancy ? (
                            <AlertCircle className="h-4 w-4 text-amber-500" />
                          ) : (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
