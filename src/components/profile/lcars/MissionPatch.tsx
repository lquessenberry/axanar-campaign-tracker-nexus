import React from 'react';

interface MissionPatchProps {
  donorName?: string;
  donorSince?: string;
  className?: string;
}

export const MissionPatch: React.FC<MissionPatchProps> = ({
  donorName = "Captain Kelvar Garth",
  donorSince = "2014",
  className = "",
}) => {
  return (
    <div 
      className={`relative w-[420px] h-[560px] border-[6px] border-[#444444] overflow-hidden ${className}`}
      style={{
        boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.6)',
      }}
    >
      {/* Gold Top Banner */}
      <div className="h-[80px] bg-[#F9D71C] border-b-4 border-black flex items-center justify-center">
        <h2 className="font-sans font-bold tracking-tight text-[36px] text-black">
          AXANAR SERVICE RECORD
        </h2>
      </div>

      {/* Center Section with Scanlines */}
      <div 
        className="relative flex-1 h-[360px] bg-[#1C2526] flex flex-col items-center justify-center gap-6 px-8"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0, 0, 0, 0.15) 3px, rgba(0, 0, 0, 0.15) 4px)',
        }}
      >
        {/* White Circle with Mission Patch */}
        <div className="w-[280px] h-[280px] rounded-full bg-white border-[3px] border-black flex items-center justify-center relative">
          {/* Red Delta Arrowhead */}
          <svg 
            width="140" 
            height="160" 
            viewBox="0 0 140 160" 
            className="absolute"
            style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
          >
            {/* Delta shape pointing up */}
            <path
              d="M 70 20 L 120 140 L 70 120 L 20 140 Z"
              fill="#C62828"
              stroke="none"
            />
            
            {/* White 5-point star slightly above center */}
            <polygon
              points="70,55 75,68 89,68 78,76 82,89 70,81 58,89 62,76 51,68 65,68"
              fill="white"
              stroke="none"
            />
          </svg>
        </div>

        {/* Donor Name */}
        <div className="text-[#E8E8E0] text-[40px] font-bold tracking-wide text-center" style={{ fontFamily: 'Eurostile, "Bank Gothic", "Arial Black", sans-serif' }}>
          {donorName}
        </div>
      </div>

      {/* Orange Bottom Strip */}
      <div className="h-[60px] bg-[#FF6A00] flex items-center justify-center">
        <div className="font-sans font-bold tracking-tight text-[28px] text-black">
          DONOR SINCE {donorSince}
        </div>
      </div>
    </div>
  );
};
