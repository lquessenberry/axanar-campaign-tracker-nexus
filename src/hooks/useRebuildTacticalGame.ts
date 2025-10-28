import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useRebuildTacticalGame = () => {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (gameId: string) => {
      const { data, error } = await supabase.functions.invoke('rebuild-tactical-game', {
        body: { gameId, userId: user?.id }
      });

      if (error) throw error;
      return data;
    },
  });
};
