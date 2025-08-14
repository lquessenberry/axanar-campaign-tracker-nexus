import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Users, Database, AlertTriangle, CheckCircle, Merge, UserPlus, Shield } from 'lucide-react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MigrationResult {
  action: string;
  count: number;
}

interface AuthMigrationResult {
  result_status: string;
  count: number;
  details: string;
}

interface MigrationStatus {
  total_donors: number;
  linked_donors: number;
  unlinked_with_email: number;
  unlinked_no_email: number;
  migration_progress: number;
}

const DonorMigrationSection = () => {
  const [showLegacyConfirmation, setShowLegacyConfirmation] = useState(false);
  const [showAuthConfirmation, setShowAuthConfirmation] = useState(false);
  const queryClient = useQueryClient();

  // Get migration status
  const { data: migrationStatus, isLoading: statusLoading } = useQuery({
    queryKey: ['donor-migration-status'],
    queryFn: async (): Promise<MigrationStatus> => {
      const { data, error } = await supabase.rpc('get_donor_auth_migration_status');
      if (error) throw error;
      return data[0];
    },
  });

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
      queryClient.invalidateQueries({ queryKey: ['donor-migration-status'] });
    },
    onError: (error) => {
      console.error('Migration error:', error);
      toast.error(`Migration failed: ${error.message}`);
    },
  });

  const createAuthUsers = useMutation({
    mutationFn: async (): Promise<AuthMigrationResult[]> => {
      const { data, error } = await supabase.rpc('create_auth_users_for_all_donors');
      
      if (error) {
        throw new Error(error.message || 'Auth user creation failed');
      }
      
      return data;
    },
    onSuccess: (data) => {
      const created = data.find(r => r.result_status === 'Created new auth users')?.count || 0;
      const linked = data.find(r => r.result_status === 'Linked to existing users')?.count || 0;
      const errors = data.find(r => r.result_status === 'Errors encountered')?.count || 0;
      
      toast.success(
        `Auth user creation completed! Created ${created} new accounts, linked ${linked} existing users. ${errors > 0 ? `${errors} errors occurred.` : ''}`
      );
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['donors'] });
      queryClient.invalidateQueries({ queryKey: ['donor-stats'] });
      queryClient.invalidateQueries({ queryKey: ['donor-migration-status'] });
    },
    onError: (error) => {
      console.error('Auth migration error:', error);
      toast.error(`Auth user creation failed: ${error.message}`);
    },
  });

  const handleLegacyMigration = () => {
    migrateLegacyData.mutate();
    setShowLegacyConfirmation(false);
  };

  const handleAuthMigration = () => {
    createAuthUsers.mutate();
    setShowAuthConfirmation(false);
  };

  return (
    <div className="space-y-6">
      {/* Migration Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Donor Authentication Status
          </CardTitle>
          <CardDescription>
            Overview of donor authentication migration progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          {statusLoading ? (
            <div className="text-sm text-muted-foreground">Loading status...</div>
          ) : migrationStatus ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{migrationStatus.total_donors.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Donors</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{migrationStatus.linked_donors.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">With Auth Accounts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{migrationStatus.unlinked_with_email.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Need Auth Accounts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-600">{migrationStatus.migration_progress.toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">Migration Progress</div>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Legacy Data Migration */}
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
              <CheckCircle className="h-5 w-5 text-amber-500 mt-0.5" />
              <div>
                <h4 className="font-medium">Smart Email Matching</h4>
                <p className="text-sm text-muted-foreground">
                  Updates existing donors with legacy data where emails match, 
                  and creates new donor records for previously missing supporters
                </p>
              </div>
            </div>
          </div>

          {!showLegacyConfirmation ? (
            <Button 
              onClick={() => setShowLegacyConfirmation(true)}
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
                </AlertDescription>
              </Alert>
              
              <div className="flex gap-2">
                <Button 
                  onClick={handleLegacyMigration}
                  disabled={migrateLegacyData.isPending}
                  className="flex-1"
                >
                  {migrateLegacyData.isPending ? 'Migrating...' : 'Confirm Migration'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowLegacyConfirmation(false)}
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

      {/* Auth User Creation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Create Authentication Accounts
          </CardTitle>
          <CardDescription>
            Convert all donors with email addresses into authenticated users
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-medium">Secure Account Creation</h4>
                <p className="text-sm text-muted-foreground">
                  Creates authenticated user accounts for all donors with email addresses. 
                  Users will need to reset their passwords on first login.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="font-medium">Automatic Linking</h4>
                <p className="text-sm text-muted-foreground">
                  Links existing auth.users to donor records by email address, 
                  or creates new authentication accounts where needed
                </p>
              </div>
            </div>

            {migrationStatus && migrationStatus.unlinked_with_email > 0 && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <span className="font-medium text-orange-800">
                    {migrationStatus.unlinked_with_email.toLocaleString()} donors need authentication accounts
                  </span>
                </div>
              </div>
            )}
          </div>

          {!showAuthConfirmation ? (
            <Button 
              onClick={() => setShowAuthConfirmation(true)}
              disabled={createAuthUsers.isPending || (migrationStatus?.unlinked_with_email || 0) === 0}
              className="w-full"
            >
              {(migrationStatus?.unlinked_with_email || 0) === 0 
                ? 'All Donors Have Auth Accounts' 
                : 'Create Authentication Accounts'
              }
            </Button>
          ) : (
            <div className="space-y-3">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  This will create authentication accounts for {migrationStatus?.unlinked_with_email.toLocaleString()} donors 
                  with email addresses. Users will receive random secure passwords and must reset them on first login.
                  This process may take several minutes to complete.
                </AlertDescription>
              </Alert>
              
              <div className="flex gap-2">
                <Button 
                  onClick={handleAuthMigration}
                  disabled={createAuthUsers.isPending}
                  className="flex-1"
                >
                  {createAuthUsers.isPending ? 'Creating Accounts...' : 'Confirm Creation'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowAuthConfirmation(false)}
                  disabled={createAuthUsers.isPending}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {createAuthUsers.isError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Auth account creation failed. Please check the logs and try again.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DonorMigrationSection;