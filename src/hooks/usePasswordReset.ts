
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const usePasswordReset = (email: string, onSuccess: () => void) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const { toast } = useToast();

  const handleResetRequest = async () => {
    setIsLoading(true);
    try {
      // Use our custom email function for password reset
      const { data, error } = await supabase.functions.invoke('send-password-reset', {
        body: {
          email: email,
          resetUrl: `${window.location.origin}/auth/reset-password`
        }
      });

      if (error) {
        throw error;
      }

      setIsEmailSent(true);
      toast({
        title: "Password reset email sent",
        description: "Please check your email for password reset instructions.",
      });
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send password reset email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    isEmailSent,
    handleResetRequest,
  };
};
