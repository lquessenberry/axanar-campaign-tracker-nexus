
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle } from 'lucide-react';

interface PasswordResetConfirmationProps {
  email: string;
  onBack: () => void;
}

const PasswordResetConfirmation = ({
  email,
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

        <div className="text-sm text-muted-foreground text-center">
          <p>The reset link will expire in 1 hour for security reasons.</p>
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
