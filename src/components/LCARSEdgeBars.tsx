/**
 * Daystrom Design System - LCARS Edge Bars (Proponent #3)
 * Cyan-orange horizontal/vertical bars at viewport edge
 */
export function LCARSEdgeBars() {
  return (
    <div className="fixed inset-0 pointer-events-none z-background">
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-500/10 via-transparent to-orange-500/10" />
      
      {/* Bottom bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-orange-500/10 via-transparent to-cyan-500/10" />
      
      {/* Left bar */}
      <div className="absolute top-0 bottom-0 left-0 w-[2px] bg-gradient-to-b from-cyan-500/10 via-transparent to-orange-500/10" />
      
      {/* Right bar */}
      <div className="absolute top-0 bottom-0 right-0 w-[2px] bg-gradient-to-b from-orange-500/10 via-transparent to-cyan-500/10" />
    </div>
  );
}
