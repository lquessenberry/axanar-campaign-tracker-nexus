import React from 'react';
import { useResolveMove, useEndTurn, useTacticalGame } from '@/hooks/useTacticalGame';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAdminCheck } from '@/hooks/useAdminCheck';

interface GMControlsProps {
  gameId: string;
}

export const GMControls: React.FC<GMControlsProps> = ({ gameId }) => {
  const { data: isAdmin } = useAdminCheck();
  const { game, pendingMoves } = useTacticalGame(gameId);
  const resolveMove = useResolveMove();
  const endTurn = useEndTurn();

  if (!isAdmin || !game) return null;

  const handleResolveMove = async (moveId: string, outcome: any) => {
    try {
      await resolveMove.mutateAsync({
        moveId,
        gameId,
        outcome,
      });
      toast.success('Move resolved!');
    } catch (error) {
      toast.error('Failed to resolve move');
      console.error(error);
    }
  };

  const handleEndTurn = async () => {
    if (pendingMoves.length > 0) {
      toast.error('Resolve all pending moves before ending turn');
      return;
    }

    try {
      await endTurn.mutateAsync({
        gameId,
        currentTurn: game.current_turn,
      });
      toast.success('Turn ended! Next turn started.');
    } catch (error) {
      toast.error('Failed to end turn');
      console.error(error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>🎮 GM Controls - Turn {game.current_turn}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Pending Moves: {pendingMoves.length}
        </div>

        <div className="space-y-3">
          {pendingMoves.map((move: any) => (
            <div key={move.id} className="border rounded p-3 space-y-2">
              <h4 className="font-medium">
                {move.tactical_ships?.name} ({move.player_username || 'Unknown'})
              </h4>
              <div className="text-sm text-muted-foreground">
                Actions: {JSON.stringify(move.actions)}
              </div>
              {move.dice_roll_url && (
                <a
                  href={move.dice_roll_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  View Dice Roll →
                </a>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  onClick={() => handleResolveMove(move.id, {
                    event: {
                      turn: game.current_turn,
                      event_type: 'damage',
                      source_ship_id: move.ship_id,
                      data: { damage: 15 },
                    },
                  })}
                >
                  Apply Damage
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleResolveMove(move.id, {
                    event: {
                      turn: game.current_turn,
                      event_type: 'move',
                      source_ship_id: move.ship_id,
                    },
                  })}
                >
                  Resolve
                </Button>
              </div>
            </div>
          ))}
        </div>

        <Button
          className="w-full"
          onClick={handleEndTurn}
          disabled={pendingMoves.length > 0 || endTurn.isPending}
        >
          {endTurn.isPending ? 'Ending Turn...' : '🔚 End Turn'}
        </Button>
      </CardContent>
    </Card>
  );
};
