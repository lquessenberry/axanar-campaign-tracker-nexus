/**
 * LCARS L-Bar Frame Component
 * Clear L-shaped and J-shaped orange bars along edges
 * Appears in Excelsior era (2285) - one step before full TNG frame
 */

interface LCARSLBarProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  color?: 'orange' | 'purple';
}

export function LCARSLBar({ position = 'top-left', color = 'orange' }: LCARSLBarProps) {
  const colorClass = color === 'orange' ? 'bg-[#FF6600]' : 'bg-[#9933CC]';
  const glowColor = color === 'orange' ? 'rgba(255, 102, 0, 0.5)' : 'rgba(153, 51, 204, 0.5)';

  return (
    <div
      className={`lcars-l-bar lcars-l-bar-${position} absolute pointer-events-none`}
      style={{
        filter: `drop-shadow(0 0 12px ${glowColor})`,
      }}
    >
      {position === 'top-left' && (
        <>
          {/* Horizontal bar */}
          <div className={`${colorClass} h-3 w-32`} />
          {/* Vertical bar */}
          <div className={`${colorClass} h-32 w-3 mt-0`} />
        </>
      )}
      
      {position === 'top-right' && (
        <div className="flex flex-col items-end">
          {/* Horizontal bar */}
          <div className={`${colorClass} h-3 w-32`} />
          {/* Vertical bar */}
          <div className={`${colorClass} h-32 w-3 mt-0`} />
        </div>
      )}
      
      {position === 'bottom-left' && (
        <div className="flex flex-col">
          {/* Vertical bar */}
          <div className={`${colorClass} h-32 w-3`} />
          {/* Horizontal bar */}
          <div className={`${colorClass} h-3 w-32 mt-0`} />
        </div>
      )}
      
      {position === 'bottom-right' && (
        <div className="flex flex-col items-end">
          {/* Vertical bar */}
          <div className={`${colorClass} h-32 w-3`} />
          {/* Horizontal bar */}
          <div className={`${colorClass} h-3 w-32 mt-0`} />
        </div>
      )}
    </div>
  );
}
