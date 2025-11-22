import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { DaystromCard } from '@/components/ui/daystrom-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, PlayCircle, CheckCircle, AlertCircle, Crown, Users, BookOpen, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface BackfillResults {
  processed_users: number;
  users_with_titles: number;
  total_titles_awarded: number;
  total_badges_awarded: number;
}

export default function BackfillTitles() {
  useAdminCheck();
  const queryClient = useQueryClient();
  const [backfillResults, setBackfillResults] = useState<BackfillResults | null>(null);

  // Fetch current title statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['title-stats'],
    queryFn: async () => {
      const [titlesResult, usersResult, holdersResult] = await Promise.all([
        supabase.from('ambassadorial_titles').select('id', { count: 'exact', head: true }),
        supabase.from('donors').select('auth_user_id', { count: 'exact' }).not('auth_user_id', 'is', null),
        supabase.from('user_ambassadorial_titles').select('user_id', { count: 'exact' })
      ]);

      return {
        totalTitles: titlesResult.count || 0,
        linkedUsers: usersResult.count || 0,
        usersWithTitles: holdersResult.count || 0
      };
    }
  });

  // Fetch all titles for reference
  const { data: allTitles, isLoading: titlesLoading } = useQuery({
    queryKey: ['all-titles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ambassadorial_titles')
        .select('*')
        .order('is_universal', { ascending: false })
        .order('campaign_platform')
        .order('tier_level', { ascending: false })
        .order('minimum_pledge_amount', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Backfill mutation
  const backfillMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc('backfill_all_ambassadorial_titles');
      
      if (error) throw error;
      return data[0] as BackfillResults;
    },
    onSuccess: (data) => {
      setBackfillResults(data);
      queryClient.invalidateQueries({ queryKey: ['title-stats'] });
      queryClient.invalidateQueries({ queryKey: ['ambassadorial-titles'] });
      toast.success('Backfill completed successfully!', {
        description: `Processed ${data.processed_users} users, awarded ${data.total_titles_awarded} titles`
      });
    },
    onError: (error: any) => {
      toast.error('Backfill failed', {
        description: error.message
      });
    }
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Crown className="h-8 w-8 text-primary" />
            Ambassadorial Titles Backfill
          </h1>
          <p className="text-muted-foreground mt-2">
            Award canonical diplomatic titles to all eligible users based on their pledge history
          </p>
        </div>

        {/* Current Statistics */}
        <DaystromCard className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Current Statistics
          </h2>
          
          {statsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-sm text-muted-foreground">Total Titles Available</p>
                <p className="text-3xl font-bold text-foreground mt-1">{stats?.totalTitles}</p>
              </div>
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-sm text-muted-foreground">Linked User Accounts</p>
                <p className="text-3xl font-bold text-foreground mt-1">{stats?.linkedUsers}</p>
              </div>
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-sm text-muted-foreground">Users with Titles</p>
                <p className="text-3xl font-bold text-foreground mt-1">{stats?.usersWithTitles}</p>
              </div>
            </div>
          )}
        </DaystromCard>

        {/* Backfill Control */}
        <DaystromCard className="p-6">
          <h2 className="text-xl font-semibold mb-4">Execute Backfill</h2>
          
          <Alert className="mb-4 border-amber-500/50 bg-amber-500/10">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <AlertDescription className="text-foreground">
              This will process all users with pledge data and assign appropriate ambassadorial titles 
              based on the canonical 37-tier system. This operation is idempotent and safe to run multiple times.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <Button
              onClick={() => backfillMutation.mutate()}
              disabled={backfillMutation.isPending}
              size="lg"
              className="w-full md:w-auto"
            >
              {backfillMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <PlayCircle className="mr-2 h-5 w-5" />
                  Run Backfill
                </>
              )}
            </Button>

            {backfillResults && (
              <Alert className="border-green-500/50 bg-green-500/10">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertDescription>
                  <div className="space-y-1">
                    <p className="font-semibold text-foreground">Backfill Completed Successfully</p>
                    <ul className="text-sm text-muted-foreground space-y-0.5 mt-2">
                      <li>• Processed {backfillResults.processed_users} users</li>
                      <li>• {backfillResults.users_with_titles} users now have titles</li>
                      <li>• Awarded {backfillResults.total_titles_awarded} new titles</li>
                      <li>• Awarded {backfillResults.total_badges_awarded} new forum badges</li>
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </DaystromCard>

        {/* All Titles Reference */}
        <DaystromCard className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            All Available Titles ({stats?.totalTitles || 38})
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Complete reference of all ambassadorial titles, their requirements, and rewards
          </p>

          {titlesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">Icon</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Exact Perk Name</TableHead>
                    <TableHead className="text-right">Min. Pledge</TableHead>
                    <TableHead className="text-right">Tier</TableHead>
                    <TableHead className="text-right">XP Mult</TableHead>
                    <TableHead className="text-right">Forum XP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allTitles?.map((title) => (
                    <TableRow key={title.id}>
                      <TableCell>
                        <span className="text-2xl">{title.icon}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className={`font-medium ${title.color || 'text-foreground'}`}>
                            {title.display_name}
                          </span>
                          {title.is_universal && (
                            <Badge variant="outline" className="w-fit">
                              <Sparkles className="h-3 w-3 mr-1" />
                              Universal
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{title.campaign_platform}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {title.exact_perk_name || <em>Amount-based</em>}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        ${Number(title.minimum_pledge_amount).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {title.tier_level || '-'}
                      </TableCell>
                      <TableCell className="text-right font-medium text-primary">
                        {title.xp_multiplier}x
                      </TableCell>
                      <TableCell className="text-right text-accent">
                        +{title.forum_xp_bonus}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          
          <div className="mt-6 pt-4 border-t border-border">
            <h3 className="font-semibold mb-2 text-sm">System Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs text-muted-foreground">
              <div>
                <Badge variant="outline" className="mb-1">Universal</Badge>
                <p>1 title ($1+)</p>
              </div>
              <div>
                <Badge variant="outline" className="mb-1">Prelude</Badge>
                <p>12 titles ($1 - $1,000)</p>
              </div>
              <div>
                <Badge variant="outline" className="mb-1">Kickstarter</Badge>
                <p>16 titles ($35 - $50,000)</p>
              </div>
              <div>
                <Badge variant="outline" className="mb-1">Indiegogo</Badge>
                <p>9 titles ($25 - $1,000)</p>
              </div>
            </div>
          </div>
        </DaystromCard>
      </div>
    </AdminLayout>
  );
}
