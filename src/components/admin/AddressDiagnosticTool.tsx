import React, { useState } from 'react';
import { DaystromCard } from '@/components/ui/daystrom-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Search, CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react';

interface DiagnosticResult {
  email: string;
  authUser: {
    id: string | null;
    email: string | null;
    created_at: string | null;
  } | null;
  donor: {
    id: string | null;
    email: string | null;
    auth_user_id: string | null;
    full_name: string | null;
  } | null;
  addresses: Array<{
    id: string;
    address1: string;
    city: string;
    state: string;
    is_primary: boolean;
    created_at: string;
  }>;
  isLinked: boolean;
  canSaveAddress: boolean;
  issues: string[];
  recommendations: string[];
}

export const AddressDiagnosticTool: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiagnosticResult | null>(null);

  const runDiagnostics = async () => {
    if (!email.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const normalizedEmail = email.toLowerCase().trim();

      // Check auth.users via admin API
      const { data: authData } = await supabase.auth.admin.listUsers();
      const users = authData?.users || [];
      const foundAuthUser = users.find(u => u.email?.toLowerCase() === normalizedEmail);

      // Check donors table
      const { data: donor, error: donorError } = await supabase
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
      }

      // Analyze results
      const issues: string[] = [];
      const recommendations: string[] = [];
      
      const isLinked = !!(donor?.auth_user_id && foundAuthUser);
      const canSaveAddress = isLinked;

      if (!foundAuthUser) {
        issues.push('No authentication account found for this email');
        recommendations.push('User needs to create an account or use password recovery');
      }

      if (!donor) {
        issues.push('No donor record found for this email');
        recommendations.push('User may not have any historical pledges or contributions');
      }

      if (donor && !donor.auth_user_id) {
        issues.push('Donor record exists but is not linked to authentication account');
        recommendations.push('Use the DonorAccountLinkTool to link this donor to their auth account');
      }

      if (donor && foundAuthUser && donor.auth_user_id !== foundAuthUser.id) {
        issues.push('Donor is linked to a different auth account than expected');
        recommendations.push('Verify the correct account and update linkage if needed');
      }

      if (addresses.length === 0 && donor) {
        issues.push('No addresses saved for this donor');
        recommendations.push('User should be able to add an address once linkage is confirmed');
      }

      if (issues.length === 0) {
        recommendations.push('No issues detected - address system should work correctly');
      }

      setResult({
        email: normalizedEmail,
        authUser: foundAuthUser ? {
          id: foundAuthUser.id,
          email: foundAuthUser.email || null,
          created_at: foundAuthUser.created_at,
        } : null,
        donor: donor ? {
          id: donor.id,
          email: donor.email,
          auth_user_id: donor.auth_user_id,
          full_name: donor.full_name,
        } : null,
        addresses,
        isLinked,
        canSaveAddress,
        issues,
        recommendations,
      });

      toast.success('Diagnostic complete');
    } catch (error: any) {
      console.error('Diagnostic error:', error);
      toast.error('Failed to run diagnostics: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DaystromCard className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold mb-2">Address Save Diagnostics</h3>
          <p className="text-sm text-muted-foreground">
            Check if a user can save their shipping address and diagnose linkage issues
          </p>
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <Label htmlFor="diagnostic-email">User Email Address</Label>
            <Input
              id="diagnostic-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="mt-1.5"
              onKeyDown={(e) => e.key === 'Enter' && runDiagnostics()}
            />
          </div>
          <div className="flex items-end">
            <Button onClick={runDiagnostics} disabled={loading} className="gap-2">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Run Diagnostics
                </>
              )}
            </Button>
          </div>
        </div>

        {result && (
          <div className="space-y-4 border-t border-border pt-4">
            {/* Overall Status */}
            <Alert className={result.canSaveAddress ? 'border-green-500/20 bg-green-500/5' : 'border-destructive/20 bg-destructive/5'}>
              <AlertDescription className="flex items-center gap-2">
                {result.canSaveAddress ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>User CAN save addresses - system is working correctly</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 text-destructive" />
                    <span>User CANNOT save addresses - linkage issue detected</span>
                  </>
                )}
              </AlertDescription>
            </Alert>

            {/* Auth User Status */}
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                Authentication Account
                {result.authUser ? (
                  <Badge variant="default" className="gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Found
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="gap-1">
                    <XCircle className="h-3 w-3" />
                    Not Found
                  </Badge>
                )}
              </h4>
              {result.authUser ? (
                <div className="text-sm space-y-1 bg-muted/50 p-3 rounded-lg">
                  <p><strong>ID:</strong> {result.authUser.id}</p>
                  <p><strong>Email:</strong> {result.authUser.email}</p>
                  <p><strong>Created:</strong> {new Date(result.authUser.created_at || '').toLocaleString()}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No authentication account exists for this email</p>
              )}
            </div>

            {/* Donor Record Status */}
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                Donor Record
                {result.donor ? (
                  <Badge variant="default" className="gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Found
                  </Badge>
                ) : (
                  <Badge variant="outline" className="gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Not Found
                  </Badge>
                )}
              </h4>
              {result.donor ? (
                <div className="text-sm space-y-1 bg-muted/50 p-3 rounded-lg">
                  <p><strong>ID:</strong> {result.donor.id}</p>
                  <p><strong>Email:</strong> {result.donor.email}</p>
                  <p><strong>Name:</strong> {result.donor.full_name || 'Not set'}</p>
                  <p className="flex items-center gap-2">
                    <strong>Linked to Auth:</strong>
                    {result.donor.auth_user_id ? (
                      <Badge variant="default" className="gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Yes ({result.donor.auth_user_id})
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="gap-1">
                        <XCircle className="h-3 w-3" />
                        No - THIS IS THE PROBLEM
                      </Badge>
                    )}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No donor record found - user may not have historical pledges</p>
              )}
            </div>

            {/* Addresses */}
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                Saved Addresses
                <Badge variant="outline">{result.addresses.length}</Badge>
              </h4>
              {result.addresses.length > 0 ? (
                <div className="space-y-2">
                  {result.addresses.map((addr) => (
                    <div key={addr.id} className="text-sm bg-muted/50 p-3 rounded-lg">
                      <p className="font-medium">{addr.address1}</p>
                      <p className="text-muted-foreground">{addr.city}, {addr.state}</p>
                      <div className="flex gap-2 mt-1">
                        {addr.is_primary && <Badge variant="default">Primary</Badge>}
                        <span className="text-xs text-muted-foreground">
                          Saved: {new Date(addr.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No addresses saved yet</p>
              )}
            </div>

            {/* Issues */}
            {result.issues.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 text-destructive flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Issues Detected
                </h4>
                <ul className="space-y-1">
                  {result.issues.map((issue, idx) => (
                    <li key={idx} className="text-sm text-destructive bg-destructive/5 p-2 rounded">
                      • {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            {result.recommendations.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Recommendations
                </h4>
                <ul className="space-y-1">
                  {result.recommendations.map((rec, idx) => (
                    <li key={idx} className="text-sm bg-muted/50 p-2 rounded">
                      • {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </DaystromCard>
  );
};
