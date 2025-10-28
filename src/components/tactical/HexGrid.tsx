import React from 'react';
import { Layer, Line } from 'react-konva';

interface HexGridProps {
  width: number;
  height: number;
  hexSize?: number;
}

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

      hexagons.push(
        <React.Fragment key={`hex-${row}-${col}`}>
          {/* Hex face (lighter) */}
          <Line
            points={points}
            fill={`rgba(100, 100, 150, ${opacity * 0.3})`}
            stroke="#4a5568"
            strokeWidth={1}
            opacity={0.6}
            closed
          />
          {/* Hex border glow */}
          <Line
            points={points}
            stroke="#60a5fa"
            strokeWidth={0.5}
            opacity={0.3}
            closed
            shadowColor="#60a5fa"
            shadowBlur={3}
            shadowOpacity={0.5}
          />
        </React.Fragment>
      );
    }
  }

  return <Layer>{hexagons}</Layer>;
};
