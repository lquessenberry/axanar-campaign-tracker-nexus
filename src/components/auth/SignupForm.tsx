
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface SignupFormProps {
  recoveryEmail: string;
  onBack: () => void;
}

const SignupForm = ({ recoveryEmail, onBack }: SignupFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const { toast } = useToast();

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
            onClick={onBack}
          >
            Back to Account Lookup
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SignupForm;
