import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Rocket, Loader2 } from 'lucide-react';

export const DemoGameCreator: React.FC = () => {
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const createDemoGame = async () => {
    setIsCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-demo-tactical-game');

      if (error) throw error;

      toast({
        title: '🎮 Demo Game Created!',
        description: `${data.ships_count} ships ready for battle`,
      });

      // Navigate to the new game
      navigate(`/tactical/${data.game_id}`);
    } catch (error) {
      console.error('Error creating demo game:', error);
      toast({
        title: 'Error',
        description: 'Failed to create demo game. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Rocket className="h-5 w-5" />
          Tactical Battle Demo
        </CardTitle>
        <CardDescription>
          Create a demo game with Federation vs Klingon ships to test the tactical battle system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={createDemoGame} 
          disabled={isCreating}
          size="lg"
          className="w-full"
        >
          {isCreating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Battle...
            </>
          ) : (
            <>
              <Rocket className="mr-2 h-4 w-4" />
              Create Demo Battle
            </>
          )}
        </Button>
        
        <div className="mt-4 text-sm text-muted-foreground">
          <p className="font-semibold mb-2">Demo includes:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>USS Dauntless (Ares-class)</li>
            <li>USS Enterprise (Constitution-class)</li>
            <li>IKS Predator (D7-class)</li>
            <li>IKS Vengeance (D6-class)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
