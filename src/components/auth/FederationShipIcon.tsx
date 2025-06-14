
import * as React from "react";

interface FederationShipIconProps {
  size?: number;
  className?: string;
}

const FederationShipIcon = ({ size = 24, className = "" }: FederationShipIconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 120 120"
    className={className}
  >
    <g transform="translate(60,60)">
      {/* Main hull (saucer section) */}
      <ellipse
        cx="0"
        cy="-15"
        rx="25"
        ry="12"
        fill="currentColor"
        stroke="#000"
        strokeWidth="1"
      />
      
      {/* Secondary hull */}
      <rect
        x="-3"
        y="0"
        width="6"
        height="20"
        fill="currentColor"
        stroke="#000"
        strokeWidth="1"
      />
      
      {/* Nacelles */}
      <rect
        x="-18"
        y="5"
        width="12"
        height="4"
        rx="2"
        fill="currentColor"
        stroke="#000"
        strokeWidth="1"
      />
      <rect
        x="6"
        y="5"
        width="12"
        height="4"
        rx="2"
        fill="currentColor"
        stroke="#000"
        strokeWidth="1"
      />
      
      {/* Nacelle struts */}
      <line
        x1="-12"
        y1="7"
        x2="-3"
        y2="15"
        stroke="currentColor"
        strokeWidth="1"
      />
      <line
        x1="12"
        y1="7"
        x2="3"
        y2="15"
        stroke="currentColor"
        strokeWidth="1"
      />
      
      {/* Bridge */}
      <circle
        cx="0"
        cy="-20"
        r="3"
        fill="currentColor"
        stroke="#000"
        strokeWidth="1"
      />
    </g>
  </svg>
);

export default FederationShipIcon;
