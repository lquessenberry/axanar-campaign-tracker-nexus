
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Edit2, Save, X } from "lucide-react";
import { Link } from "react-router-dom";

const AdminPledges = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingPledge, setEditingPledge] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState<string>('');

  const { data: pledges, isLoading } = useQuery({
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
      return data;
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
      <div className="min-h-screen bg-axanar-dark flex items-center justify-center">
        <div className="text-white">Loading pledges...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-axanar-dark text-white">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/admin" className="inline-flex items-center text-axanar-teal hover:text-axanar-teal/80 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin Dashboard
          </Link>
          <h1 className="text-4xl font-bold mb-4">Manage Pledges</h1>
          <p className="text-axanar-silver">View and edit campaign pledges</p>
        </div>

        <Card className="bg-axanar-light border-axanar-silver/20">
          <CardHeader>
            <CardTitle className="text-white">All Pledges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-axanar-silver/20">
                    <TableHead className="text-axanar-silver">Donor</TableHead>
                    <TableHead className="text-axanar-silver">Campaign</TableHead>
                    <TableHead className="text-axanar-silver">Amount</TableHead>
                    <TableHead className="text-axanar-silver">Status</TableHead>
                    <TableHead className="text-axanar-silver">Date</TableHead>
                    <TableHead className="text-axanar-silver">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pledges?.map((pledge) => (
                    <TableRow key={pledge.id} className="border-axanar-silver/20">
                      <TableCell className="text-white">
                        {pledge.donors ? `${pledge.donors.first_name} ${pledge.donors.last_name}` : 'Unknown Donor'}
                        <br />
                        <span className="text-sm text-axanar-silver">{pledge.donors?.email}</span>
                      </TableCell>
                      <TableCell className="text-white">{pledge.campaigns?.name || 'Unknown Campaign'}</TableCell>
                      <TableCell className="text-white">
                        {editingPledge === pledge.id ? (
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              value={editAmount}
                              onChange={(e) => setEditAmount(e.target.value)}
                              className="w-24 bg-axanar-dark border-axanar-silver/20 text-white"
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
                              className="border-axanar-silver/20"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          `$${Number(pledge.amount).toFixed(2)}`
                        )}
                      </TableCell>
                      <TableCell className="text-white">{pledge.status || 'Completed'}</TableCell>
                      <TableCell className="text-white">
                        {new Date(pledge.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {editingPledge !== pledge.id && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditStart(pledge.id, Number(pledge.amount))}
                            className="border-axanar-silver/20 hover:bg-axanar-teal hover:border-axanar-teal"
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
      </main>

      <Footer />
    </div>
  );
};

export default AdminPledges;
