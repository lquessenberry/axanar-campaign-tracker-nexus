import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MigrationResult {
  totalProcessed: number;
  createdUsers: number;
  linkedExisting: number;
  errors: number;
  success: boolean;
}

export const useDonorMigration = () => {
  return useMutation({
    mutationFn: async (): Promise<MigrationResult> => {
      const { data, error } = await supabase.functions.invoke('migrate-donors-to-users');
      
      if (error) {
        throw new Error(error.message || 'Migration failed');
      }
      
      return data;
    },
    onSuccess: (data) => {
      toast.success(
        `Migration completed! Created ${data.createdUsers} users, linked ${data.linkedExisting} existing users. ${data.errors > 0 ? `${data.errors} errors occurred.` : ''}`
      );
    },
    onError: (error) => {
      console.error('Migration error:', error);
      toast.error(`Migration failed: ${error.message}`);
    },
  });
};