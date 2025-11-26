/**
 * Daystrom Design System - LCARS Edge Bars (Proponent #3)
 * Cyan-orange horizontal/vertical bars at viewport edge
 * Adapts to LCARS evolution eras
 */
export function LCARSEdgeBars() {
  return (
    <div className="fixed inset-0 pointer-events-none z-background lcars-edge-bars">
      {/* Top bar */}
      <div className="lcars-edge-bar absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary/10 via-transparent to-accent/10" />
      
      {/* Bottom bar */}
      <div className="lcars-edge-bar absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-accent/10 via-transparent to-primary/10" />
      
      {/* Left bar */}
      <div className="lcars-edge-bar absolute top-0 bottom-0 left-0 w-[2px] bg-gradient-to-b from-primary/10 via-transparent to-accent/10" />
      
      {/* Right bar */}
      <div className="lcars-edge-bar absolute top-0 bottom-0 right-0 w-[2px] bg-gradient-to-b from-accent/10 via-transparent to-primary/10" />
    </div>
  );
}
