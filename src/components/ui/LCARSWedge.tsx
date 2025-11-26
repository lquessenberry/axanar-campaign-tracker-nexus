/**
 * LCARS Orange Wedge/Arrowhead Component
 * The sweeping curved wedge that appears in TMP (2273) era
 * This is the direct evolutionary predecessor of the TNG orange elbow
 */

export function LCARSWedge() {
  return (
    <svg
      className="lcars-wedge"
      viewBox="0 0 200 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* TMP-era shoulder wedge - points toward center */}
      <path
        d="M 0 100 L 0 20 Q 0 0, 20 0 L 180 0 Q 200 0, 200 20 L 150 100 L 0 100 Z"
        className="fill-[#FF4500] opacity-80"
        style={{
          filter: 'drop-shadow(0 0 20px rgba(255, 69, 0, 0.6))',
        }}
      />
      {/* Inner highlight for depth */}
      <path
        d="M 5 95 L 5 22 Q 5 5, 22 5 L 178 5 Q 195 5, 195 22 L 148 95 L 5 95 Z"
        className="fill-[#FF8C00] opacity-40"
      />
    </svg>
  );
}
