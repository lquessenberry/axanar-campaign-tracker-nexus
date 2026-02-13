import { getRankForXP } from "@/hooks/useRankSystem";
import React from "react";
import { AmbassadorialTitleDisplay } from "./AmbassadorialTitleDisplay";

interface RankPipsProps {
  totalDonated: number;
  xp: number;
  profileCompletion: number;
  isAdmin?: boolean;
  userId?: string;
  className?: string;
}

const getSpecialTitles = (profileCompletion: number, xp: number) => {
  const titles = [];
  if (profileCompletion >= 100) titles.push("Yeoman");
  if (xp >= 500) titles.push("Liaison");
  if (xp >= 1000) titles.push("Embassy Attaché");
  if (xp >= 2000) titles.push("Diplomatic Envoy");
  if (xp >= 5000) titles.push("Ambassador");
  return titles;
};

const RankPips: React.FC<RankPipsProps> = ({
  totalDonated,
  xp,
  profileCompletion,
  isAdmin = false,
  userId,
  className = "",
}) => {
  // Use unified rank lookup — same thresholds everywhere
  const totalXP = Math.max(totalDonated * 100, xp);
  const rank = getRankForXP(totalXP, isAdmin);
  const specialTitles = getSpecialTitles(profileCompletion, xp);
  const progressToNext =
    rank.maxXP > rank.minXP
      ? ((totalXP - rank.minXP) / (rank.maxXP - rank.minXP)) * 100
      : 100;

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {/* Rank Display */}
      <div
        className={`rounded-lg border border-white/20 p-3 ${rank.bgColor} backdrop-blur-sm`}
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-white">{rank.name}</h3>
          <div className="flex gap-1">
            {/* Rank Pips */}
            {Array.from({ length: Math.max(rank.pips, 1) }).map((_, i) => (
              <div
                key={i}
                className={`w-2 h-6 rounded-sm ${
                  i < rank.pips ? rank.pipColor : "bg-white/20"
                } border border-white/30 shadow-sm`}
              />
            ))}
          </div>
        </div>

        {/* XP Progress */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-white/80">
            <span>
              ARES: {Math.max(totalDonated * 100, xp).toLocaleString()}
            </span>
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
          <div className="text-white font-medium">
            ${totalDonated.toLocaleString()}
          </div>
        </div>
        <div className="bg-white/5 rounded p-2 border border-white/10">
          <div className="text-white/60">Profile</div>
          <div className="text-white font-medium">{profileCompletion}%</div>
        </div>
      </div>

      {/* Ambassadorial Title */}
      {userId && <AmbassadorialTitleDisplay userId={userId} compact />}
    </div>
  );
};;

export default RankPips;
