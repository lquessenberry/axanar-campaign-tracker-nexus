
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle } from 'lucide-react';

interface PasswordResetConfirmationProps {
  email: string;
  password: string;
  confirmPassword: string;
  isLoading: boolean;
  onPasswordChange: (password: string) => void;
  onConfirmPasswordChange: (confirmPassword: string) => void;
  onPasswordUpdate: (e: React.FormEvent) => void;
  onBack: () => void;
}

const PasswordResetConfirmation = ({
  email,
  password,
  confirmPassword,
  isLoading,
  onPasswordChange,
  onConfirmPasswordChange,
  onPasswordUpdate,
  onBack
}: PasswordResetConfirmationProps) => {
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
          <form onSubmit={onPasswordUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => onPasswordChange(e.target.value)}
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
                onChange={(e) => onConfirmPasswordChange(e.target.value)}
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

export default PasswordResetConfirmation;
