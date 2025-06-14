import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import AccountLookup from "@/components/auth/AccountLookup";
import PasswordReset from "@/components/auth/PasswordReset";
import SSOLinking from "@/components/auth/SSOLinking";
import MouseTracker from "@/components/auth/MouseTracker";

type AuthFlow = 'main' | 'lookup' | 'password-reset' | 'sso-linking' | 'signup-confirmed';

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [authFlow, setAuthFlow] = useState<AuthFlow>('main');
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [ssoProvider, setSsoProvider] = useState('');
  const { user, signIn, signUp } = useAuth();
  const { toast } = useToast();

  // Redirect if already authenticated
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const { error } = await signIn(email, password);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Welcome back!",
        description: "You've been signed in successfully.",
      });
    }

    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const fullName = formData.get("fullName") as string;
    const username = formData.get("username") as string;

    const { error } = await signUp(email, password, {
      full_name: fullName,
      username: username,
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Account created!",
        description: "You've been signed up successfully.",
      });
    }

    setIsLoading(false);
  };

  const handleStartAccountLookup = () => {
    setAuthFlow('lookup');
  };

  const handlePasswordReset = (email: string) => {
    setRecoveryEmail(email);
    setAuthFlow('password-reset');
  };

  const handleSSOLink = (email: string, provider: string) => {
    setRecoveryEmail(email);
    setSsoProvider(provider);
    setAuthFlow('sso-linking');
  };

  const handleProceedToSignup = (email: string) => {
    setRecoveryEmail(email);
    setAuthFlow('signup-confirmed');
  };

  const handleBackToMain = () => {
    setAuthFlow('main');
    setRecoveryEmail('');
    setSsoProvider('');
  };

  const handleAuthSuccess = () => {
    // User should be redirected automatically by the auth context
    setAuthFlow('main');
  };

  const renderMainAuth = () => (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Join Axanar</CardTitle>
        <CardDescription>
          Sign in to your account or check for existing account
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Account Lookup</TabsTrigger>
          </TabsList>
          
          <TabsContent value="signin">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email">Email</Label>
                <Input
                  id="signin-email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="signin-password">Password</Label>
                <Input
                  id="signin-password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-axanar-teal hover:bg-axanar-teal/90"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={handleStartAccountLookup}
              >
                Forgot password or need help?
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="signup">
            <div className="space-y-4">
              <div className="text-center p-4 bg-muted rounded-md">
                <p className="text-sm text-muted-foreground">
                  This is an invite-only platform. Check if you already have an account or if you're eligible to create one.
                </p>
              </div>
              
              <Button 
                onClick={handleStartAccountLookup}
                className="w-full bg-axanar-teal hover:bg-axanar-teal/90"
              >
                Check for Existing Account
              </Button>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="mt-6 text-center">
          <Link 
            to="/" 
            className="text-sm text-muted-foreground hover:text-axanar-teal"
          >
            Back to home
          </Link>
        </div>
      </CardContent>
    </Card>
  );

  const renderConfirmedSignup = () => (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
        <CardDescription>
          Complete your account setup for {recoveryEmail}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSignUp} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="confirmed-fullname">Full Name</Label>
            <Input
              id="confirmed-fullname"
              name="fullName"
              type="text"
              placeholder="Enter your full name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmed-username">Username</Label>
            <Input
              id="confirmed-username"
              name="username"
              type="text"
              placeholder="Choose a username"
              required
            />
          </div>
          
          <input type="hidden" name="email" value={recoveryEmail} />
          
          <div className="space-y-2">
            <Label htmlFor="confirmed-password">Password</Label>
            <Input
              id="confirmed-password"
              name="password"
              type="password"
              placeholder="Create a password"
              required
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-axanar-teal hover:bg-axanar-teal/90"
            disabled={isLoading}
          >
            {isLoading ? "Creating account..." : "Create Account"}
          </Button>
          
          <Button 
            type="button"
            variant="ghost"
            className="w-full"
            onClick={handleBackToMain}
          >
            Back to Account Lookup
          </Button>
        </form>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-900 via-gray-800 to-black relative overflow-hidden">
      <MouseTracker />
      
      {/* Background grid effect */}
      <div className="absolute inset-0 opacity-5">
        <div className="grid grid-cols-20 grid-rows-12 h-full w-full">
          {Array.from({ length: 240 }).map((_, i) => (
            <div key={i} className="border border-axanar-teal/20"></div>
          ))}
        </div>
      </div>

      <Navigation />
      
      <main className="flex-grow flex items-center justify-center px-4 py-16 relative z-10">
        {authFlow === 'main' && renderMainAuth()}
        {authFlow === 'lookup' && (
          <AccountLookup
            onPasswordReset={handlePasswordReset}
            onSSOLink={handleSSOLink}
            onProceedToSignup={handleProceedToSignup}
            onCancel={handleBackToMain}
          />
        )}
        {authFlow === 'password-reset' && (
          <PasswordReset
            email={recoveryEmail}
            onBack={handleBackToMain}
            onSuccess={handleAuthSuccess}
          />
        )}
        {authFlow === 'sso-linking' && (
          <SSOLinking
            email={recoveryEmail}
            provider={ssoProvider}
            onBack={handleBackToMain}
            onSuccess={handleAuthSuccess}
          />
        )}
        {authFlow === 'signup-confirmed' && renderConfirmedSignup()}
      </main>
      
      <Footer />
    </div>
  );
};

export default Auth;
