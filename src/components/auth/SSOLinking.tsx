
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ExternalLink, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SSOLinkingProps {
  email: string;
  provider: string;
  onBack: () => void;
  onSuccess: () => void;
}

const SSOLinking = ({ email, provider, onBack, onSuccess }: SSOLinkingProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isWaitingForRedirect, setIsWaitingForRedirect] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user was successfully authenticated via SSO
    if (user) {
      toast({
        title: "Account linked successfully",
        description: `Your account has been linked with ${getProviderDisplayName(provider)}.`,
      });
      onSuccess();
    }
  }, [user, provider, onSuccess, toast]);

  const getProviderDisplayName = (provider: string) => {
    const names: Record<string, string> = {
      google: 'Google',
      microsoft: 'Microsoft',
      yahoo: 'Yahoo'
    };
    return names[provider] || provider;
  };

  const getProviderIcon = (provider: string) => {
    // In a real implementation, you would use actual provider icons
    return <ExternalLink className="h-4 w-4" />;
  };

  const handleSSOSignIn = async () => {
    setIsLoading(true);
    setIsWaitingForRedirect(true);
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider as any,
        options: {
          redirectTo: `${window.location.origin}/auth`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
            // Pass email to verify it matches
            login_hint: email
          }
        }
      });

      if (error) {
        throw error;
      }

      // The user will be redirected to the provider's login page
      // When they return, the useEffect above will handle the success case
    } catch (error: any) {
      setIsLoading(false);
      setIsWaitingForRedirect(false);
      toast({
        title: "Error",
        description: error.message || `Failed to initiate ${getProviderDisplayName(provider)} sign-in.`,
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Link with {getProviderDisplayName(provider)}</CardTitle>
        <CardDescription>
          Link your account ({email}) with {getProviderDisplayName(provider)}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            We found that your email is associated with {getProviderDisplayName(provider)}. 
            You can securely link your account by signing in with {getProviderDisplayName(provider)}.
          </AlertDescription>
        </Alert>

        {isWaitingForRedirect && (
          <Alert>
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertDescription>
              Redirecting to {getProviderDisplayName(provider)}...
              Please complete the sign-in process in the new window or tab.
            </AlertDescription>
          </Alert>
        )}

        <Button 
          onClick={handleSSOSignIn}
          className="w-full bg-axanar-teal hover:bg-axanar-teal/90"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              {getProviderIcon(provider)}
              <span className="ml-2">Sign in with {getProviderDisplayName(provider)}</span>
            </>
          )}
        </Button>

        <div className="text-sm text-muted-foreground text-center">
          <p>This will securely verify your identity and link your existing account.</p>
        </div>
        
        <Button 
          onClick={onBack}
          variant="ghost"
          className="w-full"
          disabled={isLoading}
        >
          Back to Account Lookup
        </Button>
      </CardContent>
    </Card>
  );
};

export default SSOLinking;
