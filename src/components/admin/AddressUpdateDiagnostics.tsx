/**
 * Admin Address Update Diagnostics Tool
 * Troubleshoots and diagnoses address update failures
 */

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Search, AlertCircle, CheckCircle, XCircle, Clock } from "lucide-react";

export function AddressUpdateDiagnostics() {
  const [searchEmail, setSearchEmail] = useState("");
  const [selectedDonorId, setSelectedDonorId] = useState<string | null>(null);

  // Search for donor by email
  const { data: searchResults, isLoading: searching } = useQuery({
    queryKey: ['donor-search', searchEmail],
    queryFn: async () => {
      if (!searchEmail.trim()) return [];
      
      const { data, error } = await supabase
        .from('donors')
        .select('id, email, full_name, auth_user_id')
        .ilike('email', `%${searchEmail}%`)
        .limit(10);
      
      if (error) throw error;
      return data;
    },
    enabled: searchEmail.length > 2,
  });

  // Get diagnostic data for selected donor
  const { data: diagnostics } = useQuery({
    queryKey: ['address-diagnostics', selectedDonorId],
    queryFn: async () => {
      if (!selectedDonorId) return null;
      
      const { data, error } = await supabase
        .from('address_update_diagnostics')
        .select('*')
        .eq('donor_id', selectedDonorId)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedDonorId,
  });

  // Get current address for selected donor
  const { data: currentAddress } = useQuery({
    queryKey: ['donor-address', selectedDonorId],
    queryFn: async () => {
      if (!selectedDonorId) return null;
      
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('donor_id', selectedDonorId)
        .eq('is_primary', true)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedDonorId,
  });

  // Get address change log
  const { data: changeLog } = useQuery({
    queryKey: ['address-change-log', selectedDonorId],
    queryFn: async () => {
      if (!selectedDonorId) return [];
      
      const { data, error } = await supabase
        .from('address_change_log')
        .select('*')
        .eq('donor_id', selectedDonorId)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedDonorId,
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Address Update Diagnostics</CardTitle>
          <CardDescription>
            Troubleshoot address update failures and diagnose user issues
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by email address..."
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Search Results */}
          {searching && <p className="text-sm text-muted-foreground">Searching...</p>}
          
          {searchResults && searchResults.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Found {searchResults.length} donor(s)</p>
              {searchResults.map((donor) => (
                <Button
                  key={donor.id}
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setSelectedDonorId(donor.id)}
                >
                  <div className="flex flex-col items-start">
                    <span>{donor.email}</span>
                    <span className="text-xs text-muted-foreground">
                      {donor.full_name || 'No name'} • {donor.auth_user_id ? 'Linked' : 'Not linked'}
                    </span>
                  </div>
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diagnostics Results */}
      {selectedDonorId && (
        <div className="space-y-6">
          {/* Current Address Status */}
          <Card>
            <CardHeader>
              <CardTitle>Current Address</CardTitle>
            </CardHeader>
            <CardContent>
              {currentAddress ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-muted-foreground">Address 1:</span>
                    <span>{currentAddress.address1}</span>
                    
                    <span className="text-muted-foreground">City:</span>
                    <span>{currentAddress.city}</span>
                    
                    <span className="text-muted-foreground">State:</span>
                    <span>{currentAddress.state}</span>
                    
                    <span className="text-muted-foreground">Postal Code:</span>
                    <span>{currentAddress.postal_code}</span>
                    
                    <span className="text-muted-foreground">Country:</span>
                    <span>{currentAddress.country}</span>
                    
                    <span className="text-muted-foreground">Created:</span>
                    <span>
                      {currentAddress.created_at 
                        ? new Date(currentAddress.created_at).toLocaleString()
                        : 'NULL (legacy import)'}
                    </span>
                    
                    <span className="text-muted-foreground">Updated:</span>
                    <span>
                      {currentAddress.updated_at 
                        ? new Date(currentAddress.updated_at).toLocaleString()
                        : 'NULL (never updated)'}
                    </span>
                  </div>
                  
                  {(!currentAddress.created_at || !currentAddress.updated_at) && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Legacy address detected with NULL timestamps. This has been automatically fixed.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No address on file</p>
              )}
            </CardContent>
          </Card>

          {/* Diagnostic Attempts */}
          <Card>
            <CardHeader>
              <CardTitle>Update Attempts ({diagnostics?.length || 0})</CardTitle>
              <CardDescription>Recent address update diagnostic logs</CardDescription>
            </CardHeader>
            <CardContent>
              {diagnostics && diagnostics.length > 0 ? (
                <div className="space-y-3">
                  {diagnostics.map((diag) => (
                    <div key={diag.id} className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(diag.status)}
                          <Badge variant={diag.status === 'error' ? 'destructive' : 'default'}>
                            {diag.attempt_type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(diag.created_at).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      
                      {diag.error_message && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription className="text-xs">
                            {diag.error_message}
                          </AlertDescription>
                        </Alert>
                      )}
                      
                      {diag.metadata && (
                        <details className="text-xs">
                          <summary className="cursor-pointer text-muted-foreground">
                            View metadata
                          </summary>
                          <pre className="mt-2 p-2 bg-muted rounded text-[10px] overflow-x-auto">
                            {JSON.stringify(diag.metadata, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No diagnostic data available</p>
              )}
            </CardContent>
          </Card>

          {/* Change Log */}
          <Card>
            <CardHeader>
              <CardTitle>Address Change History ({changeLog?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              {changeLog && changeLog.length > 0 ? (
                <div className="space-y-2">
                  {changeLog.map((log) => (
                    <div key={log.id} className="border-l-2 border-primary pl-3 py-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Badge>{log.action}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {log.created_at && new Date(log.created_at).toLocaleString()}
                        </span>
                      </div>
                      {log.changed_fields && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Changed: {log.changed_fields.join(', ')}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No change history</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
