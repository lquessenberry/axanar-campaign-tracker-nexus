import React from 'react';
import { AmbassadorialTitleDisplay } from './AmbassadorialTitleDisplay';

interface RankPipsProps {
  totalDonated: number;
  xp: number;
  profileCompletion: number;
  isAdmin?: boolean;
  userId?: string;
  className?: string;
}

interface RankInfo {
  name: string;
  pips: number;
  pipColor: string;
  bgColor: string;
  minXP: number;
  maxXP: number;
}

const getRankInfo = (totalDonated: number, xp: number, isAdmin: boolean = false): RankInfo => {
  // Admin gets Admiral rank automatically
  if (isAdmin) {
    return {
      name: 'Admiral',
      pips: 6,
      pipColor: 'bg-yellow-400',
      bgColor: 'bg-yellow-400/20',
      minXP: 250000,
      maxXP: 999999
    };
  }

  // Convert donations to XP (1 USD = 100 ARES)
  const donationXP = totalDonated * 100;
  const totalXP = Math.max(donationXP, xp);

  if (totalXP >= 250000) return { name: 'Admiral', pips: 6, pipColor: 'bg-yellow-400', bgColor: 'bg-yellow-400/20', minXP: 250000, maxXP: 999999 };
  if (totalXP >= 100000) return { name: 'Captain', pips: 5, pipColor: 'bg-yellow-300', bgColor: 'bg-yellow-300/20', minXP: 100000, maxXP: 249999 };
  if (totalXP >= 50000) return { name: 'Master Chief', pips: 4, pipColor: 'bg-orange-400', bgColor: 'bg-orange-400/20', minXP: 50000, maxXP: 99999 };
  if (totalXP >= 25000) return { name: 'Senior Chief', pips: 4, pipColor: 'bg-orange-300', bgColor: 'bg-orange-300/20', minXP: 25000, maxXP: 49999 };
  if (totalXP >= 10000) return { name: 'Chief Petty Officer', pips: 3, pipColor: 'bg-blue-400', bgColor: 'bg-blue-400/20', minXP: 10000, maxXP: 24999 };
  if (totalXP >= 5000) return { name: 'Petty Officer 1st', pips: 3, pipColor: 'bg-blue-300', bgColor: 'bg-blue-300/20', minXP: 5000, maxXP: 9999 };
  if (totalXP >= 2500) return { name: 'Petty Officer 2nd', pips: 2, pipColor: 'bg-cyan-400', bgColor: 'bg-cyan-400/20', minXP: 2500, maxXP: 4999 };
  if (totalXP >= 1000) return { name: 'Petty Officer 3rd', pips: 2, pipColor: 'bg-cyan-300', bgColor: 'bg-cyan-300/20', minXP: 1000, maxXP: 2499 };
  if (totalXP >= 500) return { name: 'Crewman 1st', pips: 1, pipColor: 'bg-green-400', bgColor: 'bg-green-400/20', minXP: 500, maxXP: 999 };
  if (totalXP >= 250) return { name: 'Crewman 2nd', pips: 1, pipColor: 'bg-green-300', bgColor: 'bg-green-300/20', minXP: 250, maxXP: 499 };
  if (totalXP >= 1) return { name: 'Crewman 3rd', pips: 1, pipColor: 'bg-gray-400', bgColor: 'bg-gray-400/20', minXP: 0, maxXP: 249 };
  
  // Unorganized or Privateer
  if (totalDonated > 0) return { name: 'Privateer', pips: 0, pipColor: 'bg-red-400', bgColor: 'bg-red-400/20', minXP: 0, maxXP: 0 };
  return { name: 'Unorganized Militia', pips: 0, pipColor: 'bg-gray-600', bgColor: 'bg-gray-600/20', minXP: 0, maxXP: 0 };
};

const getSpecialTitles = (profileCompletion: number, xp: number) => {
  const titles = [];
  if (profileCompletion >= 100) titles.push('Yeoman');
  if (xp >= 500) titles.push('Liaison');
  if (xp >= 1000) titles.push('Embassy Attaché');
  if (xp >= 2000) titles.push('Diplomatic Envoy');
  if (xp >= 5000) titles.push('Ambassador');
  return titles;
};

const RankPips: React.FC<RankPipsProps> = ({ 
  totalDonated, 
  xp, 
  profileCompletion, 
  isAdmin = false,
  userId,
  className = "" 
}) => {
  const rank = getRankInfo(totalDonated, xp, isAdmin);
  const specialTitles = getSpecialTitles(profileCompletion, xp);
  const progressToNext = rank.maxXP > rank.minXP ? 
    ((Math.max(totalDonated * 100, xp) - rank.minXP) / (rank.maxXP - rank.minXP)) * 100 : 100;

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {/* Rank Display */}
      <div className={`rounded-lg border border-white/20 p-3 ${rank.bgColor} backdrop-blur-sm`}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-white">{rank.name}</h3>
          <div className="flex gap-1">
            {/* Rank Pips */}
            {Array.from({ length: Math.max(rank.pips, 1) }).map((_, i) => (
              <div
                key={i}
                className={`w-2 h-6 rounded-sm ${
                  i < rank.pips ? rank.pipColor : 'bg-white/20'
                } border border-white/30 shadow-sm`}
              />
            ))}
          </div>
        </div>
        
        {/* XP Progress */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-white/80">
            <span>ARES: {Math.max(totalDonated * 100, xp).toLocaleString()}</span>
            {rank.maxXP > rank.minXP && (
              <span>Next: {rank.maxXP.toLocaleString()}</span>
            )}
          </div>
          {rank.maxXP > rank.minXP && (
            <div className="w-full bg-white/20 rounded-full h-1">
              <div 
                className={`h-1 rounded-full ${rank.pipColor}`}
                style={{ width: `${Math.min(progressToNext, 100)}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Special Titles */}
      {specialTitles.length > 0 && (
        <div className="space-y-1">
          {specialTitles.map((title, index) => (
            <div
              key={index}
              className="bg-axanar-teal/20 border border-axanar-teal/30 rounded px-2 py-1 text-xs text-axanar-teal font-medium backdrop-blur-sm"
            >
              {title}
            </div>
          ))}
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-white/5 rounded p-2 border border-white/10">
          <div className="text-white/60">Donated</div>
          <div className="text-white font-medium">${totalDonated.toLocaleString()}</div>
        </div>
        <div className="bg-white/5 rounded p-2 border border-white/10">
          <div className="text-white/60">Profile</div>
          <div className="text-white font-medium">{profileCompletion}%</div>
        </div>
      </div>

      {/* Ambassadorial Title */}
      {userId && (
        <AmbassadorialTitleDisplay userId={userId} compact />
      )}
    </div>
  );
};

export default RankPips;