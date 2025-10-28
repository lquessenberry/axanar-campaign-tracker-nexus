import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TacticalGame, TacticalShip, TacticalMove, TacticalEvent } from '@/types/tactical';
import { useEffect } from 'react';

export const useTacticalGame = (gameId: string) => {
  const queryClient = useQueryClient();

  // Fetch game state
  const { data: game, isLoading } = useQuery({
    queryKey: ['tactical-game', gameId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tactical_games')
        .select('*')
        .eq('id', gameId)
        .single();
      
      if (error) throw error;
      return data as TacticalGame;
    },
    enabled: !!gameId,
  });

  // Fetch ships
  const { data: ships = [] } = useQuery({
    queryKey: ['tactical-ships', gameId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tactical_ships')
        .select('*')
        .eq('game_id', gameId)
        .order('created_at');
      
      if (error) throw error;
      return data as TacticalShip[];
    },
    enabled: !!gameId,
  });

  // Fetch pending moves
  const { data: pendingMoves = [] } = useQuery({
    queryKey: ['tactical-moves', gameId, game?.current_turn],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tactical_moves')
        .select('*, tactical_ships(name), profiles(username)')
        .eq('game_id', gameId)
        .eq('turn', game?.current_turn || 1)
        .eq('status', 'pending');
      
      if (error) throw error;
      return data as any[];
    },
    enabled: !!gameId && !!game,
  });

  // Subscribe to real-time updates
  useEffect(() => {
    if (!gameId) return;

    const channel = supabase
      .channel(`tactical-${gameId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tactical_games',
        filter: `id=eq.${gameId}`,
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['tactical-game', gameId] });
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tactical_ships',
        filter: `game_id=eq.${gameId}`,
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['tactical-ships', gameId] });
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tactical_moves',
        filter: `game_id=eq.${gameId}`,
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['tactical-moves', gameId, game?.current_turn] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId, game?.current_turn, queryClient]);

  return {
    game,
    ships,
    pendingMoves,
    isLoading,
  };
};

export const useSubmitMove = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (move: Omit<TacticalMove, 'id' | 'submitted_at' | 'resolved_at'>) => {
      const { data, error } = await supabase
        .from('tactical_moves')
        .insert([{
          ...move,
          actions: move.actions as any, // Cast to satisfy Supabase Json type
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tactical-moves', variables.game_id] });
    },
  });
};

export const useResolveMove = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      moveId, 
      gameId, 
      outcome 
    }: { 
      moveId: string; 
      gameId: string; 
      outcome: any;
    }) => {
      // Create event for animation
      if (outcome.event) {
        await supabase.from('tactical_events').insert({
          game_id: gameId,
          ...outcome.event,
        });
      }

      // Update ship if damage/changes
      if (outcome.shipUpdate) {
        await supabase
          .from('tactical_ships')
          .update(outcome.shipUpdate)
          .eq('id', outcome.shipId);
      }

      // Mark move as resolved
      const { error } = await supabase
        .from('tactical_moves')
        .update({ 
          status: 'resolved', 
          resolved_at: new Date().toISOString() 
        })
        .eq('id', moveId);
      
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tactical-moves', variables.gameId] });
      queryClient.invalidateQueries({ queryKey: ['tactical-ships', variables.gameId] });
    },
  });
};

export const useEndTurn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ gameId, currentTurn }: { gameId: string; currentTurn: number }) => {
      const { error } = await supabase
        .from('tactical_games')
        .update({ 
          current_turn: currentTurn + 1, 
          is_locked: false 
        })
        .eq('id', gameId);
      
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tactical-game', variables.gameId] });
    },
  });
};
