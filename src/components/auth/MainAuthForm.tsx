
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface MainAuthFormProps {
  onStartAccountLookup: () => void;
}

const MainAuthForm = ({ onStartAccountLookup }: MainAuthFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const { toast } = useToast();

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

  return (
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
                onClick={onStartAccountLookup}
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
                onClick={onStartAccountLookup}
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
};

export default MainAuthForm;
