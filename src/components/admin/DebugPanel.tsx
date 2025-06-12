
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const DebugPanel = () => {
  const { user } = useAuth();
  const [debugInfo, setDebugInfo] = useState<string>("");

  const debugQuery = async () => {
    try {
      console.log('Starting debug query...');
      
      // Test the new security definer function
      const { data: functionTest, error: functionError } = await supabase
        .rpc('check_user_is_super_admin_safe', { user_uuid: user?.id });
      
      console.log('Security function test:', { functionTest, functionError });
      
      // Test the new get_admin_users function
      const { data: adminUsers, error: adminError } = await supabase
        .rpc('get_admin_users');
      
      console.log('Get admin users result:', { adminUsers, adminError });
      
      setDebugInfo(`
        Function test: ${functionError ? `Error: ${functionError.message}` : `Result: ${functionTest}`}
        Admin users: ${adminError ? `Error: ${adminError.message}` : `Success: Found ${Array.isArray(adminUsers) ? adminUsers.length : 0} admins`}
        Current user ID: ${user?.id}
      `);
      
    } catch (error) {
      console.error('Debug query failed:', error);
      setDebugInfo(`Debug failed: ${error}`);
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-card-foreground">Debug Information</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={debugQuery} className="mb-4">
          Run Debug Query
        </Button>
        {debugInfo && (
          <pre className="bg-muted p-4 rounded text-sm whitespace-pre-wrap">
            {debugInfo}
          </pre>
        )}
      </CardContent>
    </Card>
  );
};

export default DebugPanel;
