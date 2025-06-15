
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const usePasswordReset = (email: string, onSuccess: () => void) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const { signIn } = useAuth();
  const { toast } = useToast();

  const handleResetRequest = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, you would call Supabase's password reset
      // For now, we'll simulate the email being sent
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsEmailSent(true);
      toast({
        title: "Password reset email sent",
        description: "Please check your email for password reset instructions.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send password reset email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // In a real implementation, you would handle the password update here
      // For now, we'll simulate success and sign the user in
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const { error } = await signIn(email, password);
      if (error) {
        throw error;
      }
      
      toast({
        title: "Password updated successfully",
        description: "You have been signed in with your new password.",
      });
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    isLoading,
    isEmailSent,
    handleResetRequest,
    handlePasswordUpdate,
  };
};
