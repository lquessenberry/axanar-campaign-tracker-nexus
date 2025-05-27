import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { safeFrom } from '@/types/database';

// Create a simplified typed wrapper for RPC calls to bypass TypeScript limitations
// for debugging functions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const safeRpc = (fn: string, args?: any): any => {
  return supabase.rpc(fn, args);
};


// A small debugging utility to help find user data
export const DebugPanel: React.FC = () => {
  const { user, profile, donorProfile } = useAuth();
  const [debugData, setDebugData] = React.useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [expanded, setExpanded] = React.useState(false);

  // Check for donor data across multiple fields
  const checkDonorData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Check profiles table
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // Check donors table with multiple potential ID columns - use raw query for tables that might not exist
      const { data: donorsData } = await safeRpc('query_if_table_exists', { 
        table_name: 'donors',
        query_text: `SELECT * FROM donors WHERE email = '${user.email}' OR user_id = '${user.id}'` 
      });

      // Check donors table using safeFrom helper to avoid type errors
      const { data: donorProfilesData } = await safeFrom(supabase, 'donors')
        .select('*')
        .eq('user_id', user.id);

      // Check pledges with email (case insensitive)
      const { data: pledgesByEmail } = await safeRpc(
        'search_pledges_by_email',
        { email_param: user.email }
      );

      // Get all tables to see what's available
      const tables = await listAllTables();

      setDebugData({
        email: user.email,
        userId: user.id,
        profileData,
        donorsData,
        donorProfilesData,
        pledgesByEmail,
        availableTables: tables,
      });
    } catch (error) {
      console.error('Debug error:', error);
    } finally {
      setLoading(false);
    }
  };

  // List all tables in the database
  const listAllTables = async () => {
    try {
      const { data } = await safeRpc('get_all_tables');
      return data || [];
    } catch (error) {
      console.error('Error listing tables:', error);
      return [];
    }
  };

  if (!expanded) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button 
          onClick={() => setExpanded(true)}
          className="bg-gray-800 hover:bg-gray-700 text-white"
        >
          Debug Data
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-[80vh] overflow-auto">
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold">Debug Panel</h3>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setExpanded(false)}
            >
              Close
            </Button>
          </div>
          
          <div className="space-y-2 text-xs">
            <div><strong>Email:</strong> {user?.email || 'Not logged in'}</div>
            <div><strong>User ID:</strong> {user?.id || 'N/A'}</div>
            <div><strong>Profile:</strong> {profile ? 'Found' : 'Not found'}</div>
            <div><strong>Donor Profile:</strong> {donorProfile ? 'Found' : 'Not found'}</div>
          </div>
          
          <Button 
            onClick={checkDonorData}
            className="mt-4 w-full bg-blue-600 hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? 'Checking...' : 'Check Donor Data'}
          </Button>
          
          {debugData && (
            <div className="mt-4 text-xs border-t pt-4 space-y-3">
              <h4 className="font-semibold">Data Found:</h4>
              
              <div>
                <strong>Profile:</strong> 
                {debugData.profileData ? 'Found' : 'Not found'}
              </div>
              
              <div>
                <strong>Donors:</strong> 
                {Array.isArray(debugData.donorsData) && debugData.donorsData.length ? `${debugData.donorsData.length} found` : 'None found'}
              </div>
              
              <div>
                <strong>Donor Profiles:</strong> 
                {Array.isArray(debugData.donorProfilesData) && debugData.donorProfilesData.length ? `${debugData.donorProfilesData.length} found` : 'None found'}
              </div>
              
              <div>
                <strong>Pledges by Email:</strong> 
                {Array.isArray(debugData.pledgesByEmail) && debugData.pledgesByEmail.length ? `${debugData.pledgesByEmail.length} found` : 'None found'}
              </div>
              
              <div>
                <strong>Available Tables:</strong>
                <div className="max-h-32 overflow-y-auto mt-1">
                  {Array.isArray(debugData.availableTables) ? 
                    debugData.availableTables.map((table: string) => (
                      <div key={table} className="text-xs">{table}</div>
                    )) : 'None found'}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DebugPanel;
