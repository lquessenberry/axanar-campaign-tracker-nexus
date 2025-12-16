/**
 * LCARS Segmented Horizontal Bar
 * Authentic TNG-era segmented color strips with elbow connectors
 */

interface LCARSBarProps {
  position?: 'top' | 'bottom';
  showElbow?: boolean;
}

export function LCARSBar({ position = 'top', showElbow = true }: LCARSBarProps) {
  return (
    <div className={`flex items-stretch w-full h-8 ${position === 'bottom' ? 'mt-auto' : ''}`}>
      {/* Left elbow connector */}
      {showElbow && (
        <div className="relative w-16 flex-shrink-0">
          <div 
            className="absolute inset-0 bg-[hsl(var(--lcars-secondary))]"
            style={{
              borderRadius: position === 'top' ? '0 0 0 24px' : '24px 0 0 0',
            }}
          />
        </div>
      )}
      
      {/* Segmented bar */}
      <div className="flex-1 flex items-stretch gap-1">
        {/* Segment 1 - short tan */}
        <div className="w-12 bg-[hsl(40,40%,70%)]" />
        
        {/* Segment 2 - medium blue */}
        <div className="w-20 bg-[hsl(200,60%,50%)]" />
        
        {/* Segment 3 - small accent */}
        <div className="w-4 bg-[hsl(180,60%,70%)]" />
        
        {/* Segment 4 - long primary */}
        <div className="flex-1 bg-[hsl(var(--lcars-primary))]" />
        
        {/* Segment 5 - medium secondary */}
        <div className="w-32 bg-[hsl(var(--lcars-secondary))]" />
        
        {/* Segment 6 - small tan */}
        <div className="w-8 bg-[hsl(50,50%,75%)]" />
        
        {/* Segment 7 - end cap */}
        <div 
          className="w-6 bg-[hsl(200,50%,60%)]"
          style={{
            borderRadius: position === 'top' ? '0 0 12px 0' : '0 12px 0 0',
          }}
        />
      </div>
    </div>
  );
}
