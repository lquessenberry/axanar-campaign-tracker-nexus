import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, Database, AlertTriangle, CheckCircle } from 'lucide-react';
import { useDonorMigration } from '@/hooks/useDonorMigration';

const DonorMigrationSection = () => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const migration = useDonorMigration();

  const handleMigration = () => {
    migration.mutate();
    setShowConfirmation(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Donor to User Migration
        </CardTitle>
        <CardDescription>
          Migrate individual donors to authenticated users and link existing accounts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Users className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <h4 className="font-medium">Create User Accounts</h4>
              <p className="text-sm text-muted-foreground">
                Creates authenticated user accounts for donors who don't have them yet
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <h4 className="font-medium">Link Existing Users</h4>
              <p className="text-sm text-muted-foreground">
                Links donors to existing user accounts with matching email addresses
              </p>
            </div>
          </div>
        </div>

        {!showConfirmation ? (
          <Button 
            onClick={() => setShowConfirmation(true)}
            disabled={migration.isPending}
            className="w-full"
          >
            Start Migration Process
          </Button>
        ) : (
          <div className="space-y-3">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This process will create user accounts for donors without them and link existing accounts. 
                This operation cannot be easily undone. Are you sure you want to proceed?
              </AlertDescription>
            </Alert>
            
            <div className="flex gap-2">
              <Button 
                onClick={handleMigration}
                disabled={migration.isPending}
                className="flex-1"
              >
                {migration.isPending ? 'Migrating...' : 'Confirm Migration'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowConfirmation(false)}
                disabled={migration.isPending}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {migration.isError && (
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