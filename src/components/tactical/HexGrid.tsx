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
  const hexHeight = hexSize * Math.sqrt(3);
  const hexWidth = hexSize * 2;
  const vertDist = hexHeight;
  const horizDist = hexWidth * 0.75;

  const cols = Math.ceil(width / horizDist) + 1;
  const rows = Math.ceil(height / vertDist) + 1;

  const hexagons: JSX.Element[] = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * horizDist;
      const y = row * vertDist + (col % 2 === 1 ? vertDist / 2 : 0);

      const points = [
        x + hexSize, y,
        x + hexSize * 1.5, y + hexHeight / 4,
        x + hexSize * 1.5, y + hexHeight * 0.75,
        x + hexSize, y + hexHeight,
        x + hexSize * 0.5, y + hexHeight * 0.75,
        x + hexSize * 0.5, y + hexHeight / 4,
      ];

      hexagons.push(
        <Line
          key={`hex-${row}-${col}`}
          points={points}
          stroke="hsl(var(--muted-foreground))"
          strokeWidth={0.5}
          opacity={0.2}
          closed
        />
      );
    }
  }

  return <Layer>{hexagons}</Layer>;
};
