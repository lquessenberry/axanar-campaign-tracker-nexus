import React from "react";
import AchievementsShowcase from "../AchievementsShowcase";
import ContributionHistory from "../ContributionHistory";
import { SupportContact } from "@/components/SupportContact";

interface ActivitySectionProps {
  profile: any;
  pledges: any[];
  campaigns: any[];
  achievements: any[];
  recruitmentData: any[];
}

const ActivitySection: React.FC<ActivitySectionProps> = ({
  profile,
  pledges,
  campaigns,
  achievements,
  recruitmentData
}) => {
  const totalDonated = pledges?.reduce((sum, pledge) => sum + Number(pledge.amount), 0) || 0;
  const recruitCount = recruitmentData?.filter(r => r.status === 'confirmed').length || 0;
  
  // Calculate years supporting
  const yearsSupporting = pledges?.length ? (() => {
    const dates = pledges.map(p => new Date(p.created_at)).filter(d => !isNaN(d.getTime()));
    if (dates.length === 0) return 0;
    
    const earliestDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const currentDate = new Date();
    
    if (earliestDate.getFullYear() < 2010 || earliestDate > currentDate) {
      return Math.max(0, currentDate.getFullYear() - 2014);
    }
    
    const yearsGap = currentDate.getFullYear() - earliestDate.getFullYear();
    const hasPassedAnniversary = 
      currentDate.getMonth() > earliestDate.getMonth() || 
      (currentDate.getMonth() === earliestDate.getMonth() && currentDate.getDate() >= earliestDate.getDate());
    
    return Math.max(0, hasPassedAnniversary ? yearsGap : yearsGap - 1);
  })() : 0;

  const firstContributionDate = pledges?.length ? 
    pledges.find(p => new Date(p.created_at).getTime() === Math.min(...pledges.map(pl => new Date(pl.created_at).getTime()))) : null;

  return (
    <div className="space-y-6">
      {/* Achievements Showcase */}
      <AchievementsShowcase 
        donorData={{
          donor_tier: profile?.donor_tier,
          source_platform: profile?.source_platform,
          source_campaign: profile?.source_campaign,
          total_donated: totalDonated,
          total_contributions: pledges?.length || 0,
          campaigns_supported: campaigns?.length || 0,
          years_supporting: yearsSupporting,
          first_contribution_date: firstContributionDate?.created_at,
          source_reward_title: profile?.source_reward_title,
          source_perk_name: profile?.source_perk_name,
          email_lists: profile?.email_lists,
          recruits_confirmed: recruitCount,
          profile_completeness_score: (profile?.full_name && profile?.bio) ? 100 : 50,
          activity_score: 0, // Will be populated from unified XP
          source_amount: profile?.source_amount
        }}
      />

      {/* Detailed Contribution History */}
      <ContributionHistory pledges={pledges} />
      
      <SupportContact />
    </div>
  );
};

export default ActivitySection;