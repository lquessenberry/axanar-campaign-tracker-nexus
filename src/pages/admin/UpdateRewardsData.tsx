import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export const UpdateRewardsData = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleUpdate = async () => {
    setIsUpdating(true);
    setResult(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('You must be logged in');
        setIsUpdating(false);
        return;
      }

      const response = await fetch(
        `https://vsarkftwkontkfcodbyk.supabase.co/functions/v1/update-rewards-data`,
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
        toast.success(data.message || 'Rewards updated successfully');
      } else {
        throw new Error(data.error || 'Failed to update rewards');
      }
    } catch (error) {
      console.error('Error updating rewards:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update rewards');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Update Rewards Data</CardTitle>
        <CardDescription>
          Fix reward amounts, physical item flags, and descriptions based on original campaign data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg bg-muted p-4 text-sm">
          <p className="font-medium mb-2">This will update:</p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Correct minimum pledge amounts for all rewards</li>
            <li>Mark physical items (patches, shirts, DVDs, etc.) correctly</li>
            <li>Add descriptions from original campaigns</li>
            <li>Set estimated delivery dates</li>
          </ul>
        </div>

        <Button 
          onClick={handleUpdate} 
          disabled={isUpdating}
          className="w-full"
        >
          {isUpdating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating Rewards...
            </>
          ) : (
            'Update All Rewards Data'
          )}
        </Button>

        {result && (
          <div className={`rounded-lg p-4 ${result.success ? 'bg-green-50 dark:bg-green-950' : 'bg-red-50 dark:bg-red-950'}`}>
            <p className="font-medium mb-2">
              {result.success ? '✓ Update Complete' : '✗ Update Failed'}
            </p>
            <p className="text-sm mb-2">
              Updated: {result.updated} | Failed: {result.failed}
            </p>
            {result.errors && result.errors.length > 0 && (
              <div className="mt-2 text-sm">
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
  );
};
