import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Loader2, CheckCircle, Wrench } from 'lucide-react';

interface FixResult {
  success: boolean;
  pledgesUpdated: number;
  rewardsUpdated: number;
  errors: string[];
}

export const QuickPledgeFix = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<FixResult | null>(null);

  const runDavidHernandezFix = async () => {
    setIsRunning(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('admin-fix-pledge-rewards', {
        body: {
          pledgeUpdates: [
            {
              pledgeId: '8b9193a0-247e-4dc0-931e-ac8178c7788c',
              rewardId: '15ad97c0-d491-405d-b7c9-96f8649b8672' // Be an Associate Producer
            },
            {
              pledgeId: '8eed8111-5781-4ce1-abb3-a64cd3d61b06',
              rewardId: 'e1a799eb-7a66-491b-831e-53e8cb28f44d' // Featured Extra
            }
          ],
          rewardUpdates: [
            {
              rewardId: 'e1a799eb-7a66-491b-831e-53e8cb28f44d',
              is_physical: true,
              requires_shipping: true
            }
          ]
        }
      });

      if (error) throw error;

      setResult(data as FixResult);
      
      if (data?.success) {
        toast({
          title: 'Fix Applied Successfully',
          description: `Updated ${data.pledgesUpdated} pledges and ${data.rewardsUpdated} rewards.`
        });
      }
    } catch (err: any) {
      console.error('Fix error:', err);
      toast({
        title: 'Fix Failed',
        description: err.message || 'Could not apply fix',
        variant: 'destructive'
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="p-4 border border-border rounded-lg bg-card">
      <h3 className="font-semibold mb-2 flex items-center gap-2">
        <Wrench className="h-4 w-4" />
        David Hernandez Reward Fix
      </h3>
      <p className="text-sm text-muted-foreground mb-4">
        Updates $10k pledge → "Be an Associate Producer" and $5k pledge → "Featured Extra"
      </p>
      
      <Button 
        onClick={runDavidHernandezFix} 
        disabled={isRunning || result?.success}
        variant={result?.success ? 'outline' : 'default'}
      >
        {isRunning ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Applying Fix...
          </>
        ) : result?.success ? (
          <>
            <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
            Fix Applied
          </>
        ) : (
          'Apply Fix'
        )}
      </Button>

      {result && (
        <div className="mt-4 text-sm">
          <p>Pledges updated: {result.pledgesUpdated}</p>
          <p>Rewards updated: {result.rewardsUpdated}</p>
          {result.errors?.length > 0 && (
            <p className="text-destructive">Errors: {result.errors.join(', ')}</p>
          )}
        </div>
      )}
    </div>
  );
};
