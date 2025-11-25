import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Search, User, MapPin, CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface DiagnosticResult {
  authUser: any;
  donor: any;
  hasAuthLink: boolean;
  addresses: any[];
  email: string;
}

export function AddressDiagnostics() {
  const [email, setEmail] = useState("");
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult | null>(null);
  const [loading, setLoading] = useState(false);

  const runDiagnostics = async () => {
    if (!email.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    setLoading(true);
    try {
      // Check donor record  
      const { data: donor } = await supabase
        .from('donors')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      // Check auth user via donor's auth_user_id
      let authUser = null;
      if (donor?.auth_user_id) {
        try {
          const { data: authData } = await supabase.auth.admin.getUserById(donor.auth_user_id);
          authUser = authData.user;
        } catch (e) {
          console.error("Could not fetch auth user:", e);
        }
      }

      // Check if donor has auth_user_id
      const hasAuthLink = !!donor?.auth_user_id;

      // Check addresses
      const { data: addresses } = await supabase
        .from('addresses')
        .select('*')
        .eq('donor_id', donor?.id || 'none');

      setDiagnostics({
        authUser,
        donor,
        hasAuthLink,
        addresses: addresses || [],
        email,
      });

      toast.success("Diagnostics complete");
    } catch (error: any) {
      console.error("Diagnostic error:", error);
      toast.error("Failed to run diagnostics: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Address Update Diagnostics
        </CardTitle>
        <CardDescription>
          Diagnose why users can't save addresses
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor="diag-email">User Email</Label>
            <Input
              id="diag-email"
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <Button onClick={runDiagnostics} disabled={loading}>
              {loading ? "Checking..." : "Run Diagnostics"}
            </Button>
          </div>
        </div>

        {diagnostics && (
          <div className="space-y-4 mt-6">
            <h3 className="font-semibold">Results for: {diagnostics.email}</h3>

            {/* Auth User */}
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <User className="h-5 w-5 mt-1" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">Auth User</span>
                  {diagnostics.authUser ? (
                    <Badge variant="default"><CheckCircle className="h-3 w-3 mr-1" />Found</Badge>
                  ) : (
                    <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Not Found</Badge>
                  )}
                </div>
                {diagnostics.authUser && (
                  <p className="text-xs text-muted-foreground">
                    ID: {diagnostics.authUser.id}
                  </p>
                )}
              </div>
            </div>

            {/* Donor Record */}
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <User className="h-5 w-5 mt-1" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">Donor Record</span>
                  {diagnostics.donor ? (
                    <Badge variant="default"><CheckCircle className="h-3 w-3 mr-1" />Found</Badge>
                  ) : (
                    <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Not Found</Badge>
                  )}
                </div>
                {diagnostics.donor && (
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>Donor ID: {diagnostics.donor.id}</p>
                    <p>Name: {diagnostics.donor.full_name || 'N/A'}</p>
                    <p>Auth Link: {diagnostics.donor.auth_user_id || 'MISSING'}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Auth Link Status */}
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <MapPin className="h-5 w-5 mt-1" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">Auth-Donor Link</span>
                  {diagnostics.hasAuthLink ? (
                    <Badge variant="default"><CheckCircle className="h-3 w-3 mr-1" />Linked</Badge>
                  ) : (
                    <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />NOT Linked</Badge>
                  )}
                </div>
                {!diagnostics.hasAuthLink && diagnostics.donor && (
                  <p className="text-xs text-destructive">
                    ⚠️ This is the problem! Donor record exists but isn't linked to auth user.
                  </p>
                )}
              </div>
            </div>

            {/* Addresses */}
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <MapPin className="h-5 w-5 mt-1" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">Addresses</span>
                  <Badge variant="secondary">{diagnostics.addresses?.length || 0}</Badge>
                </div>
                {diagnostics.addresses?.map((addr: any, i: number) => (
                  <div key={i} className="text-xs text-muted-foreground mt-2 p-2 bg-muted/50 rounded">
                    <p>{addr.address1}</p>
                    <p>{addr.city}, {addr.state} {addr.postal_code}</p>
                    <p>Primary: {addr.is_primary ? 'Yes' : 'No'}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Solution */}
            {!diagnostics.hasAuthLink && diagnostics.donor && (
              <Alert className="border-yellow-500/40">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Solution:</strong> The donor record needs to be linked to an auth user.
                  Contact the user to create an account or link their existing donor record.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
