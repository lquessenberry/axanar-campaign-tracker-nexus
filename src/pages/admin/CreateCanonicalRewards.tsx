import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function CreateCanonicalRewards() {
  const [isCreating, setIsCreating] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleCreate = async () => {
    setIsCreating(true);
    setResult(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('You must be logged in');
        setIsCreating(false);
        return;
      }

      const response = await fetch(
        `https://vsarkftwkontkfcodbyk.supabase.co/functions/v1/create-canonical-rewards`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        }
      );

      const data = await response.json();
      
      if (response.ok) {
        setResult(data);
        toast.success(data.message || 'Canonical rewards created successfully');
      } else {
        throw new Error(data.error || 'Failed to create rewards');
      }
    } catch (error) {
      console.error('Error creating rewards:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create rewards');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Canonical Campaign Rewards</CardTitle>
          <CardDescription>
            Generate the complete canonical rewards database from historical campaign data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4 text-sm">
            <p className="font-medium mb-2">This will create 61 reward tiers:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li><strong>Prelude to Axanar (Kickstarter)</strong>: 10 tiers ($10-$400)</li>
              <li><strong>Original Axanar (Kickstarter)</strong>: 22 tiers ($10-$10,000)</li>
              <li><strong>Axanar (Indiegogo)</strong>: 29 tiers ($10-$10,000)</li>
            </ul>
            <p className="mt-3 text-yellow-600 dark:text-yellow-400 font-medium">
              ⚠️ Warning: This will clear all existing reward-to-pledge links and delete current reward records for these campaigns.
            </p>
          </div>

          <Button 
            onClick={handleCreate} 
            disabled={isCreating}
            className="w-full"
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Canonical Rewards...
              </>
            ) : (
              'Create Canonical Rewards Database'
            )}
          </Button>

          {result && (
            <div className={`rounded-lg p-4 ${result.success ? 'bg-green-50 dark:bg-green-950' : 'bg-red-50 dark:bg-red-950'}`}>
              <p className="font-medium mb-2">
                {result.success ? '✓ Creation Complete' : '✗ Creation Failed'}
              </p>
              <p className="text-sm mb-2">
                {result.message}
              </p>
              
              {result.rewards_created && (
                <div className="mt-3 text-sm space-y-1">
                  <p className="font-medium">Rewards Created:</p>
                  <p className="ml-4">Prelude KS: {result.rewards_created.prelude || 0} tiers</p>
                  <p className="ml-4">Axanar KS: {result.rewards_created.axanar_ks || 0} tiers</p>
                  <p className="ml-4">Axanar IGG: {result.rewards_created.axanar_igg || 0} tiers</p>
                </div>
              )}

              {result.pledges_assigned && (
                <div className="mt-3 text-sm space-y-2">
                  <p className="font-medium">Pledges Assigned:</p>
                  <div className="ml-4 space-y-1">
                    <p>✓ By perk name: {result.pledges_assigned.by_perk_name}</p>
                    <p>✓ By amount: {result.pledges_assigned.by_amount}</p>
                    <p>⚠ No match: {result.pledges_assigned.no_match}</p>
                    <p className="font-medium mt-2">Total: {result.pledges_assigned.total}</p>
                  </div>
                  
                  {result.pledges_assigned.campaigns && (
                    <div className="mt-2 ml-4 space-y-1 text-xs">
                      <p className="font-medium">Campaign Breakdown:</p>
                      <p className="ml-2">Indiegogo: {result.pledges_assigned.campaigns.indiegogo.exact_match} exact, {result.pledges_assigned.campaigns.indiegogo.amount_match} amount, {result.pledges_assigned.campaigns.indiegogo.no_match} unmatched</p>
                      <p className="ml-2">Axanar KS: {result.pledges_assigned.campaigns.axanar_ks.exact_match} exact, {result.pledges_assigned.campaigns.axanar_ks.amount_match} amount, {result.pledges_assigned.campaigns.axanar_ks.no_match} unmatched</p>
                      <p className="ml-2">Prelude KS: {result.pledges_assigned.campaigns.prelude_ks.exact_match} exact, {result.pledges_assigned.campaigns.prelude_ks.amount_match} amount, {result.pledges_assigned.campaigns.prelude_ks.no_match} unmatched</p>
                    </div>
                  )}
                </div>
              )}

              {result.errors && result.errors.length > 0 && (
                <div className="mt-3 text-sm">
                  <p className="font-medium mb-1">Errors:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    {result.errors.map((error: string, index: number) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
