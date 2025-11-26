import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export function useSeedForumThreads() {
  const [isSeeding, setIsSeeding] = useState(false);

  const seedThreads = async () => {
    setIsSeeding(true);
    try {
      const { data, error } = await supabase.functions.invoke('seed-forum-threads', {
        method: 'POST'
      });

      if (error) throw error;

      toast({
        title: 'Success!',
        description: data.message || 'Forum threads seeded successfully',
      });

      console.log('Seed result:', data);
      return data;
    } catch (error) {
      console.error('Error seeding threads:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to seed forum threads',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsSeeding(false);
    }
  };

  return { seedThreads, isSeeding };
}
