import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface CreateDonorInput {
  first_name?: string;
  last_name?: string;
  email?: string;
  full_name?: string;
}

// Function to find an existing donor by email or auth_user_id
export const useFindExistingDonor = () => {
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ email }: { email: string }) => {
      if (!user) throw new Error('User not authenticated');
      
      // First try by auth_user_id
      const { data: donorByAuth, error: authError } = await supabase
        .from('donors')
        .select('*')
        .eq('auth_user_id', user.id)
        .maybeSingle();
        
      if (donorByAuth) return donorByAuth;
      
      // If not found by auth_user_id, try by email
      const { data: donorByEmail, error: emailError } = await supabase
        .from('donors')
        .select('*')
        .eq('email', email)
        .maybeSingle();
        
      if (donorByEmail) {
        // If found by email but not linked to auth, link it now
        if (!donorByEmail.auth_user_id) {
          const { data: updatedDonor, error: updateError } = await supabase
            .from('donors')
            .update({ auth_user_id: user.id })
            .eq('id', donorByEmail.id)
            .select()
            .single();
            
          if (updateError) throw updateError;
          return updatedDonor;
        }
        return donorByEmail;
      }
      
      return null;
    },
  });
};

export const useCreateDonorRecord = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (donorData?: CreateDonorInput) => {
      if (!user) throw new Error('User not authenticated');
      
      // Get email from user or donorData
      const email = donorData?.email || user.email;
      let fullName = donorData?.full_name;
      let firstName = donorData?.first_name;
      let lastName = donorData?.last_name;
      
      // If no full name provided but we have user metadata, use that
      if (!fullName && user.user_metadata?.full_name) {
        fullName = user.user_metadata.full_name;
      }
      
      // If we have a full name but no first/last name, try to split it
      if (fullName && (!firstName || !lastName)) {
        const nameParts = fullName.trim().split(' ');
        if (!firstName && nameParts.length > 0) {
          firstName = nameParts[0];
        }
        if (!lastName && nameParts.length > 1) {
          lastName = nameParts.slice(1).join(' ');
        }
      }
      
      const { data, error } = await supabase
        .from('donors')
        .insert({
          auth_user_id: user.id,
          email,
          first_name: firstName || null,
          last_name: lastName || null,
          full_name: fullName || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['user-profile', user?.id] });
    }
  });
};
