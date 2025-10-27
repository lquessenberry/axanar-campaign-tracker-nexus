import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Link, Search } from "lucide-react";

export const DonorAccountLinkTool = () => {
  const [donorEmail, setDonorEmail] = useState("");
  const [authUserId, setAuthUserId] = useState("");
  const [isLinking, setIsLinking] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any>(null);
  const { toast } = useToast();

  const handleLinkAccounts = async () => {
    if (!donorEmail || !authUserId) {
      toast({
        title: "Missing Information",
        description: "Please provide both donor email and auth user ID",
        variant: "destructive",
      });
      return;
    }

    setIsLinking(true);
    console.log("🔗 Linking donor account:", donorEmail, "to auth user:", authUserId);

    try {
      // Use the admin function to link the donor account
      const { data, error } = await supabase.rpc("admin_link_donor_account", {
        donor_email_to_link: donorEmail.toLowerCase().trim(),
        target_auth_user_id: authUserId,
      });

      if (error) throw error;

      if (!data || data.length === 0) {
        toast({
          title: "Error",
          description: "Failed to link accounts - no result returned",
          variant: "destructive",
        });
        return;
      }

      const result = data[0];

      if (!result.donor_id) {
        toast({
          title: "Not Found",
          description: result.message || "No unlinked donor found with that email",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: `${result.message} - Donor ID: ${result.donor_id}`,
      });

      console.log("✅ Linked donor account:", result);

      // Clear the form
      setDonorEmail("");
      setAuthUserId("");
    } catch (error: any) {
      console.error("❌ Error linking accounts:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to link accounts",
        variant: "destructive",
      });
    } finally {
      setIsLinking(false);
    }
  };

  const handleSearchCSVs = async () => {
    if (!donorEmail) {
      toast({
        title: "Missing Email",
        description: "Please provide a donor email to search",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    console.log("🔍 Searching CSV files for:", donorEmail);

    try {
      // Search through all legacy source tables
      const searches = [
        supabase.from("legacy_src_kickstarter_axanar")
          .select("*")
          .ilike("email", `%${donorEmail}%`),
        supabase.from("legacy_src_kickstarter_prelude")
          .select("*")
          .ilike("email", `%${donorEmail}%`),
        supabase.from("legacy_src_indiegogo")
          .select("*")
          .ilike("email", `%${donorEmail}%`),
        supabase.from("legacy_src_paypal_axanar")
          .select("*")
          .ilike("email", `%${donorEmail}%`),
        supabase.from("legacy_src_paypal_prelude")
          .select("*")
          .ilike("email", `%${donorEmail}%`),
        supabase.from("legacy_src_secret_perks")
          .select("*")
          .ilike("email", `%${donorEmail}%`),
      ];

      const results = await Promise.all(searches);
      
      const compiled = {
        kickstarter_axanar: results[0].data || [],
        kickstarter_prelude: results[1].data || [],
        indiegogo: results[2].data || [],
        paypal_axanar: results[3].data || [],
        paypal_prelude: results[4].data || [],
        secret_perks: results[5].data || [],
      };

      const totalRecords = Object.values(compiled).reduce((acc, arr) => acc + arr.length, 0);

      setSearchResults(compiled);

      if (totalRecords === 0) {
        toast({
          title: "No Results",
          description: "No records found in legacy source tables",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Search Complete",
          description: `Found ${totalRecords} record(s) across all sources`,
        });
      }

      console.log("📊 Search results:", compiled);
    } catch (error: any) {
      console.error("❌ Error searching CSVs:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to search CSV data",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Link Donor Accounts</CardTitle>
          <CardDescription>
            Link a legacy donor record to an authenticated user account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="donorEmail">Donor Email</Label>
            <Input
              id="donorEmail"
              type="email"
              placeholder="donor@example.com"
              value={donorEmail}
              onChange={(e) => setDonorEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="authUserId">Auth User ID</Label>
            <Input
              id="authUserId"
              type="text"
              placeholder="UUID of authenticated user"
              value={authUserId}
              onChange={(e) => setAuthUserId(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleLinkAccounts} disabled={isLinking}>
              {isLinking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Linking...
                </>
              ) : (
                <>
                  <Link className="mr-2 h-4 w-4" />
                  Link Accounts
                </>
              )}
            </Button>

            <Button onClick={handleSearchCSVs} disabled={isSearching} variant="secondary">
              {isSearching ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Search Legacy Data
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {searchResults && (
        <Card>
          <CardHeader>
            <CardTitle>Search Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(searchResults).map(([source, records]: [string, any]) => {
                if (!records || records.length === 0) return null;
                
                return (
                  <div key={source} className="space-y-2">
                    <h3 className="font-semibold text-sm capitalize">
                      {source.replace(/_/g, " ")} ({records.length} records)
                    </h3>
                    <div className="space-y-2 ml-4">
                      {records.map((record: any, idx: number) => (
                        <div key={idx} className="text-sm p-2 bg-muted rounded">
                          <div><strong>Email:</strong> {record.email}</div>
                          <div><strong>Name:</strong> {record.backer_name || record.contributor_name || record.name || "N/A"}</div>
                          <div><strong>Amount:</strong> ${record.amount}</div>
                          <div><strong>Date:</strong> {record.pledge_date ? new Date(record.pledge_date).toLocaleDateString() : "N/A"}</div>
                          {record.perk_name && <div><strong>Perk:</strong> {record.perk_name}</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
