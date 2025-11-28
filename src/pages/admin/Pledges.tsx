import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Edit2, Save, X } from "lucide-react";

// Define proper types for pledges
interface Pledge {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  campaign_id: string;
  donor_id: string;
  campaigns?: {
    name: string;
  };
  donors?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

const Pledges = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingPledge, setEditingPledge] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState<string>('');

  const { data: pledges, isLoading } = useQuery<Pledge[]>({
    queryKey: ['admin-pledges'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pledges')
        .select(`
          *,
          campaigns:campaign_id (name),
          donors:donor_id (first_name, last_name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const updatePledgeMutation = useMutation({
    mutationFn: async ({ id, amount }: { id: string; amount: number }) => {
      const { data, error } = await supabase
        .from('pledges')
        .update({ amount })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pledges'] });
      setEditingPledge(null);
      setEditAmount('');
      toast({
        title: "Success",
        description: "Pledge amount updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update pledge amount",
        variant: "destructive",
      });
      console.error('Error updating pledge:', error);
    },
  });

  const handleEditStart = (pledgeId: string, currentAmount: number) => {
    setEditingPledge(pledgeId);
    setEditAmount(currentAmount.toString());
  };

  const handleEditSave = (pledgeId: string) => {
    const amount = parseFloat(editAmount);
    if (isNaN(amount) || amount < 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }
    updatePledgeMutation.mutate({ id: pledgeId, amount });
  };

  const handleEditCancel = () => {
    setEditingPledge(null);
    setEditAmount('');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-foreground">Loading pledges...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">All Pledges</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="text-muted-foreground">Donor</TableHead>
                  <TableHead className="text-muted-foreground">Campaign</TableHead>
                  <TableHead className="text-muted-foreground">Amount</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-muted-foreground">Date</TableHead>
                  <TableHead className="text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pledges?.map((pledge) => (
                  <TableRow key={pledge.id} className="border-border">
                    <TableCell className="text-card-foreground">
                      {pledge.donors ? `${pledge.donors.first_name} ${pledge.donors.last_name}` : 'Unknown Donor'}
                      <br />
                      <span className="text-sm text-muted-foreground">{pledge.donors?.email}</span>
                    </TableCell>
                    <TableCell className="text-card-foreground">{pledge.campaigns?.name || 'Unknown Campaign'}</TableCell>
                    <TableCell className="text-card-foreground">
                      {editingPledge === pledge.id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={editAmount}
                            onChange={(e) => setEditAmount(e.target.value)}
                            className="w-24"
                          />
                          <Button
                            size="sm"
                            onClick={() => handleEditSave(pledge.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Save className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleEditCancel}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        `$${Number(pledge.amount).toFixed(2)}`
                      )}
                    </TableCell>
                    <TableCell className="text-card-foreground">{pledge.status || 'Completed'}</TableCell>
                    <TableCell className="text-card-foreground">
                      {new Date(pledge.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {editingPledge !== pledge.id && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditStart(pledge.id, Number(pledge.amount))}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Pledges;
