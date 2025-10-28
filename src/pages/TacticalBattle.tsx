import React from 'react';
import { useParams } from 'react-router-dom';
import { BattleMap } from '@/components/tactical/BattleMap';
import { GMControls } from '@/components/tactical/GMControls';
import { MoveForm } from '@/components/tactical/MoveForm';
import { useTacticalGame } from '@/hooks/useTacticalGame';
import { useAuth } from '@/contexts/AuthContext';

const TacticalBattle = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const { user } = useAuth();
  const { game, ships } = useTacticalGame(gameId!);

  if (!gameId) {
    return (
      <div className="container mx-auto py-8">
        <p className="text-destructive">Invalid game ID</p>
      </div>
    );
  }

  // Find ships controlled by current user
  const userShips = ships.filter(ship => ship.captain_user_id === user?.id);

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">🎮 Tactical Battle</h1>
        {game && (
          <div className="text-sm text-muted-foreground">
            Turn {game.current_turn} - {game.phase}
          </div>
        )}
      </div>

      {/* Battle Map */}
      <BattleMap gameId={gameId} />

      <div className="grid md:grid-cols-2 gap-6">
        {/* Player Move Forms */}
        <div className="space-y-4">
          {userShips.map(ship => (
            <MoveForm
              key={ship.id}
              ship={ship}
              gameId={gameId}
              currentTurn={game?.current_turn || 1}
              isLocked={game?.is_locked || false}
            />
          ))}
        </div>

        {/* GM Controls */}
        <GMControls gameId={gameId} />
      </div>
    </div>
  );
};

export default TacticalBattle;
