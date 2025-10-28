import React from 'react';
import { useResolveMove, useEndTurn, useTacticalGame } from '@/hooks/useTacticalGame';
import { useGenerateAIMoves } from '@/hooks/useGenerateAIMoves';
import { useRebuildTacticalGame } from '@/hooks/useRebuildTacticalGame';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAdminCheck } from '@/hooks/useAdminCheck';

interface GMControlsProps {
  gameId: string;
}

export const GMControls: React.FC<GMControlsProps> = ({ gameId }) => {
  const { data: isAdmin } = useAdminCheck();
  const { game, ships, pendingMoves } = useTacticalGame(gameId);
  const resolveMove = useResolveMove();
  const endTurn = useEndTurn();
  const generateAIMove = useGenerateAIMoves();
  const rebuildGame = useRebuildTacticalGame();

  if (!isAdmin || !game) return null;

  // Find AI-controlled ships (no captain_user_id)
  const aiShips = ships.filter(ship => !ship.captain_user_id && ship.status === 'active');

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

  const handleGenerateAIMoves = async () => {
    if (aiShips.length === 0) {
      toast.info('No AI ships to generate moves for');
      return;
    }

    try {
      toast.loading(`Generating moves for ${aiShips.length} AI ships...`);
      
      for (const ship of aiShips) {
        await generateAIMove.mutateAsync({
          gameId,
          shipId: ship.id,
        });
      }
      
      toast.success(`Generated ${aiShips.length} AI moves!`);
    } catch (error) {
      toast.error('Failed to generate AI moves');
      console.error(error);
    }
  };

  const handleRebuildGame = async () => {
    try {
      await rebuildGame.mutateAsync(gameId);
      toast.success('Game rebuilt! Reloading...');
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      toast.error('Failed to rebuild game');
      console.error(error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>🎮 GM Controls - Turn {game.current_turn}</span>
          <Button
            size="sm"
            variant="destructive"
            onClick={handleRebuildGame}
            disabled={rebuildGame.isPending}
          >
            {rebuildGame.isPending ? 'Rebuilding...' : '🔄 Rebuild Game'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Pending Moves: {pendingMoves.length} | AI Ships: {aiShips.length}
        </div>

        {aiShips.length > 0 && (
          <Button
            className="w-full"
            variant="secondary"
            onClick={handleGenerateAIMoves}
            disabled={generateAIMove.isPending}
          >
            {generateAIMove.isPending ? 'Generating...' : '🤖 Generate AI Moves'}
          </Button>
        )}

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
