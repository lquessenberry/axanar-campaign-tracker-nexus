import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, DollarSign, Users } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";

interface UnlinkedDonor {
  id: string;
  email: string;
  full_name: string | null;
  total_pledged: number;
  pledge_count: number;
}

export const UnlinkedDonorInviteTool = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDonors, setSelectedDonors] = useState<Set<string>>(new Set());
  const [minPledgeAmount, setMinPledgeAmount] = useState<number>(0);

  // Fetch unlinked donors
  const { data: unlinkedDonors, isLoading } = useQuery({
    queryKey: ['unlinked-donors', minPledgeAmount],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_unlinked_donors_for_invitation', {
        min_pledge_amount: minPledgeAmount
      }) as { data: UnlinkedDonor[] | null; error: any };

      if (error) throw error;
      return data || [];
    }
  });

  // Send invitation mutation
  const sendInvitations = useMutation({
    mutationFn: async (donorIds: string[]) => {
      const { data, error } = await supabase.functions.invoke('send-donor-invitations', {
        body: { donor_ids: donorIds }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "Invitations Sent",
        description: `Successfully sent ${data.sent_count} invitation emails.`,
      });
      setSelectedDonors(new Set());
      queryClient.invalidateQueries({ queryKey: ['unlinked-donors'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Send Invitations",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSelectAll = () => {
    if (!unlinkedDonors) return;
    if (selectedDonors.size === unlinkedDonors.length) {
      setSelectedDonors(new Set());
    } else {
      setSelectedDonors(new Set(unlinkedDonors.map(d => d.id)));
    }
  };

  const handleSelectDonor = (donorId: string) => {
    const newSelected = new Set(selectedDonors);
    if (newSelected.has(donorId)) {
      newSelected.delete(donorId);
    } else {
      newSelected.add(donorId);
    }
    setSelectedDonors(newSelected);
  };

  const handleSendInvitations = () => {
    if (selectedDonors.size === 0) {
      toast({
        title: "No Donors Selected",
        description: "Please select at least one donor to invite.",
        variant: "destructive",
      });
      return;
    }

    sendInvitations.mutate(Array.from(selectedDonors));
  };

  const totalPledgedSelected = unlinkedDonors
    ?.filter(d => selectedDonors.has(d.id))
    .reduce((sum, d) => sum + d.total_pledged, 0) || 0;

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Unlinked Donor Invitations</h2>
          <p className="text-muted-foreground">
            Invite donors to create accounts so they can manage their addresses and perks.
          </p>
        </div>

        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">
              Minimum Pledge Amount ($)
            </label>
            <Input
              type="number"
              value={minPledgeAmount}
              onChange={(e) => setMinPledgeAmount(Number(e.target.value))}
              placeholder="0"
              min="0"
            />
          </div>
          <Button
            onClick={handleSendInvitations}
            disabled={selectedDonors.size === 0 || sendInvitations.isPending}
          >
            {sendInvitations.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Mail className="mr-2 h-4 w-4" />
            Send Invitations ({selectedDonors.size})
          </Button>
        </div>

        {unlinkedDonors && unlinkedDonors.length > 0 && (
          <>
            <div className="grid grid-cols-3 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">Total Unlinked</span>
                </div>
                <div className="text-2xl font-bold">{unlinkedDonors.length}</div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-sm">Total Value</span>
                </div>
                <div className="text-2xl font-bold">
                  ${unlinkedDonors.reduce((sum, d) => sum + d.total_pledged, 0).toLocaleString()}
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-sm">Selected Value</span>
                </div>
                <div className="text-2xl font-bold">
                  ${totalPledgedSelected.toLocaleString()}
                </div>
              </Card>
            </div>

            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedDonors.size === unlinkedDonors.length}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-right">Pledges</TableHead>
                    <TableHead className="text-right">Total Pledged</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {unlinkedDonors.map((donor) => (
                    <TableRow key={donor.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedDonors.has(donor.id)}
                          onCheckedChange={() => handleSelectDonor(donor.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {donor.full_name || <span className="text-muted-foreground">No name</span>}
                      </TableCell>
                      <TableCell>{donor.email}</TableCell>
                      <TableCell className="text-right">{donor.pledge_count}</TableCell>
                      <TableCell className="text-right font-medium">
                        ${donor.total_pledged.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}

        {unlinkedDonors && unlinkedDonors.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No unlinked donors found with the current filter.
          </div>
        )}
      </div>
    </Card>
  );
};
