import React from 'react';
import ussAresBadge from '@/assets/uss-ares-badge.png';

interface MissionPatchProps {
  donorName?: string;
  donorSince?: string;
  className?: string;
  scale?: number; // 1.0 = 420x560, 0.5 = 210x280, etc.
  badgeIcon?: string | null; // URL or emoji for custom badge
}
export const MissionPatch: React.FC<MissionPatchProps> = ({
  donorName = "Captain Kelvar Garth",
  donorSince = "2014",
  className = "",
  scale = 1.0,
  badgeIcon = null
}) => {
  const width = Math.round(420 * scale);
  const height = Math.round(560 * scale);
  const bannerHeight = Math.round(80 * scale);
  const centerHeight = Math.round(360 * scale);
  const bottomHeight = Math.round(60 * scale);
  const circleSize = Math.round(280 * scale);
  const borderWidth = Math.max(2, Math.round(6 * scale));
  const bannerFontSize = Math.round(36 * scale);
  const nameFontSize = Math.round(40 * scale);
  const bottomFontSize = Math.round(28 * scale);
  return <div className={`relative overflow-hidden ${className}`} style={{
    width: `${width}px`,
    height: `${height}px`,
    border: `${borderWidth}px solid #444444`,
    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.6)'
  }}>
      {/* Gold Top Banner */}
      <div className="bg-[#F9D71C] border-b-4 border-black flex items-center justify-center" style={{
      height: `${bannerHeight}px`
    }}>
        <h2 className="font-sans font-bold tracking-tight text-black" style={{
        fontSize: `${bannerFontSize}px`
      }}>
          SERVICE RECORD
        </h2>
      </div>

      {/* Center Section with Scanlines */}
      <div className="relative flex-1 bg-[#1C2526] flex flex-col items-center justify-center px-8" style={{
      height: `${centerHeight}px`,
      gap: `${Math.round(24 * scale)}px`,
      backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0, 0, 0, 0.15) 3px, rgba(0, 0, 0, 0.15) 4px)'
    }}>
        {/* Circle with Badge */}
        <div className="rounded-full bg-white border-black flex items-center justify-center relative overflow-hidden" style={{
        width: `${circleSize}px`,
        height: `${circleSize}px`,
        borderWidth: `${Math.max(2, Math.round(3 * scale))}px`
      }}>
          {badgeIcon && (badgeIcon.startsWith('/') || badgeIcon.startsWith('http')) ? (
            <img 
              src={badgeIcon} 
              alt="Title Badge" 
              className="w-full h-full object-contain p-2"
            />
          ) : badgeIcon ? (
            <span style={{ fontSize: `${Math.round(120 * scale)}px` }}>{badgeIcon}</span>
          ) : (
            <img 
              src={ussAresBadge} 
              alt="USS Ares Badge" 
              className="w-full h-full object-contain"
            />
          )}
        </div>

        {/* Donor Name */}
        <div className="text-[#E8E8E0] font-bold tracking-wide text-center px-4" style={{
        fontFamily: 'Eurostile, "Bank Gothic", "Arial Black", sans-serif',
        fontSize: `${nameFontSize}px`,
        lineHeight: '1.1'
      }}>
          {donorName}
        </div>
      </div>

      {/* Orange Bottom Strip */}
      <div className="bg-[#FF6A00] flex items-center justify-center" style={{
      height: `${bottomHeight}px`
    }}>
        <div className="font-sans font-bold tracking-tight text-black" style={{
        fontSize: `${bottomFontSize}px`
      }}>
          DONOR SINCE {donorSince}
        </div>
      </div>
    </div>;
};