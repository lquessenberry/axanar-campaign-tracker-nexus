
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

interface RecoveryResult {
  recovery_token: string | null;
  expires_at: string | null;
  success: boolean;
  message: string;
}

export const useEmailCheck = (email: string) => {
  return useQuery({
    queryKey: ['email-check', email],
    queryFn: async () => {
      if (!email || !email.includes('@')) {
        return null;
      }

      const { data, error } = await supabase
        .rpc('check_email_in_system', { check_email: email });

      if (error) throw error;
      return data?.[0] as EmailCheckResult | null;
    },
    enabled: !!email && email.includes('@'),
  });
};

export const useInitiateRecovery = () => {
  return useMutation({
    mutationFn: async ({ 
      email, 
      recoveryType 
    }: { 
      email: string; 
      recoveryType: 'password_reset' | 'sso_link' | 'account_verification' 
    }) => {
      const { data, error } = await supabase
        .rpc('initiate_account_recovery', {
          user_email: email,
          recovery_type: recoveryType,
          client_ip: null, // Could be enhanced to get real IP
          client_user_agent: navigator.userAgent
        });

      if (error) throw error;
      return data?.[0] as RecoveryResult;
    },
  });
};

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
          user_email: email
        });

      if (error) throw error;
      return data?.[0];
    },
  });
};
