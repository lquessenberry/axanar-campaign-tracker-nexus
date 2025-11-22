import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { DaystromCard } from '@/components/ui/daystrom-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, PlayCircle, CheckCircle, AlertCircle, Crown, Users, BookOpen, Sparkles, Shield, Zap, Database } from 'lucide-react';
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

  // Fetch current title statistics and system readiness
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['title-stats'],
    queryFn: async () => {
      const [titlesResult, usersResult, holdersResult] = await Promise.all([
        supabase.from('ambassadorial_titles').select('id', { count: 'exact', head: true }),
        supabase.from('donors').select('auth_user_id', { count: 'exact' }).not('auth_user_id', 'is', null),
        supabase.from('user_ambassadorial_titles').select('user_id', { count: 'exact' })
      ]);

      const totalTitles = titlesResult.count || 0;
      const linkedUsers = usersResult.count || 0;
      const usersWithTitles = holdersResult.count || 0;

      return {
        totalTitles,
        linkedUsers,
        usersWithTitles,
        systemReady: totalTitles >= 62 && linkedUsers > 0
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

        {/* System Readiness Check */}
        <DaystromCard className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            System Readiness Status
          </h2>
          
          {statsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-4">
              <Alert className={stats?.systemReady ? "border-green-500/50 bg-green-500/10" : "border-amber-500/50 bg-amber-500/10"}>
                <div className="flex items-center gap-2">
                  {stats?.systemReady ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-amber-500" />
                  )}
                  <AlertDescription className="text-foreground font-semibold">
                    {stats?.systemReady ? "All systems operational - Ready to engage!" : "System check in progress..."}
                  </AlertDescription>
                </div>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border">
                  <Database className="h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">Titles Database</p>
                    <p className="text-xs text-muted-foreground">{stats?.totalTitles || 0} canonical titles loaded</p>
                  </div>
                  {(stats?.totalTitles || 0) >= 62 && <CheckCircle className="h-4 w-4 text-green-500" />}
                </div>
                
                <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border">
                  <Users className="h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">Linked Accounts</p>
                    <p className="text-xs text-muted-foreground">{stats?.linkedUsers?.toLocaleString() || 0} users ready</p>
                  </div>
                  {(stats?.linkedUsers || 0) > 0 && <CheckCircle className="h-4 w-4 text-green-500" />}
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border">
                  <Zap className="h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">Backfill Function</p>
                    <p className="text-xs text-muted-foreground">RPC endpoint active</p>
                  </div>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border">
                  <Crown className="h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">Current Holders</p>
                    <p className="text-xs text-muted-foreground">{stats?.usersWithTitles || 0} users with titles</p>
                  </div>
                  {(stats?.usersWithTitles || 0) > 0 && <CheckCircle className="h-4 w-4 text-green-500" />}
                </div>
              </div>
            </div>
          )}
        </DaystromCard>

        {/* Backfill Control */}
        <DaystromCard className="p-6">
          <h2 className="text-xl font-semibold mb-4">Execute Backfill</h2>
          
          <Alert className="mb-4 border-cyan-500/50 bg-cyan-500/10">
            <Zap className="h-4 w-4 text-cyan-500" />
            <AlertDescription className="text-foreground">
              <p className="font-semibold mb-2">Engaging warp drive systems...</p>
              <p className="text-sm">
                This will process all {stats?.linkedUsers?.toLocaleString() || 0} linked users with pledge data and assign appropriate ambassadorial titles 
                based on the canonical 62-tier system. This operation is idempotent and safe to run multiple times.
              </p>
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <Button
              onClick={() => backfillMutation.mutate()}
              disabled={backfillMutation.isPending || !stats?.systemReady}
              size="lg"
              className="w-full md:w-auto"
            >
              {backfillMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing at Warp Speed...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-5 w-5" />
                  Engage! Run Backfill
                </>
              )}
            </Button>
            {!stats?.systemReady && (
              <p className="text-sm text-muted-foreground mt-2">
                <AlertCircle className="h-4 w-4 inline mr-1" />
                System checks must complete before engaging
              </p>
            )}

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
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Min. Pledge</TableHead>
                    <TableHead className="text-right">XP Mult</TableHead>
                    <TableHead className="text-right">Forum XP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allTitles?.map((title) => (
                    <TableRow key={title.id}>
                      <TableCell>
                        {title.icon?.startsWith('/') || title.icon?.startsWith('http') ? (
                          <img 
                            src={title.icon} 
                            alt={title.display_name}
                            className="w-12 h-12 object-contain"
                          />
                        ) : (
                          <span className="text-2xl">{title.icon}</span>
                        )}
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
                      <TableCell className="text-sm text-muted-foreground max-w-md">
                        <div className="space-y-1">
                          <p className="text-foreground font-medium">{title.description || <em>No description</em>}</p>
                          {title.exact_perk_name && (
                            <p className="text-xs italic">Perk: {title.exact_perk_name}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono whitespace-nowrap">
                        ${Number(title.minimum_pledge_amount).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-medium text-primary whitespace-nowrap">
                        {title.xp_multiplier}x
                      </TableCell>
                      <TableCell className="text-right text-accent whitespace-nowrap">
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
