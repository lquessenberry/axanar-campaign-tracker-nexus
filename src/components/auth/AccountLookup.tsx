
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Shield, User } from 'lucide-react';
import { useEmailCheck } from '@/hooks/useAccountRecovery';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AccountLookupProps {
  onPasswordReset: (email: string) => void;
  onSSOLink: (email: string, provider: string) => void;
  onProceedToSignup: (email: string) => void;
  onCancel: () => void;
}

const AccountLookup = ({ onPasswordReset, onSSOLink, onProceedToSignup, onCancel }: AccountLookupProps) => {
  const [email, setEmail] = useState('');
  const [hasChecked, setHasChecked] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();
  
  const { data: emailCheck, isLoading: isChecking, error: checkError } = useEmailCheck(email);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setHasChecked(true);
    }
  };

  // Automatically send password reset when account with auth is found
  useEffect(() => {
    if (hasChecked && !isChecking && emailCheck?.exists_in_auth && !isProcessing && !emailSent) {
      setIsProcessing(true);
      setEmailSent(true);
      
      supabase.functions.invoke('send-password-reset', {
        body: {
          email: email.toLowerCase().trim(),
          redirectUrl: `${window.location.origin}`
        }
      }).then(({ error }) => {
        setIsProcessing(false);
        if (error) {
          console.error('Password reset error:', error);
          toast({
            title: "Error",
            description: "Failed to send password reset email. Please try again.",
            variant: "destructive",
          });
          setEmailSent(false); // Allow retry on error
        } else {
          toast({
            title: "Password reset email sent",
            description: "Please check your email for password reset instructions.",
          });
          onPasswordReset(email);
        }
      });
    }
  }, [hasChecked, isChecking, emailCheck, isProcessing, emailSent, email, toast, onPasswordReset]);

  const handleSSOLink = (provider: string) => {
    // For SSO linking, we still use the database function since it doesn't send emails
    onSSOLink(email, provider);
  };

  const getProviderDisplayName = (provider: string) => {
    const names: Record<string, string> = {
      google: 'Google',
      microsoft: 'Microsoft',
      yahoo: 'Yahoo'
    };
    return names[provider] || provider;
  };

  if (!hasChecked) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Reset Your Password</CardTitle>
          <CardDescription>
            Enter your email to receive password reset instructions
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-axanar-teal hover:bg-axanar-teal/90"
              disabled={isChecking || isProcessing || emailSent || !email.trim()}
            >
              {isChecking || isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isProcessing ? 'Sending Reset Email...' : 'Checking...'}
                </>
              ) : emailSent ? (
                'Email Sent'
              ) : (
                'Send Password Reset Email'
              )}
            </Button>
            
            <Button 
              type="button" 
              variant="ghost" 
              className="w-full"
              onClick={onCancel}
            >
              Back to Sign In
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  if (checkError) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>
              Failed to check account status. Please try again.
            </AlertDescription>
          </Alert>
          <Button 
            onClick={() => setHasChecked(false)} 
            className="w-full mt-4"
            variant="outline"
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!emailCheck) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Loading...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasExistingAccount = emailCheck.exists_in_auth || emailCheck.exists_in_donors;

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">
          {hasExistingAccount ? 'Account Found' : 'No Account Found'}
        </CardTitle>
        <CardDescription>
          {hasExistingAccount 
            ? 'We found an existing account with this email'
            : 'You can create a new account with this email'
          }
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
          <div className="font-medium mb-2">Account Status:</div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>Auth Account: {emailCheck.exists_in_auth ? '✓ Yes' : '✗ No'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span>Donor Record: {emailCheck.exists_in_donors ? '✓ Yes' : '✗ No'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>Linked: {emailCheck.has_auth_link ? '✓ Yes' : '✗ No'}</span>
            </div>
          </div>
        </div>

        {hasExistingAccount && (
          <div className="space-y-3">
            {emailCheck.exists_in_auth && (
              <Alert>
                <AlertDescription>
                  A password reset email has been sent to your inbox. Please check your email to continue.
                </AlertDescription>
              </Alert>
            )}

            {emailCheck.exists_in_donors && !emailCheck.exists_in_auth && (
              <div className="pt-2 border-t">
                <div className="text-sm text-muted-foreground mb-2">
                  Your donor record exists but you don't have an active account.
                </div>
                <Button 
                  onClick={() => onProceedToSignup(email)}
                  variant="outline"
                  className="w-full"
                >
                  Activate Account
                </Button>
              </div>
            )}
          </div>
        )}

        {!hasExistingAccount && (
          <Button 
            onClick={() => onProceedToSignup(email)}
            className="w-full bg-axanar-teal hover:bg-axanar-teal/90"
          >
            Create New Account
          </Button>
        )}

        <Button 
          onClick={() => setHasChecked(false)}
          variant="ghost"
          className="w-full"
        >
          Check Different Email
        </Button>
      </CardContent>
    </Card>
  );
};

export default AccountLookup;
