
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useSuperAdminCheck = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['super-admin-check', user?.id],
    queryFn: async () => {
      if (!user) return false;
      
      const { data, error } = await supabase.rpc('check_user_is_super_admin_safe', { user_uuid: user.id });
      
      if (error) {
        console.error('Error checking super admin status:', error);
        return false;
      }
      
      return data === true;
    },
    enabled: !!user,
  });
};
