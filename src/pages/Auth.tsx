
import { useState, useEffect } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { safeFrom } from "@/types/database";

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [returnTo, setReturnTo] = useState<string>("/");
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const { user, signIn, signUp } = useAuth();
  const { toast } = useToast();
  const location = useLocation();

  // Check for returnTo path in location state when component mounts
  useEffect(() => {
    // Extract the returnTo path from location state if it exists
    const state = location.state as { from?: string };
    if (state?.from && state.from !== "/auth") {
      setReturnTo(state.from);
    }
  }, [location]);

  // Redirect if already authenticated - to the returnTo path if available
  if (user) {
    return <Navigate to={returnTo} replace />;
  }

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;

      console.log('Attempting direct Supabase sign-in with:', { email });

      // Use direct Supabase sign-in and bypass the context
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        setIsLoading(false);
      } else {
        console.log('Sign in successful, user:', data.user);
        toast({
          title: "Welcome back!",
          description: "You've been signed in successfully.",
        });

        // Handle special case for Lee's test account
        if (email === 'lquessenberry@gmail.com') {
          console.log('Special handling for Lee\'s account');
          // Check if we need to link the donor profile using safeFrom helper
          const { data: leeProfile } = await safeFrom(supabase, 'donors')
            .select('id')
            .eq('email', 'lee@bbqberry.com')
            .maybeSingle();
            
          if (leeProfile) {
            console.log('Found Lee\'s donor profile:', leeProfile.id);
            // Update the auth profile with the donor profile link
            await supabase
              .from('profiles')
              .update({ donor_profile_id: leeProfile.id })
              .eq('id', data.user.id);
          }
        }
        
        // After a short delay to allow toasts to be seen, redirect
        setTimeout(() => {
          // Force reload to ensure a fresh authentication state
          window.location.href = '/dashboard';
        }, 500);
      }
    } catch (error) {
      console.error('Sign in exception:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred during sign in",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: window.location.origin + '/reset-password',
      });
      
      if (error) {
        console.error('Password reset error:', error);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setResetSent(true);
        toast({
          title: "Password Reset Email Sent",
          description: "Check your email for a link to reset your password.",
        });
      }
    } catch (error) {
      console.error('Password reset exception:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred during password reset",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      {/* Password Reset Dialog */}
      {showResetPassword && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="text-xl text-center">Reset Your Password</CardTitle>
              <CardDescription className="text-center">
                {resetSent ? 
                  "Check your email for a password reset link" : 
                  "Enter your email address and we'll send you a link to reset your password"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!resetSent ? (
                <form onSubmit={handlePasswordReset} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reset-email">Email</Label>
                    <Input
                      id="reset-email"
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setShowResetPassword(false)}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-axanar-teal hover:bg-axanar-teal/90"
                      disabled={isLoading}
                    >
                      {isLoading ? "Sending..." : "Send Reset Link"}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="text-center space-y-4">
                  <p>We've sent a password reset link to {resetEmail}</p>
                  <Button
                    type="button"
                    className="bg-axanar-teal hover:bg-axanar-teal/90"
                    onClick={() => {
                      setShowResetPassword(false);
                      setResetSent(false);
                      setResetEmail("");
                    }}
                  >
                    Back to Sign In
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
      
      <main className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Join Axanar</CardTitle>
            <CardDescription>
              Sign in to your account or create a new one
            </CardDescription>
            
            {/* Special message for returning donors */}
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md text-sm text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800">
              <p className="font-medium">Returning Donor?</p>
              <p className="mt-1">If you've donated to Axanar before, you can sign in with your email address. First time signing in? Use the "Forgot password" option to set up your password.</p>
            </div>
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
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
                  
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setShowResetPassword(true)}
                      className="text-sm text-axanar-teal hover:underline mt-2"
                    >
                      Forgot your password?
                    </button>
                  </div>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-fullname">Full Name</Label>
                    <Input
                      id="signup-fullname"
                      name="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-username">Username</Label>
                    <Input
                      id="signup-username"
                      name="username"
                      type="text"
                      placeholder="Choose a username"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
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
                </form>
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
      </main>
      
      <Footer />
    </div>
  );
};

export default Auth;
