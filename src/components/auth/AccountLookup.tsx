
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Shield, User } from 'lucide-react';
import { useEmailCheck, useInitiateRecovery } from '@/hooks/useAccountRecovery';
import { useToast } from '@/hooks/use-toast';

interface AccountLookupProps {
  onPasswordReset: (email: string) => void;
  onSSOLink: (email: string, provider: string) => void;
  onProceedToSignup: (email: string) => void;
  onCancel: () => void;
}

const AccountLookup = ({ onPasswordReset, onSSOLink, onProceedToSignup, onCancel }: AccountLookupProps) => {
  const [email, setEmail] = useState('');
  const [hasChecked, setHasChecked] = useState(false);
  const { toast } = useToast();
  
  const { data: emailCheck, isLoading: isChecking, error: checkError } = useEmailCheck(email);
  const { mutate: initiateRecovery, isPending: isInitiatingRecovery } = useInitiateRecovery();

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setHasChecked(true);
    }
  };

  const handlePasswordReset = () => {
    initiateRecovery(
      { email, recoveryType: 'password_reset' },
      {
        onSuccess: (result) => {
          if (result.success) {
            toast({
              title: "Password reset sent",
              description: "Please check your email for password reset instructions.",
            });
            onPasswordReset(email);
          } else {
            toast({
              title: "Error",
              description: result.message,
              variant: "destructive",
            });
          }
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: "Failed to send password reset email. Please try again.",
            variant: "destructive",
          });
        }
      }
    );
  };

  const handleSSOLink = (provider: string) => {
    initiateRecovery(
      { email, recoveryType: 'sso_link' },
      {
        onSuccess: (result) => {
          if (result.success) {
            onSSOLink(email, provider);
          } else {
            toast({
              title: "Error",
              description: result.message,
              variant: "destructive",
            });
          }
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: "Failed to initiate SSO linking. Please try again.",
            variant: "destructive",
          });
        }
      }
    );
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
          <CardTitle className="text-2xl font-bold">Account Lookup</CardTitle>
          <CardDescription>
            Let's check if you already have an account with us
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
              disabled={isChecking || !email.trim()}
            >
              {isChecking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking...
                </>
              ) : (
                'Check Account'
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
              <Button 
                onClick={handlePasswordReset}
                className="w-full"
                disabled={isInitiatingRecovery}
              >
                {isInitiatingRecovery ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Reset Password'
                )}
              </Button>
            )}

            {emailCheck.suggested_providers.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium">Or sign in with:</div>
                {emailCheck.suggested_providers.map((provider) => (
                  <Button
                    key={provider}
                    onClick={() => handleSSOLink(provider)}
                    variant="outline"
                    className="w-full"
                    disabled={isInitiatingRecovery}
                  >
                    Sign in with {getProviderDisplayName(provider)}
                  </Button>
                ))}
              </div>
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
