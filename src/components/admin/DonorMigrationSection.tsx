import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, Database, AlertTriangle, CheckCircle, Merge } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MigrationResult {
  action: string;
  count: number;
}

const DonorMigrationSection = () => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const queryClient = useQueryClient();

  const migrateLegacyData = useMutation({
    mutationFn: async (): Promise<MigrationResult[]> => {
      const { data, error } = await supabase.rpc('merge_legacy_donor_data');
      
      if (error) {
        throw new Error(error.message || 'Migration failed');
      }
      
      return data;
    },
    onSuccess: (data) => {
      const updated = data.find(r => r.action === 'Updated existing donors')?.count || 0;
      const inserted = data.find(r => r.action === 'Inserted new donors')?.count || 0;
      
      toast.success(
        `Legacy data migration completed! Updated ${updated} existing donors, inserted ${inserted} new donors.`
      );
      
      // Invalidate donor-related queries
      queryClient.invalidateQueries({ queryKey: ['donors'] });
      queryClient.invalidateQueries({ queryKey: ['donor-stats'] });
    },
    onError: (error) => {
      console.error('Migration error:', error);
      toast.error(`Migration failed: ${error.message}`);
    },
  });

  const handleMigration = () => {
    migrateLegacyData.mutate();
    setShowConfirmation(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Merge className="h-5 w-5" />
          Legacy Donor Data Migration
        </CardTitle>
        <CardDescription>
          Merge rich legacy donor data into the main donors table by email address
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Database className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <h4 className="font-medium">Enhanced Donor Profiles</h4>
              <p className="text-sm text-muted-foreground">
                Adds 20+ additional data fields from legacy_donors including donor tiers, 
                source tracking, campaign data, and contribution history
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Users className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <h4 className="font-medium">Smart Email Matching</h4>
              <p className="text-sm text-muted-foreground">
                Updates existing donors with legacy data where emails match, 
                and creates new donor records for previously missing supporters
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-amber-500 mt-0.5" />
            <div>
              <h4 className="font-medium">Preserve Existing Data</h4>
              <p className="text-sm text-muted-foreground">
                Uses COALESCE to preserve existing donor data while filling in missing fields 
                from the legacy dataset
              </p>
            </div>
          </div>
        </div>

        {!showConfirmation ? (
          <Button 
            onClick={() => setShowConfirmation(true)}
            disabled={migrateLegacyData.isPending}
            className="w-full"
          >
            Start Legacy Data Migration
          </Button>
        ) : (
          <div className="space-y-3">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This will merge data from 36,750+ legacy donors into the main donors table. 
                Existing data will be preserved while missing fields are populated from legacy data.
                This operation is reversible but may take several minutes to complete.
              </AlertDescription>
            </Alert>
            
            <div className="flex gap-2">
              <Button 
                onClick={handleMigration}
                disabled={migrateLegacyData.isPending}
                className="flex-1"
              >
                {migrateLegacyData.isPending ? 'Migrating...' : 'Confirm Migration'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowConfirmation(false)}
                disabled={migrateLegacyData.isPending}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {migrateLegacyData.isError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Migration failed. Please check the logs and try again.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default DonorMigrationSection;