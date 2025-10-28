import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useGenerateAIMoves = () => {
  return useMutation({
    mutationFn: async ({ gameId, shipId }: { gameId: string; shipId: string }) => {
      const { data, error } = await supabase.functions.invoke('generate-ai-move', {
        body: { gameId, shipId }
      });

      if (error) throw error;
      return data;
    },
  });
};