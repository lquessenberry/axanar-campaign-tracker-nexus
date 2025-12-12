import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useChat } from "@/contexts/ChatContext";
import { Link2, Mail, Search, Loader2, ArrowRight, CheckCircle, AlertTriangle, MessageSquare } from "lucide-react";

export function AccountOperations() {
  const { toast } = useToast();
  const { openChat } = useChat();
  
  // Email update state
  const [searchEmail, setSearchEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [userInfo, setUserInfo] = useState<any>(null);
  const [sendConfirmation, setSendConfirmation] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Merge state
  const [sourceEmail, setSourceEmail] = useState("");
  const [targetEmail, setTargetEmail] = useState("");
  const [sourceDonor, setSourceDonor] = useState<any>(null);
  const [targetDonor, setTargetDonor] = useState<any>(null);
  const [isMerging, setIsMerging] = useState(false);

  // Link state
  const [linkEmail, setLinkEmail] = useState("");
  const [authUserId, setAuthUserId] = useState("");
  const [isLinking, setIsLinking] = useState(false);

  // Email Update Functions
  const handleSearchUser = async () => {
    if (!searchEmail.trim()) return;
    setIsSearching(true);
    setUserInfo(null);

    try {
      const { data: donors } = await supabase
        .from("donors")
        .select("id, email, full_name, first_name, last_name, auth_user_id")
        .ilike("email", searchEmail.trim())
        .limit(1);

      if (donors && donors.length > 0 && donors[0].auth_user_id) {
        setUserInfo({
          userId: donors[0].auth_user_id,
          email: donors[0].email,
          fullName: donors[0].full_name || `${donors[0].first_name || ""} ${donors[0].last_name || ""}`.trim() || "Unknown",
          donorId: donors[0].id,
        });
      } else {
        toast({ title: "Not Found", description: "No linked donor found", variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSearching(false);
    }
  };

  const handleUpdateEmail = async () => {
    if (!userInfo || !newEmail.trim()) return;
    setIsUpdating(true);

    try {
      const { data, error } = await supabase.functions.invoke("admin-update-email", {
        body: { userId: userInfo.userId, oldEmail: userInfo.email, newEmail: newEmail.trim(), userName: userInfo.fullName, sendConfirmation },
      });
      if (error) throw error;
      toast({ title: "Email Updated", description: `Updated to ${newEmail.trim()}` });
      setUserInfo(null);
      setSearchEmail("");
      setNewEmail("");
    } catch (error: any) {
      toast({ title: "Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsUpdating(false);
    }
  };

  // Merge Functions
  const searchMergeDonors = async () => {
    if (!sourceEmail.trim() || !targetEmail.trim()) return;
    setIsSearching(true);

    try {
      const { data: src } = await supabase.from('donors').select('id, email, full_name, auth_user_id, pledges(id, amount)').eq('email', sourceEmail.trim().toLowerCase()).single();
      const { data: tgt } = await supabase.from('donors').select('id, email, full_name, auth_user_id, pledges(id, amount)').eq('email', targetEmail.trim().toLowerCase()).single();

      if (!src || !tgt) throw new Error("One or both donors not found");
      
      setSourceDonor({ ...src, total: src.pledges?.reduce((s: number, p: any) => s + Number(p.amount), 0) || 0, count: src.pledges?.length || 0 });
      setTargetDonor({ ...tgt, total: tgt.pledges?.reduce((s: number, p: any) => s + Number(p.amount), 0) || 0, count: tgt.pledges?.length || 0 });
    } catch (error: any) {
      toast({ title: "Search Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsSearching(false);
    }
  };

  const handleMerge = async () => {
    if (!sourceDonor || !targetDonor || !targetDonor.auth_user_id) return;
    if (!confirm(`Move ${sourceDonor.count} pledges ($${sourceDonor.total}) from ${sourceDonor.email} to ${targetDonor.email}?`)) return;

    setIsMerging(true);
    try {
      await supabase.from('pledges').update({ donor_id: targetDonor.id }).eq('donor_id', sourceDonor.id);
      await supabase.from('merged_accounts').insert({
        source_donor_id: sourceDonor.id, source_email: sourceDonor.email,
        target_donor_id: targetDonor.id, target_auth_user_id: targetDonor.auth_user_id, target_email: targetDonor.email,
        pledges_moved: sourceDonor.count, total_amount_moved: sourceDonor.total, merge_reason: 'Admin merge'
      });
      await supabase.from('donors').update({ deleted: true, notes: `MERGED into ${targetDonor.email}` }).eq('id', sourceDonor.id);

      toast({ title: "Merged", description: `Moved ${sourceDonor.count} pledges` });
      setSourceDonor(null);
      setTargetDonor(null);
      setSourceEmail("");
      setTargetEmail("");
    } catch (error: any) {
      toast({ title: "Merge Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsMerging(false);
    }
  };

  // Link Functions
  const handleLink = async () => {
    if (!linkEmail || !authUserId) return;
    setIsLinking(true);

    try {
      const { data, error } = await supabase.rpc("admin_link_donor_account", {
        donor_email_to_link: linkEmail.toLowerCase().trim(),
        target_auth_user_id: authUserId,
      });
      if (error) throw error;
      toast({ title: "Linked", description: data?.[0]?.message || "Success" });
      setLinkEmail("");
      setAuthUserId("");
    } catch (error: any) {
      toast({ title: "Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsLinking(false);
    }
  };

  // Completed email changes (from memory)
  const completedChanges = [
    { name: "Paul Magor", old: "pmagor@gmail.com", new: "pmagor@pm.me", userId: "68fd0551-e235-44ae-9a98-66ed04abf160" },
    { name: "Michael Doehler", old: "geoffrey_pipes@yahoo.com", new: "mike.doehler@gmail.com", userId: "8ccb7218-3a61-4d31-9f4b-a9edceaad98d" },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Link2 className="h-4 w-4" />
          Account Operations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="email" className="w-full">
          <TabsList className="h-8 w-full grid grid-cols-3">
            <TabsTrigger value="email" className="text-xs h-7">Email</TabsTrigger>
            <TabsTrigger value="merge" className="text-xs h-7">Merge</TabsTrigger>
            <TabsTrigger value="link" className="text-xs h-7">Link</TabsTrigger>
          </TabsList>

          {/* Email Update Tab */}
          <TabsContent value="email" className="mt-3 space-y-3">
            <div className="flex gap-2">
              <Input placeholder="Current email..." value={searchEmail} onChange={(e) => setSearchEmail(e.target.value)} className="h-8 text-sm" />
              <Button onClick={handleSearchUser} disabled={isSearching} size="sm" className="h-8">
                {isSearching ? <Loader2 className="h-3 w-3 animate-spin" /> : <Search className="h-3 w-3" />}
              </Button>
            </div>

            {userInfo && (
              <div className="space-y-2">
                <div className="text-xs bg-muted/50 p-2 rounded">
                  <div className="font-medium">{userInfo.fullName}</div>
                  <div className="text-muted-foreground">{userInfo.email}</div>
                </div>
                <Input placeholder="New email..." value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="h-8 text-sm" />
                <div className="flex items-center gap-2">
                  <Checkbox id="confirm" checked={sendConfirmation} onCheckedChange={(c) => setSendConfirmation(c === true)} />
                  <Label htmlFor="confirm" className="text-xs">Send confirmation</Label>
                </div>
                <Button onClick={handleUpdateEmail} disabled={isUpdating || !newEmail} size="sm" className="w-full h-8">
                  {isUpdating ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Mail className="h-3 w-3 mr-1" />}
                  Update Email
                </Button>
              </div>
            )}

            {/* Completed Changes */}
            <div className="border-t pt-3 mt-3">
              <div className="text-xs font-medium mb-2">Completed</div>
              <div className="space-y-1">
                {completedChanges.map((c) => (
                  <div key={c.userId} className="flex items-center justify-between p-2 bg-green-500/10 rounded text-xs">
                    <div>
                      <span className="font-medium">{c.name}</span>
                      <div className="text-muted-foreground">{c.old} → {c.new}</div>
                    </div>
                    <Button size="sm" variant="ghost" className="h-6 px-2" onClick={() => openChat(c.userId, c.name)}>
                      <MessageSquare className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Merge Tab */}
          <TabsContent value="merge" className="mt-3 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Source (Legacy)</Label>
                <Input placeholder="old@email.com" value={sourceEmail} onChange={(e) => setSourceEmail(e.target.value)} className="h-8 text-sm mt-1" />
              </div>
              <div>
                <Label className="text-xs">Target (Current)</Label>
                <Input placeholder="new@email.com" value={targetEmail} onChange={(e) => setTargetEmail(e.target.value)} className="h-8 text-sm mt-1" />
              </div>
            </div>
            <Button onClick={searchMergeDonors} disabled={isSearching} size="sm" className="w-full h-8">
              {isSearching ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Search className="h-3 w-3 mr-1" />}
              Search Donors
            </Button>

            {sourceDonor && targetDonor && (
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="p-2 bg-muted/50 rounded">
                    <div className="font-medium truncate">{sourceDonor.email}</div>
                    <div className="text-muted-foreground">{sourceDonor.count} pledges • ${sourceDonor.total}</div>
                    <Badge variant={sourceDonor.auth_user_id ? "default" : "secondary"} className="text-[10px] h-4 mt-1">
                      {sourceDonor.auth_user_id ? "Linked" : "No Auth"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-center">
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="p-2 bg-muted/50 rounded">
                    <div className="font-medium truncate">{targetDonor.email}</div>
                    <div className="text-muted-foreground">{targetDonor.count} pledges • ${targetDonor.total}</div>
                    <Badge variant={targetDonor.auth_user_id ? "default" : "destructive"} className="text-[10px] h-4 mt-1">
                      {targetDonor.auth_user_id ? "Has Auth" : "No Auth!"}
                    </Badge>
                  </div>
                </div>

                {!targetDonor.auth_user_id && (
                  <Alert variant="destructive" className="py-2">
                    <AlertTriangle className="h-3 w-3" />
                    <AlertDescription className="text-xs">Target must have auth</AlertDescription>
                  </Alert>
                )}

                <Button onClick={handleMerge} disabled={isMerging || !targetDonor.auth_user_id} size="sm" className="w-full h-8">
                  {isMerging ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Link2 className="h-3 w-3 mr-1" />}
                  Merge Accounts
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Link Tab */}
          <TabsContent value="link" className="mt-3 space-y-3">
            <div className="space-y-2">
              <div>
                <Label className="text-xs">Donor Email</Label>
                <Input placeholder="donor@email.com" value={linkEmail} onChange={(e) => setLinkEmail(e.target.value)} className="h-8 text-sm mt-1" />
              </div>
              <div>
                <Label className="text-xs">Auth User ID</Label>
                <Input placeholder="UUID..." value={authUserId} onChange={(e) => setAuthUserId(e.target.value)} className="h-8 text-sm mt-1" />
              </div>
            </div>
            <Button onClick={handleLink} disabled={isLinking || !linkEmail || !authUserId} size="sm" className="w-full h-8">
              {isLinking ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Link2 className="h-3 w-3 mr-1" />}
              Link Accounts
            </Button>
            <div className="text-xs text-muted-foreground">
              Links a legacy donor record to an authenticated user account
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}