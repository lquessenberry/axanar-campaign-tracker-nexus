import React, { useState } from 'react';
import { Stage, Layer } from 'react-konva';
import { HexGrid } from './HexGrid';
import { Ship } from './Ship';
import { Objective } from './Objective';
import { useTacticalGame } from '@/hooks/useTacticalGame';
import { TacticalShip, TacticalObjective } from '@/types/tactical';
import { Card, CardContent } from '@/components/ui/card';

interface BattleMapProps {
  gameId: string;
}

export const BattleMap: React.FC<BattleMapProps> = ({ gameId }) => {
  const { game, ships, objectives, isLoading } = useTacticalGame(gameId);
  const [selectedShip, setSelectedShip] = useState<TacticalShip | null>(null);
  const [selectedObjective, setSelectedObjective] = useState<TacticalObjective | null>(null);

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
        <div className="relative bg-black" style={{ minHeight: '800px' }}>
          {/* CRT Scan line overlay */}
          <div 
            className="absolute inset-0 z-20 pointer-events-none"
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg, rgba(0, 255, 255, 0.03) 0px, rgba(0, 255, 255, 0.03) 1px, transparent 1px, transparent 2px)',
              animation: 'scan 8s linear infinite',
            }}
          />
          
          {/* CRT glow effect */}
          <div 
            className="absolute inset-0 z-10 pointer-events-none"
            style={{
              boxShadow: 'inset 0 0 100px rgba(0, 255, 255, 0.1)',
            }}
          />

          {/* Turn Indicator */}
          <div className="absolute top-4 left-4 z-10 bg-background/90 backdrop-blur-sm border rounded-lg p-3">
            <div className="text-sm font-medium text-cyan-400">
              Turn {game.current_turn} - {game.phase.toUpperCase()}
            </div>
            {game.is_locked && (
              <div className="text-xs text-amber-400 mt-1">
                🔒 Turn Locked
              </div>
            )}
            <div className="text-xs text-muted-foreground mt-1">
              Ships: {ships.length} | Objectives: {objectives.length}
            </div>
          </div>

          {/* Selected Ship Info */}
          {selectedShip && (
            <div className="absolute top-4 right-4 z-10 bg-black/90 backdrop-blur-sm border border-cyan-400 rounded-lg p-3 min-w-[200px]">
              <h3 className="font-bold text-cyan-400">{selectedShip.name}</h3>
              <p className="text-sm text-gray-400">{selectedShip.class}</p>
              {!selectedShip.captain_user_id && (
                <p className="text-xs text-amber-400 mt-1">[AI-Controlled]</p>
              )}
              <div className="mt-2 space-y-1 text-xs text-gray-300">
                <div>Hull: {selectedShip.hull}/{selectedShip.max_hull}</div>
                <div>Shields: {selectedShip.shields}/{selectedShip.max_shields}</div>
                <div>Speed: {selectedShip.speed}</div>
                <div>Status: {selectedShip.status}</div>
              </div>
            </div>
          )}

          {/* Selected Objective Info */}
          {selectedObjective && (
            <div className="absolute top-4 right-4 z-10 bg-black/90 backdrop-blur-sm border border-magenta-400 rounded-lg p-3 min-w-[200px]">
              <h3 className="font-bold text-magenta-400">{selectedObjective.name}</h3>
              <p className="text-sm text-gray-400 capitalize">{selectedObjective.type.replace('_', ' ')}</p>
              <div className="mt-2 space-y-1 text-xs text-gray-300">
                <div>Control: {selectedObjective.controlled_by || 'Neutral'}</div>
                <div>Victory Points: {selectedObjective.victory_points}</div>
                <div>Points/Turn: {selectedObjective.points_per_turn}</div>
                <div>Status: {selectedObjective.status}</div>
              </div>
            </div>
          )}

          {/* Konva Canvas */}
          <Stage width={stageWidth} height={stageHeight} style={{ background: '#000' }}>
            <HexGrid width={stageWidth} height={stageHeight} />
            <Layer>
              {/* Render objectives first (behind ships) */}
              {objectives.map((objective) => (
                <Objective
                  key={objective.id}
                  objective={objective}
                  onClick={() => setSelectedObjective(objective)}
                />
              ))}
              
              {/* Render ships on top */}
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
