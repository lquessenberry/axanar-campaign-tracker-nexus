
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useAdminCheck = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['admin-check', user?.id],
    queryFn: async () => {
      if (!user) return { isAdmin: false, isSuperAdmin: false };
      
      const { data, error } = await supabase
        .from('admin_users')
        .select('is_super_admin, is_content_manager')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return {
        isAdmin: !!data,
        isSuperAdmin: data?.is_super_admin || false,
        isContentManager: data?.is_content_manager || false
      };
    },
    enabled: !!user,
  });
};
