
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle } from 'lucide-react';

interface PasswordResetRequestProps {
  email: string;
  isLoading: boolean;
  onResetRequest: () => void;
  onBack: () => void;
}

const PasswordResetRequest = ({ 
  email, 
  isLoading, 
  onResetRequest, 
  onBack 
}: PasswordResetRequestProps) => {
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
          onClick={onResetRequest}
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
};

export default PasswordResetRequest;
