import React from 'react';
import { Layer, Line, Rect } from 'react-konva';

interface HexGridProps {
  width: number;
  height: number;
  hexSize?: number;
}

// CGA Hercules color palette
const CGA_CYAN = '#00ffff';
const CGA_MAGENTA = '#ff00ff';

export const HexGrid: React.FC<HexGridProps> = ({ 
  width, 
  height, 
  hexSize = 50 
}) => {
  // Isometric constants
  const isoAngle = Math.PI / 6; // 30 degrees
  const isoScale = 0.866; // cos(30°)
  
  const hexHeight = hexSize * Math.sqrt(3);
  const hexWidth = hexSize * 2;
  const vertDist = hexHeight;
  const horizDist = hexWidth * 0.75;

  const cols = Math.ceil(width / (horizDist * isoScale)) + 2;
  const rows = Math.ceil(height / (vertDist * isoScale)) + 2;

  const hexagons: JSX.Element[] = [];

  // Convert to isometric coordinates
  const toIso = (x: number, y: number) => ({
    x: (x - y) * isoScale,
    y: (x + y) * isoScale * 0.5
  });

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const gridX = col * horizDist;
      const gridY = row * vertDist + (col % 2 === 1 ? vertDist / 2 : 0);
      
      const iso = toIso(gridX, gridY);
      const x = iso.x + width / 2;
      const y = iso.y + 100;

      // Isometric hex points
      const isoHexSize = hexSize * 0.8;
      const points = [
        x, y - isoHexSize / 2,
        x + isoHexSize * 0.5, y - isoHexSize / 4,
        x + isoHexSize * 0.5, y + isoHexSize / 4,
        x, y + isoHexSize / 2,
        x - isoHexSize * 0.5, y + isoHexSize / 4,
        x - isoHexSize * 0.5, y - isoHexSize / 4,
      ];

      // Calculate depth for fade effect
      const depth = (row + col) / (rows + cols);
      const opacity = 0.15 + depth * 0.1;

      // Alternate colors for depth effect
      const lineColor = (row + col) % 2 === 0 ? CGA_CYAN : CGA_MAGENTA;
      
      hexagons.push(
        <Line
          key={`hex-${row}-${col}`}
          points={points}
          stroke={lineColor}
          strokeWidth={1}
          opacity={opacity}
          closed
          shadowColor={lineColor}
          shadowBlur={4}
          shadowOpacity={0.6}
        />
      );
    }
  }

  return <Layer>{hexagons}</Layer>;
};
