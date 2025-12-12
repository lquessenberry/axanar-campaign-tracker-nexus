import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Mail, AlertTriangle, CheckCircle, Search } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface UserInfo {
  userId: string;
  email: string;
  fullName: string;
  donorId?: string;
}

const AdminEmailUpdateTool = () => {
  const { toast } = useToast();
  const [searchEmail, setSearchEmail] = useState("");
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [newEmail, setNewEmail] = useState("");
  const [sendConfirmation, setSendConfirmation] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateResult, setUpdateResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSearch = async () => {
    if (!searchEmail.trim()) return;

    setIsSearching(true);
    setUserInfo(null);
    setUpdateResult(null);

    try {
      // Search in donors table for the email
      const { data: donors, error: donorError } = await supabase
        .from("donors")
        .select("id, email, full_name, first_name, last_name, auth_user_id")
        .ilike("email", searchEmail.trim())
        .limit(1);

      if (donorError) throw donorError;

      if (donors && donors.length > 0) {
        const donor = donors[0];
        if (donor.auth_user_id) {
          setUserInfo({
            userId: donor.auth_user_id,
            email: donor.email,
            fullName: donor.full_name || `${donor.first_name || ""} ${donor.last_name || ""}`.trim() || "Unknown",
            donorId: donor.id,
          });
        } else {
          toast({
            title: "No Auth Account",
            description: "This donor doesn't have a linked authentication account.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Not Found",
          description: "No donor found with that email address.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Search Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleUpdateEmail = async () => {
    if (!userInfo || !newEmail.trim()) return;

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail.trim())) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);
    setUpdateResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("admin-update-email", {
        body: {
          userId: userInfo.userId,
          oldEmail: userInfo.email,
          newEmail: newEmail.trim(),
          userName: userInfo.fullName,
          sendConfirmation,
        },
      });

      if (error) throw error;

      if (data.success) {
        setUpdateResult({
          success: true,
          message: `Email successfully updated from ${userInfo.email} to ${newEmail.trim()}`,
        });
        toast({
          title: "Email Updated",
          description: "The user's email has been successfully updated.",
        });
        // Reset form
        setUserInfo(null);
        setSearchEmail("");
        setNewEmail("");
      } else {
        throw new Error(data.error || "Unknown error occurred");
      }
    } catch (error: any) {
      setUpdateResult({
        success: false,
        message: error.message,
      });
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Email Address Update Tool
        </CardTitle>
        <CardDescription>
          Update a user's email address across auth and donor records. Use this to process email change requests.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search Section */}
        <div className="space-y-3">
          <Label>Search by Current Email</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Enter current email address..."
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={isSearching || !searchEmail.trim()}>
              {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* User Info Display */}
        {userInfo && (
          <Alert>
            <AlertDescription>
              <div className="space-y-1">
                <p><strong>User Found:</strong> {userInfo.fullName}</p>
                <p><strong>Current Email:</strong> {userInfo.email}</p>
                <p><strong>Auth User ID:</strong> <code className="text-xs bg-muted px-1 rounded">{userInfo.userId}</code></p>
                {userInfo.donorId && (
                  <p><strong>Donor ID:</strong> <code className="text-xs bg-muted px-1 rounded">{userInfo.donorId}</code></p>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Update Form */}
        {userInfo && (
          <div className="space-y-4 border-t pt-4">
            <div className="space-y-2">
              <Label htmlFor="newEmail">New Email Address</Label>
              <Input
                id="newEmail"
                type="email"
                placeholder="Enter new email address..."
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="sendConfirmation"
                checked={sendConfirmation}
                onCheckedChange={(checked) => setSendConfirmation(checked === true)}
              />
              <Label htmlFor="sendConfirmation" className="text-sm font-normal">
                Send confirmation email to new address
              </Label>
            </div>

            <Alert variant="destructive" className="bg-destructive/10">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This will update the email in both the authentication system and donor records. The user will need to use the new email to log in.
              </AlertDescription>
            </Alert>

            <Button
              onClick={handleUpdateEmail}
              disabled={isUpdating || !newEmail.trim()}
              className="w-full"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Updating Email...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Update Email Address
                </>
              )}
            </Button>
          </div>
        )}

        {/* Result Display */}
        {updateResult && (
          <Alert variant={updateResult.success ? "default" : "destructive"}>
            {updateResult.success ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertTriangle className="h-4 w-4" />
            )}
            <AlertDescription>{updateResult.message}</AlertDescription>
          </Alert>
        )}

        {/* Pending Requests Section */}
        <div className="border-t pt-4">
          <h4 className="font-medium mb-2">Known Email Change Requests</h4>
          <p className="text-sm text-muted-foreground mb-3">Click to load and process:</p>
          <div className="space-y-2 text-sm">
            <button
              onClick={() => {
                setSearchEmail("pmagor@gmail.com");
                setNewEmail("pmagor@pm.me");
                setUserInfo(null);
                setUpdateResult(null);
              }}
              className="w-full p-3 bg-muted rounded-lg text-left hover:bg-muted/80 transition-colors"
            >
              <p><strong>Paul:</strong> pmagor@gmail.com → pmagor@pm.me</p>
              <p className="text-muted-foreground text-xs">Requested Dec 2, 2025</p>
            </button>
            <button
              onClick={() => {
                setSearchEmail("geoffrey_pipes@yahoo.com");
                setNewEmail("mike.doehler@gmail.com");
                setUserInfo(null);
                setUpdateResult(null);
              }}
              className="w-full p-3 bg-muted rounded-lg text-left hover:bg-muted/80 transition-colors"
            >
              <p><strong>Michael Doehler:</strong> geoffrey_pipes@yahoo.com → mike.doehler@gmail.com</p>
              <p className="text-muted-foreground text-xs">Requested Nov 19, 2025</p>
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminEmailUpdateTool;
