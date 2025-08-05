
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface EmailCheckResult {
  exists_in_auth: boolean;
  exists_in_donors: boolean;
  has_auth_link: boolean;
  auth_user_id: string | null;
  donor_id: string | null;
  suggested_providers: string[];
}

// RecoveryResult interface removed as it's no longer needed

export const useEmailCheck = (email: string) => {
  return useQuery({
    queryKey: ['email-check', email.toLowerCase().trim()],
    queryFn: async () => {
      const normalizedEmail = email.toLowerCase().trim();
      if (!normalizedEmail || !normalizedEmail.includes('@')) {
        return null;
      }

      const { data, error } = await supabase
        .rpc('check_email_in_system', { check_email: normalizedEmail });

      if (error) throw error;
      return data?.[0] as EmailCheckResult | null;
    },
    enabled: !!email && email.includes('@'),
  });
};

// Note: useInitiateRecovery removed as it's redundant with send-password-reset edge function
// The send-password-reset edge function handles both token generation and email sending

export const useValidateRecoveryToken = () => {
  return useMutation({
    mutationFn: async ({ 
      token, 
      email 
    }: { 
      token: string; 
      email: string 
    }) => {
      const { data, error } = await supabase
        .rpc('validate_recovery_token', {
          token: token,
          user_email: email.toLowerCase().trim()
        });

      if (error) throw error;
      return data?.[0];
    },
  });
};
