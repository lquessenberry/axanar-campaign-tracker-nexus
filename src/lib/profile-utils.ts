import { Pledge, ProfileStats } from '@/types/profile';

export function calculateProfileStats(pledges: Pledge[] | undefined): ProfileStats {
  const totalPledged = pledges?.reduce((sum, pledge) => sum + Number(pledge.amount), 0) || 0;
  const pledgesCount = pledges?.length || 0;
  
  // Get unique campaign count
  const uniqueCampaigns = new Set(
    pledges?.map(p => p.campaigns?.name).filter(Boolean) || []
  );
  const campaignsCount = uniqueCampaigns.size;
  
  // Calculate member since date
  const sortedPledges = [...(pledges || [])].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
  const firstPledgeDate = sortedPledges[0]?.created_at;
  const memberSince = firstPledgeDate 
    ? new Date(firstPledgeDate).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    : 'Unknown';
  
  // Calculate years supporting
  const yearsSupporting = firstPledgeDate
    ? Math.max(0, new Date().getFullYear() - new Date(firstPledgeDate).getFullYear())
    : 0;
  
  return {
    totalPledged,
    pledgesCount,
    campaignsCount,
    memberSince,
    yearsSupporting,
  };
}

export function formatDisplayName(profile: any): string {
  if (profile.display_name) return profile.display_name;
  if (profile.full_name) return profile.full_name;
  if (profile.first_name || profile.last_name) {
    return [profile.first_name, profile.last_name].filter(Boolean).join(' ');
  }
  if (profile.donor_name) return profile.donor_name;
  return profile.username || 'Unknown User';
}
