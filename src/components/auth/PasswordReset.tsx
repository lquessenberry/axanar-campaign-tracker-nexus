
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface PasswordResetProps {
  email: string;
  onBack: () => void;
  onSuccess: () => void;
}

const PasswordReset = ({ email, onBack, onSuccess }: PasswordResetProps) => {
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

  if (!isEmailSent) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
          <CardDescription>
            We'll send a password reset link to {email}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Click the button below to receive a password reset email. You'll be able to set a new password by following the link in the email.
            </AlertDescription>
          </Alert>

          <Button 
            onClick={handleResetRequest}
            className="w-full bg-axanar-teal hover:bg-axanar-teal/90"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending Reset Email...
              </>
            ) : (
              'Send Password Reset Email'
            )}
          </Button>
          
          <Button 
            onClick={onBack}
            variant="ghost"
            className="w-full"
          >
            Back to Account Lookup
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Check Your Email</CardTitle>
        <CardDescription>
          We've sent a password reset link to {email}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Please check your email and click the reset link. If you can't find the email, check your spam folder.
          </AlertDescription>
        </Alert>

        <div className="pt-4 border-t">
          <div className="text-sm font-medium mb-4">Or set a new password now:</div>
          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-axanar-teal hover:bg-axanar-teal/90"
              disabled={isLoading || !password || !confirmPassword}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating Password...
                </>
              ) : (
                'Update Password'
              )}
            </Button>
          </form>
        </div>
        
        <Button 
          onClick={onBack}
          variant="ghost"
          className="w-full"
        >
          Back to Account Lookup
        </Button>
      </CardContent>
    </Card>
  );
};

export default PasswordReset;
