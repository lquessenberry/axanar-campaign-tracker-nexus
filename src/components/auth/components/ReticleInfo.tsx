
import { ReticleInfo as ReticleInfoType } from '../types/battleTypes';

interface ReticleInfoProps {
  reticleInfo: ReticleInfoType | null;
}

const ReticleInfo = ({ reticleInfo }: ReticleInfoProps) => {
  if (!reticleInfo) return null;

  return (
    <div
      className="absolute pointer-events-none transition-opacity duration-500"
      style={{
        left: `${reticleInfo.x}%`,
        top: `${reticleInfo.y}%`,
        opacity: reticleInfo.opacity,
        transform: 'translate(-50%, -50%)',
        zIndex: 25,
      }}
    >
      <div className="bg-red-900/80 border border-red-500 px-3 py-1 rounded text-red-100 text-sm font-mono uppercase tracking-wider backdrop-blur-sm">
        {reticleInfo.message}
      </div>
    </div>
  );
};

export default ReticleInfo;
