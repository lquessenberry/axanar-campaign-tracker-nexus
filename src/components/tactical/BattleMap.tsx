import React, { useState } from 'react';
import { Stage, Layer } from 'react-konva';
import { HexGrid } from './HexGrid';
import { Ship } from './Ship';
import { useTacticalGame } from '@/hooks/useTacticalGame';
import { TacticalShip } from '@/types/tactical';
import { Card, CardContent } from '@/components/ui/card';

interface BattleMapProps {
  gameId: string;
}

export const BattleMap: React.FC<BattleMapProps> = ({ gameId }) => {
  const { game, ships, isLoading } = useTacticalGame(gameId);
  const [selectedShip, setSelectedShip] = useState<TacticalShip | null>(null);

  const stageWidth = 1200;
  const stageHeight = 800;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Loading tactical display...</p>
        </CardContent>
      </Card>
    );
  }

  if (!game) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-destructive">Game not found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="relative bg-background">
          {/* Turn Indicator */}
          <div className="absolute top-4 left-4 z-10 bg-background/90 backdrop-blur-sm border rounded-lg p-3">
            <div className="text-sm font-medium">
              Turn {game.current_turn} - {game.phase.toUpperCase()}
            </div>
            {game.is_locked && (
              <div className="text-xs text-warning mt-1">
                🔒 Turn Locked
              </div>
            )}
          </div>

          {/* Selected Ship Info */}
          {selectedShip && (
            <div className="absolute top-4 right-4 z-10 bg-background/90 backdrop-blur-sm border rounded-lg p-3 min-w-[200px]">
              <h3 className="font-bold">{selectedShip.name}</h3>
              <p className="text-sm text-muted-foreground">{selectedShip.class}</p>
              <div className="mt-2 space-y-1 text-xs">
                <div>Hull: {selectedShip.hull}/{selectedShip.max_hull}</div>
                <div>Shields: {selectedShip.shields}/{selectedShip.max_shields}</div>
                <div>Speed: {selectedShip.speed}</div>
                <div>Status: {selectedShip.status}</div>
              </div>
            </div>
          )}

          {/* Konva Canvas */}
          <Stage width={stageWidth} height={stageHeight}>
            <HexGrid width={stageWidth} height={stageHeight} />
            <Layer>
              {ships.map((ship) => (
                <Ship
                  key={ship.id}
                  ship={ship}
                  onClick={() => setSelectedShip(ship)}
                />
              ))}
            </Layer>
          </Stage>
        </div>
      </CardContent>
    </Card>
  );
};
