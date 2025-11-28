import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Users, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AccountInfo {
  email: string;
  donor_id: string;
  auth_user_id: string;
  full_name: string;
  pledge_count: number;
  total_amount: number;
  notes?: string;
}

export const AccountMergeExecutor = () => {
  const { toast } = useToast();
  const [sourceEmail, setSourceEmail] = useState('');
  const [targetEmail, setTargetEmail] = useState('');
  const [mergeReason, setMergeReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sourceAccount, setSourceAccount] = useState<AccountInfo | null>(null);
  const [targetAccount, setTargetAccount] = useState<AccountInfo | null>(null);
  const [mergeComplete, setMergeComplete] = useState(false);

  const lookupAccount = async (email: string): Promise<AccountInfo | null> => {
    const { data, error } = await supabase
      .from('donors')
      .select(`
        id,
        email,
        full_name,
        auth_user_id,
        notes
      `)
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (error || !data) {
      console.error('Account lookup error:', error);
      return null;
    }

    // Get pledge count and total
    const { data: pledges } = await supabase
      .from('pledges')
      .select('amount')
      .eq('donor_id', data.id);

    const pledge_count = pledges?.length || 0;
    const total_amount = pledges?.reduce((sum, p) => sum + (Number(p.amount) || 0), 0) || 0;

    return {
      email: data.email,
      donor_id: data.id,
      auth_user_id: data.auth_user_id || '',
      full_name: data.full_name || email,
      pledge_count,
      total_amount,
      notes: data.notes || ''
    };
  };

  const handleLookup = async () => {
    if (!sourceEmail || !targetEmail) {
      toast({
        title: "Missing information",
        description: "Please enter both source and target email addresses",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setMergeComplete(false);

    try {
      const [source, target] = await Promise.all([
        lookupAccount(sourceEmail),
        lookupAccount(targetEmail)
      ]);

      if (!source) {
        toast({
          title: "Source account not found",
          description: `No donor record found for ${sourceEmail}`,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (!target) {
        toast({
          title: "Target account not found",
          description: `No donor record found for ${targetEmail}`,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      setSourceAccount(source);
      setTargetAccount(target);

      toast({
        title: "Accounts found",
        description: "Review the details below and confirm the merge",
      });
    } catch (error: any) {
      console.error('Lookup error:', error);
      toast({
        title: "Lookup failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const executeMerge = async () => {
    if (!sourceAccount || !targetAccount) return;

    setIsLoading(true);

    try {
      // Step 1: Transfer all pledges from source to target donor
      const { error: pledgeError } = await supabase
        .from('pledges')
        .update({ donor_id: targetAccount.donor_id })
        .eq('donor_id', sourceAccount.donor_id);

      if (pledgeError) throw pledgeError;

      // Step 2: Transfer all addresses from source to target donor
      const { error: addressError } = await supabase
        .from('addresses')
        .update({ donor_id: targetAccount.donor_id })
        .eq('donor_id', sourceAccount.donor_id);

      if (addressError) throw addressError;

      // Step 3: Log the merge in merged_accounts table
      const { error: mergeLogError } = await supabase
        .from('merged_accounts')
        .insert({
          source_donor_id: sourceAccount.donor_id,
          target_donor_id: targetAccount.donor_id,
          source_auth_id: sourceAccount.auth_user_id,
          target_auth_id: targetAccount.auth_user_id,
          source_email: sourceAccount.email,
          target_email: targetAccount.email,
          merge_reason: mergeReason || 'Account consolidation - user requested',
          metadata: {
            source_pledge_count: sourceAccount.pledge_count,
            source_total_amount: sourceAccount.total_amount,
            merged_at: new Date().toISOString()
          }
        });

      if (mergeLogError) throw mergeLogError;

      // Step 4: Mark source donor as merged (don't delete, just update flags)
      const { error: donorUpdateError } = await supabase
        .from('donors')
        .update({
          auth_user_id: null, // Unlink auth account
          notes: `Account merged into ${targetAccount.email} on ${new Date().toISOString()}. ${sourceAccount.notes || ''}`
        })
        .eq('id', sourceAccount.donor_id);

      if (donorUpdateError) throw donorUpdateError;

      setMergeComplete(true);
      toast({
        title: "✅ Merge completed successfully",
        description: `${sourceAccount.email} has been merged into ${targetAccount.email}. All pledges and addresses transferred.`,
        duration: 8000,
      });

      // Refresh the lookup to show updated counts
      const updatedTarget = await lookupAccount(targetEmail);
      if (updatedTarget) {
        setTargetAccount(updatedTarget);
      }

    } catch (error: any) {
      console.error('Merge error:', error);
      toast({
        title: "❌ Merge failed",
        description: error.message || "An error occurred during the merge process",
        variant: "destructive",
        duration: 10000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Account Merge Executor
        </CardTitle>
        <CardDescription>
          Consolidate multiple donor accounts into a single account. All pledges, addresses, and history will be transferred to the target account.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="source-email">Source Email (to merge FROM)</Label>
            <Input
              id="source-email"
              type="email"
              placeholder="old@example.com"
              value={sourceEmail}
              onChange={(e) => setSourceEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="target-email">Target Email (to merge INTO)</Label>
            <Input
              id="target-email"
              type="email"
              placeholder="primary@example.com"
              value={targetEmail}
              onChange={(e) => setTargetEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="merge-reason">Merge Reason (optional)</Label>
          <Textarea
            id="merge-reason"
            placeholder="User requested account consolidation..."
            value={mergeReason}
            onChange={(e) => setMergeReason(e.target.value)}
            disabled={isLoading}
            rows={2}
          />
        </div>

        <Button
          onClick={handleLookup}
          disabled={isLoading || !sourceEmail || !targetEmail}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Looking up accounts...
            </>
          ) : (
            'Lookup Accounts'
          )}
        </Button>

        {sourceAccount && targetAccount && (
          <>
            <div className="grid grid-cols-3 gap-4 items-center">
              <Card className="border-orange-500/50 bg-orange-500/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Source Account</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  <p className="font-semibold">{sourceAccount.full_name}</p>
                  <p className="text-xs text-muted-foreground">{sourceAccount.email}</p>
                  <p className="text-xs">Pledges: {sourceAccount.pledge_count}</p>
                  <p className="text-xs">Total: ${sourceAccount.total_amount.toFixed(2)}</p>
                </CardContent>
              </Card>

              <div className="flex justify-center">
                <ArrowRight className="h-8 w-8 text-primary" />
              </div>

              <Card className="border-primary/50 bg-primary/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Target Account</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  <p className="font-semibold">{targetAccount.full_name}</p>
                  <p className="text-xs text-muted-foreground">{targetAccount.email}</p>
                  <p className="text-xs">Pledges: {targetAccount.pledge_count}</p>
                  <p className="text-xs">Total: ${targetAccount.total_amount.toFixed(2)}</p>
                </CardContent>
              </Card>
            </div>

            {!mergeComplete && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Warning:</strong> This action will transfer all pledges and addresses from the source account to the target account. The source account will be unlinked from its auth user. This cannot be easily undone.
                </AlertDescription>
              </Alert>
            )}

            {mergeComplete && (
              <Alert className="border-green-500/50 bg-green-500/10">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-green-700 dark:text-green-300">
                  <strong>Success!</strong> The accounts have been merged. The target account now has {targetAccount.pledge_count} pledge(s) totaling ${targetAccount.total_amount.toFixed(2)}.
                </AlertDescription>
              </Alert>
            )}

            {!mergeComplete && (
              <Button
                onClick={executeMerge}
                disabled={isLoading}
                variant="destructive"
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Executing merge...
                  </>
                ) : (
                  '⚠️ Execute Merge'
                )}
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
