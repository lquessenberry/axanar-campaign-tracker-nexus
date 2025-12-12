import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Search, CheckCircle, XCircle, Loader2, MapPin, User, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface DiagnosticResult {
  email: string;
  authUser: { id: string; email: string; created_at: string } | null;
  donor: { id: string; email: string; auth_user_id: string | null; full_name: string | null } | null;
  addresses: Array<{ id: string; address1: string; city: string; state: string; is_primary: boolean; created_at: string }>;
  isLinked: boolean;
  issues: string[];
}

export function UserDiagnostics() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const [selectedDonorId, setSelectedDonorId] = useState<string | null>(null);

  // Diagnostic logs for selected donor
  const { data: diagnosticLogs } = useQuery({
    queryKey: ['diagnostic-logs', selectedDonorId],
    queryFn: async () => {
      if (!selectedDonorId) return [];
      const { data } = await supabase
        .from('address_update_diagnostics')
        .select('*')
        .eq('donor_id', selectedDonorId)
        .order('created_at', { ascending: false })
        .limit(10);
      return data || [];
    },
    enabled: !!selectedDonorId,
  });

  // Change history for selected donor
  const { data: changeLog } = useQuery({
    queryKey: ['change-log', selectedDonorId],
    queryFn: async () => {
      if (!selectedDonorId) return [];
      const { data } = await supabase
        .from('address_change_log')
        .select('*')
        .eq('donor_id', selectedDonorId)
        .order('created_at', { ascending: false })
        .limit(10);
      return data || [];
    },
    enabled: !!selectedDonorId,
  });

  const runDiagnostics = async () => {
    if (!email.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const normalizedEmail = email.toLowerCase().trim();

      // Check auth user
      const { data: authData } = await supabase.auth.admin.listUsers();
      const users = authData?.users || [];
      const foundAuthUser = users.find((u: any) => u.email?.toLowerCase() === normalizedEmail);

      // Check donor
      const { data: donor } = await supabase
        .from('donors')
        .select('id, email, auth_user_id, full_name')
        .ilike('email', normalizedEmail)
        .maybeSingle();

      // Check addresses
      let addresses: any[] = [];
      if (donor) {
        const { data: addressData } = await supabase
          .from('addresses')
          .select('id, address1, city, state, is_primary, created_at')
          .eq('donor_id', donor.id)
          .order('created_at', { ascending: false });
        addresses = addressData || [];
        setSelectedDonorId(donor.id);
      }

      // Analyze issues
      const issues: string[] = [];
      if (!foundAuthUser) issues.push('No authentication account');
      if (!donor) issues.push('No donor record');
      if (donor && !donor.auth_user_id) issues.push('Donor not linked to auth');
      if (donor && foundAuthUser && donor.auth_user_id !== foundAuthUser.id) issues.push('Auth mismatch');

      setResult({
        email: normalizedEmail,
        authUser: foundAuthUser ? { id: foundAuthUser.id, email: foundAuthUser.email || '', created_at: foundAuthUser.created_at } : null,
        donor: donor ? { id: donor.id, email: donor.email, auth_user_id: donor.auth_user_id, full_name: donor.full_name } : null,
        addresses,
        isLinked: !!(donor?.auth_user_id && foundAuthUser),
        issues,
      });

      toast.success('Diagnostic complete');
    } catch (error: any) {
      toast.error('Failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const StatusBadge = ({ ok, label }: { ok: boolean; label: string }) => (
    <Badge variant={ok ? "default" : "destructive"} className="gap-1 text-xs">
      {ok ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
      {label}
    </Badge>
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Search className="h-4 w-4" />
          User Diagnostics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="flex gap-2">
          <Input
            placeholder="Enter email..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && runDiagnostics()}
            className="h-9"
          />
          <Button onClick={runDiagnostics} disabled={loading} size="sm">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-3">
            {/* Status Summary */}
            <div className="flex flex-wrap gap-2">
              <StatusBadge ok={!!result.authUser} label="Auth" />
              <StatusBadge ok={!!result.donor} label="Donor" />
              <StatusBadge ok={result.isLinked} label="Linked" />
              <StatusBadge ok={result.addresses.length > 0} label={`${result.addresses.length} Address`} />
            </div>

            {/* Issues */}
            {result.issues.length > 0 && (
              <div className="text-xs text-destructive bg-destructive/10 p-2 rounded">
                {result.issues.join(' • ')}
              </div>
            )}

            {/* Tabs for details */}
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="h-8">
                <TabsTrigger value="info" className="text-xs h-7">Info</TabsTrigger>
                <TabsTrigger value="addresses" className="text-xs h-7">Addresses</TabsTrigger>
                <TabsTrigger value="logs" className="text-xs h-7">Logs</TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="mt-2 space-y-2">
                {/* Auth Info */}
                <div className="flex items-start gap-2 p-2 bg-muted/50 rounded text-xs">
                  <User className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <div className="font-medium">Auth User</div>
                    {result.authUser ? (
                      <div className="text-muted-foreground truncate">{result.authUser.id}</div>
                    ) : (
                      <div className="text-muted-foreground">Not found</div>
                    )}
                  </div>
                </div>

                {/* Donor Info */}
                <div className="flex items-start gap-2 p-2 bg-muted/50 rounded text-xs">
                  <User className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <div className="font-medium">Donor: {result.donor?.full_name || 'N/A'}</div>
                    {result.donor ? (
                      <>
                        <div className="text-muted-foreground truncate">ID: {result.donor.id}</div>
                        <div className="text-muted-foreground">
                          Auth Link: {result.donor.auth_user_id ? '✓' : '✗ MISSING'}
                        </div>
                      </>
                    ) : (
                      <div className="text-muted-foreground">Not found</div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="addresses" className="mt-2">
                {result.addresses.length > 0 ? (
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {result.addresses.map((addr) => (
                      <div key={addr.id} className="flex items-start gap-2 p-2 bg-muted/50 rounded text-xs">
                        <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                        <div>
                          <div>{addr.address1}</div>
                          <div className="text-muted-foreground">{addr.city}, {addr.state}</div>
                          {addr.is_primary && <Badge variant="outline" className="text-[10px] h-4 mt-1">Primary</Badge>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground p-2">No addresses</div>
                )}
              </TabsContent>

              <TabsContent value="logs" className="mt-2">
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {diagnosticLogs && diagnosticLogs.length > 0 ? (
                    diagnosticLogs.map((log: any) => (
                      <div key={log.id} className="flex items-start gap-2 p-2 bg-muted/50 rounded text-xs">
                        <Clock className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                        <div>
                          <div className="flex gap-2">
                            <Badge variant={log.status === 'error' ? 'destructive' : 'secondary'} className="text-[10px] h-4">
                              {log.attempt_type}
                            </Badge>
                            <span className="text-muted-foreground">
                              {new Date(log.created_at).toLocaleString()}
                            </span>
                          </div>
                          {log.error_message && (
                            <div className="text-destructive mt-1">{log.error_message}</div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-muted-foreground p-2">No diagnostic logs</div>
                  )}

                  {changeLog && changeLog.length > 0 && (
                    <>
                      <div className="text-xs font-medium mt-3 mb-1">Change History</div>
                      {changeLog.map((log: any) => (
                        <div key={log.id} className="flex items-start gap-2 p-2 bg-muted/50 rounded text-xs">
                          <Clock className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                          <div>
                            <Badge variant="outline" className="text-[10px] h-4">{log.action}</Badge>
                            <span className="text-muted-foreground ml-2">
                              {log.created_at && new Date(log.created_at).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </CardContent>
    </Card>
  );
}