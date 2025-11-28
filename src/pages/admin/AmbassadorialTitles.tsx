import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Award, Plus, Edit, Users, RefreshCw, AlertCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const AmbassadorialTitlesAdmin = () => {
  const queryClient = useQueryClient();
  const [selectedTitle, setSelectedTitle] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch all titles
  const { data: titles, isLoading: titlesLoading } = useQuery({
    queryKey: ['admin-ambassadorial-titles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ambassadorial_titles')
        .select(`
          *,
          campaigns (name),
          user_ambassadorial_titles (count)
        `)
        .order('minimum_pledge_amount', { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  // Backfill mutation
  const backfillMutation = useMutation({
    mutationFn: async () => {
      // Get all users with pledges
      const { data: users, error: usersError } = await supabase
        .from('donors')
        .select('auth_user_id')
        .not('auth_user_id', 'is', null);

      if (usersError) throw usersError;

      const results = [];
      for (const user of users || []) {
        const { error } = await supabase.rpc('calculate_ambassadorial_titles', {
          p_user_id: user.auth_user_id
        });
        
        if (error) {
          results.push({ user_id: user.auth_user_id, success: false, error: error.message });
        } else {
          results.push({ user_id: user.auth_user_id, success: true });
        }
      }

      return results;
    },
    onSuccess: (results) => {
      const successCount = results.filter(r => r.success).length;
      const errorCount = results.filter(r => !r.success).length;
      
      toast.success(`Backfill complete! ${successCount} users processed, ${errorCount} errors`);
      queryClient.invalidateQueries({ queryKey: ['admin-ambassadorial-titles'] });
    },
    onError: (error: any) => {
      toast.error(`Backfill failed: ${error.message}`);
    }
  });

  if (titlesLoading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Award className="w-6 h-6" />
            Ambassadorial Titles
          </h2>
          <p className="text-muted-foreground mt-1">
            Manage campaign-based titles and their benefits
          </p>
        </div>
        <Button
          onClick={() => backfillMutation.mutate()}
          disabled={backfillMutation.isPending}
          variant="outline"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${backfillMutation.isPending ? 'animate-spin' : ''}`} />
          {backfillMutation.isPending ? 'Running...' : 'Backfill All Users'}
        </Button>
      </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Titles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{titles?.length || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Active Title Holders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {titles?.reduce((sum, t) => sum + (t.user_ambassadorial_titles?.[0]?.count || 0), 0) || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Campaigns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Set(titles?.map(t => t.campaign_id).filter(Boolean)).size || 0}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Info Alert */}
          <Card className="border-blue-500/20 bg-blue-500/5">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">About Ambassadorial Titles</p>
                  <p className="text-sm text-muted-foreground">
                    Titles are automatically assigned when users make pledges. Each title provides XP multipliers,
                    bonus XP, and special permissions. Use the backfill function to assign titles to existing users
                    based on their historical pledges.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Titles Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Ambassadorial Titles</CardTitle>
                  <CardDescription>
                    Campaign-specific titles and their benefits
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {titlesLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading titles...</div>
              ) : !titles?.length ? (
                <div className="text-center py-8 text-muted-foreground">No titles found</div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Campaign</TableHead>
                        <TableHead>Min. Pledge</TableHead>
                        <TableHead>XP Multiplier</TableHead>
                        <TableHead>Bonuses</TableHead>
                        <TableHead className="text-right">Holders</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {titles.map((title: any) => (
                        <TableRow key={title.id}>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <span className={`font-medium ${title.color}`}>
                                {title.display_name}
                              </span>
                              {title.description && (
                                <span className="text-xs text-muted-foreground">
                                  {title.description}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">
                              {title.campaigns?.name || 'No campaign'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="font-mono text-sm">
                              ${title.minimum_pledge_amount}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {title.xp_multiplier}×
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {title.forum_xp_bonus > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  +{title.forum_xp_bonus} Forum
                                </Badge>
                              )}
                              {title.participation_xp_bonus > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  +{title.participation_xp_bonus} Activity
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="font-medium">
                              {title.user_ambassadorial_titles?.[0]?.count || 0}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
            )}
          </CardContent>
        </Card>
    </div>
  );
};

export default AmbassadorialTitlesAdmin;
