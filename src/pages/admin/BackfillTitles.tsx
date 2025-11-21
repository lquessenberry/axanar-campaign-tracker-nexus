import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { DaystromCard } from '@/components/ui/daystrom-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, PlayCircle, CheckCircle, AlertCircle, Crown, Users } from 'lucide-react';
import { toast } from 'sonner';
import { useAdminCheck } from '@/hooks/useAdminCheck';

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

        {/* Title System Information */}
        <DaystromCard className="p-6">
          <h2 className="text-xl font-semibold mb-4">The Canonical 37</h2>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              The Daystrom Ambassadorial Titles system recognizes every historical perk tier across 
              all three campaigns with diplomatic precision:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div>
                <Badge variant="outline" className="mb-2">Universal</Badge>
                <p className="text-xs">Foundation Contributor ($1+)</p>
              </div>
              <div>
                <Badge variant="outline" className="mb-2">Prelude to Axanar</Badge>
                <p className="text-xs">12 titles ($1 - $1,000)</p>
              </div>
              <div>
                <Badge variant="outline" className="mb-2">Axanar Kickstarter</Badge>
                <p className="text-xs">16 titles ($35 - $50,000)</p>
              </div>
              <div>
                <Badge variant="outline" className="mb-2">Indiegogo Recovery</Badge>
                <p className="text-xs">9 titles ($25 - $1,000)</p>
              </div>
            </div>
            <p className="pt-2">
              Titles are assigned based on exact perk matching and pledge amounts, with automatic 
              XP multipliers, forum bonuses, and corresponding badges.
            </p>
          </div>
        </DaystromCard>
      </div>
    </AdminLayout>
  );
}
