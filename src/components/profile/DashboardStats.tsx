import React from "react";
import { GlassPanel, DaystromStatusDisplay, LCARSGrid } from "@/components/tactical";
import { OkudagramNumber } from "./OkudagramNumber";
import { WarpPlasmaProgress } from "./WarpPlasmaProgress";
import { RankBadge3D } from "./RankBadge3D";

interface DashboardStatsProps {
  totalPledged: number;
  totalXP: number;
  achievementsCount: number;
  recruitCount: number;
  currentRank?: string;
  nextRank?: string;
  rankProgress?: { current: number; required: number };
}

const DashboardStats: React.FC<DashboardStatsProps> = ({
  totalPledged,
  totalXP,
  achievementsCount,
  recruitCount,
  currentRank = "Ensign",
  nextRank = "Lieutenant",
  rankProgress = { current: totalXP, required: 1000 }
}) => {
  return (
    <section className="relative py-8">
      {/* LCARS Grid overlay */}
      <LCARSGrid alertLevel="standard" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Mission Status</h2>
            <p className="text-muted-foreground">USS Ares Personnel Archive</p>
          </div>
        </div>
        
        {/* Hero contribution display - Okudagram style */}
        <GlassPanel className="mb-8 p-8 text-center">
          <OkudagramNumber 
            value={totalPledged} 
            label="Total Contribution"
            prefix="$"
          />
        </GlassPanel>
        
        {/* Rank progression */}
        <GlassPanel className="mb-8 p-8">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <RankBadge3D rank={currentRank} tier="Current Rank" />
            
            <div className="flex-1 w-full">
              <WarpPlasmaProgress
                current={rankProgress.current}
                total={rankProgress.required}
                label={`Progress to ${nextRank}`}
              />
            </div>
            
            <RankBadge3D 
              rank={nextRank} 
              tier="Next Rank" 
              className="opacity-50"
            />
          </div>
        </GlassPanel>
        
        {/* Status grid - Tactical displays */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <DaystromStatusDisplay
            label="ARES Tokens"
            value={totalXP}
            status="nominal"
          />
          
          <DaystromStatusDisplay
            label="Achievements"
            value={achievementsCount}
            status={achievementsCount > 5 ? "nominal" : "caution"}
          />
          
          <DaystromStatusDisplay
            label="Recruitment"
            value={recruitCount}
            status={recruitCount > 0 ? "nominal" : "offline"}
          />
        </div>
      </div>
    </section>
  );
};

export default DashboardStats;