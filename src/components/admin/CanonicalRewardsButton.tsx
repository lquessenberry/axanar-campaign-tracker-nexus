import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { RefreshCw, Database } from 'lucide-react';

export const CanonicalRewardsButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const runCanonicalRewards = async () => {
    setIsLoading(true);
    setResults(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-canonical-rewards', {
        body: {}
      });

      if (error) throw error;

      setResults(data);
      if (data?.success) {
        toast.success(`Created ${data.rewards_created?.prelude + data.rewards_created?.axanar_ks + data.rewards_created?.axanar_igg} rewards, assigned ${data.pledges_assigned?.total} pledges`);
      } else {
        toast.error(data?.error || 'Unknown error');
      }
    } catch (error: any) {
      console.error('Error running canonical rewards:', error);
      toast.error(error.message || 'Failed to run canonical rewards');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-4 border border-border rounded-lg bg-card">
      <div className="flex items-center gap-2">
        <Database className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Canonical Rewards Restoration</h3>
      </div>
      
      <p className="text-sm text-muted-foreground">
        This will delete all existing rewards for the 3 main campaigns (Prelude KS, Axanar KS, Axanar IGG) 
        and recreate them with proper canonical names, then auto-assign rewards to pledges.
      </p>

      <Button onClick={runCanonicalRewards} disabled={isLoading} variant="destructive">
        {isLoading ? (
          <>
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            Running...
          </>
        ) : (
          <>
            <Database className="h-4 w-4 mr-2" />
            Run Canonical Rewards Restoration
          </>
        )}
      </Button>

      {results && (
        <div className="mt-4 p-4 bg-muted rounded-lg text-sm">
          <h4 className="font-medium mb-2">Results:</h4>
          <pre className="whitespace-pre-wrap overflow-auto max-h-96">
            {JSON.stringify(results, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
