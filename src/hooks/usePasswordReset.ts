
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
      // Call the edge function directly - this handles both token generation and email sending
      const { data, error } = await supabase.functions.invoke('send-password-reset', {
        body: {
          email: email,
          redirectUrl: `${window.location.origin}`
        }
      });

      if (error) {
        throw error;
      }

      // Check for rate limit response
      if (data?.error && data?.retryAfter) {
        toast({
          title: "Too many attempts",
          description: `Please wait ${data.retryAfter} before trying again.`,
          variant: "destructive",
        });
        return;
      }

      setIsEmailSent(true);
      toast({
        title: "Password reset email sent",
        description: "Please check your email for password reset instructions.",
      });
    } catch (error: any) {
      console.error('Password reset error:', error);
      
      // Handle rate limiting error
      if (error.message?.includes('429') || error.message?.includes('Too many')) {
        toast({
          title: "Too many attempts",
          description: "You've requested too many password resets. Please try again in 1 hour.",
          variant: "destructive",
        });
        return;
      }
      
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
