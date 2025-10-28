import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubmitMove } from '@/hooks/useTacticalGame';
import { TacticalShip } from '@/types/tactical';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface MoveFormProps {
  ship: TacticalShip;
  gameId: string;
  currentTurn: number;
  isLocked: boolean;
}

export const MoveForm: React.FC<MoveFormProps> = ({ 
  ship, 
  gameId, 
  currentTurn, 
  isLocked 
}) => {
  const { user } = useAuth();
  const submitMove = useSubmitMove();
  const [action1, setAction1] = useState('');
  const [action2, setAction2] = useState('');
  const [diceUrl, setDiceUrl] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('You must be logged in to submit moves');
      return;
    }

    if (isLocked) {
      toast.error('Turn is locked. Wait for GM to unlock.');
      return;
    }

    const actions = [
      action1 && JSON.parse(action1),
      action2 && JSON.parse(action2),
    ].filter(Boolean);

    try {
      await submitMove.mutateAsync({
        game_id: gameId,
        ship_id: ship.id,
        turn: currentTurn,
        player_user_id: user.id,
        actions,
        dice_roll_url: diceUrl || undefined,
        status: 'pending',
      });

      toast.success('Move submitted! Waiting for GM resolution.');
      setAction1('');
      setAction2('');
      setDiceUrl('');
    } catch (error) {
      toast.error('Failed to submit move');
      console.error(error);
    }
  };

  // Only show form if user is the captain of this ship
  if (user?.id !== ship.captain_user_id) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>🎯 {ship.name} - Turn {currentTurn}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Action 1</Label>
            <select
              className="w-full p-2 border rounded bg-background"
              value={action1}
              onChange={(e) => setAction1(e.target.value)}
              required
            >
              <option value="">Select action...</option>
              <option value={JSON.stringify({ type: 'move', data: { speed: ship.speed } })}>
                Move (Speed: {ship.speed})
              </option>
              <option value={JSON.stringify({ type: 'fire_phaser' })}>
                Fire Phasers
              </option>
              <option value={JSON.stringify({ type: 'fire_torpedo' })}>
                Fire Photon Torpedo
              </option>
              <option value={JSON.stringify({ type: 'raise_shields', data: { amount: 10 } })}>
                Raise Shields (+10)
              </option>
              <option value={JSON.stringify({ type: 'scan' })}>
                Sensor Scan
              </option>
            </select>
          </div>

          <div>
            <Label>Action 2 (Optional)</Label>
            <select
              className="w-full p-2 border rounded bg-background"
              value={action2}
              onChange={(e) => setAction2(e.target.value)}
            >
              <option value="">No second action</option>
              <option value={JSON.stringify({ type: 'fire_phaser' })}>
                Fire Phasers (Starboard)
              </option>
              <option value={JSON.stringify({ type: 'evasive' })}>
                Evasive Maneuvers
              </option>
            </select>
          </div>

          <div>
            <Label>Dice Roll URL (Optional)</Label>
            <Input
              type="url"
              placeholder="https://rpgle.net/..."
              value={diceUrl}
              onChange={(e) => setDiceUrl(e.target.value)}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={submitMove.isPending || isLocked}
          >
            {submitMove.isPending ? 'Submitting...' : 'Submit Move'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
