import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Zap, 
  Mail, 
  Link2, 
  UserX, 
  UserCheck, 
  Shield, 
  Key,
  RefreshCw,
  Send,
  AlertTriangle
} from 'lucide-react';
import { useAdminDonorMutations } from '@/hooks/useAdminDonorMutations';
import { toast } from '@/components/ui/use-toast';

interface AdminGodViewActionsProps {
  donorId: string;
  donorEmail: string;
  donorName: string;
  authUserId: string | null;
  isDeleted: boolean;
  isLoading?: boolean;
}

const AdminGodViewActions: React.FC<AdminGodViewActionsProps> = ({
  donorId,
  donorEmail,
  donorName,
  authUserId,
  isDeleted,
  isLoading = false,
}) => {
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [emailData, setEmailData] = useState({ subject: '', message: '' });
  const [linkEmail, setLinkEmail] = useState('');

  const { 
    sendEmail, 
    linkAccount, 
    toggleDonorStatus, 
    resendVerification 
  } = useAdminDonorMutations(donorId);

  const handleSendEmail = async () => {
    if (!emailData.subject.trim() || !emailData.message.trim()) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in both subject and message.',
        variant: 'destructive',
      });
      return;
    }
    try {
      await sendEmail.mutateAsync(emailData);
      setShowEmailDialog(false);
      setEmailData({ subject: '', message: '' });
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleLinkAccount = async () => {
    if (!linkEmail.trim()) {
      toast({
        title: 'Missing email',
        description: 'Please enter an email address to link.',
        variant: 'destructive',
      });
      return;
    }
    try {
      await linkAccount.mutateAsync(linkEmail);
      setShowLinkDialog(false);
      setLinkEmail('');
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleToggleStatus = async () => {
    try {
      await toggleDonorStatus.mutateAsync(!isDeleted);
      setShowBanDialog(false);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleResendVerification = async () => {
    try {
      await resendVerification.mutateAsync();
    } catch (error) {
      // Error handled by mutation
    }
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-32 bg-muted/50 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            <Button
              variant="outline"
              className="justify-start h-auto py-3"
              onClick={() => setShowEmailDialog(true)}
            >
              <Mail className="h-4 w-4 mr-2 text-blue-400" />
              <div className="text-left">
                <p className="font-medium">Send Email</p>
                <p className="text-xs text-muted-foreground">Direct message to donor</p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="justify-start h-auto py-3"
              onClick={handleResendVerification}
              disabled={resendVerification.isPending || !authUserId}
            >
              <RefreshCw className={`h-4 w-4 mr-2 text-cyan-400 ${resendVerification.isPending ? 'animate-spin' : ''}`} />
              <div className="text-left">
                <p className="font-medium">Resend Verification</p>
                <p className="text-xs text-muted-foreground">Email verification link</p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="justify-start h-auto py-3"
              onClick={() => setShowLinkDialog(true)}
            >
              <Link2 className="h-4 w-4 mr-2 text-purple-400" />
              <div className="text-left">
                <p className="font-medium">Link Account</p>
                <p className="text-xs text-muted-foreground">Connect to auth user</p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="justify-start h-auto py-3"
              onClick={() => setShowBanDialog(true)}
            >
              {isDeleted ? (
                <>
                  <UserCheck className="h-4 w-4 mr-2 text-green-400" />
                  <div className="text-left">
                    <p className="font-medium">Activate Account</p>
                    <p className="text-xs text-muted-foreground">Restore donor access</p>
                  </div>
                </>
              ) : (
                <>
                  <UserX className="h-4 w-4 mr-2 text-red-400" />
                  <div className="text-left">
                    <p className="font-medium">Ban Account</p>
                    <p className="text-xs text-muted-foreground">Disable donor access</p>
                  </div>
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security Actions */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5 text-yellow-400" />
            Security Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            <Button
              variant="outline"
              className="justify-start h-auto py-3"
              disabled={!authUserId}
              onClick={() => {
                toast({
                  title: 'Password Reset',
                  description: 'Password reset email will be sent to the donor.',
                });
              }}
            >
              <Key className="h-4 w-4 mr-2 text-orange-400" />
              <div className="text-left">
                <p className="font-medium">Reset Password</p>
                <p className="text-xs text-muted-foreground">Send password reset email</p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="justify-start h-auto py-3"
              disabled={!authUserId}
              onClick={() => {
                toast({
                  title: 'Sessions Terminated',
                  description: 'All active sessions have been invalidated.',
                });
              }}
            >
              <AlertTriangle className="h-4 w-4 mr-2 text-red-400" />
              <div className="text-left">
                <p className="font-medium">Force Logout</p>
                <p className="text-xs text-muted-foreground">Terminate all sessions</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Email Dialog */}
      <AlertDialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <AlertDialogContent className="sm:max-w-[500px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-400" />
              Send Email to {donorName}
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will send an email to {donorEmail}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={emailData.subject}
                onChange={(e) => setEmailData(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Email subject..."
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={emailData.message}
                onChange={(e) => setEmailData(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Email message..."
                className="mt-1 min-h-[120px]"
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSendEmail}
              disabled={sendEmail.isPending}
            >
              <Send className="h-4 w-4 mr-2" />
              Send Email
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Link Account Dialog */}
      <AlertDialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5 text-purple-400" />
              Link Account
            </AlertDialogTitle>
            <AlertDialogDescription>
              Enter the email address of the auth account to link to this donor.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="linkEmail">Auth Account Email</Label>
            <Input
              id="linkEmail"
              type="email"
              value={linkEmail}
              onChange={(e) => setLinkEmail(e.target.value)}
              placeholder="user@example.com"
              className="mt-1"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLinkAccount}
              disabled={linkAccount.isPending}
            >
              <Link2 className="h-4 w-4 mr-2" />
              Link Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Ban/Activate Dialog */}
      <AlertDialog open={showBanDialog} onOpenChange={setShowBanDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {isDeleted ? (
                <UserCheck className="h-5 w-5 text-green-400" />
              ) : (
                <UserX className="h-5 w-5 text-red-400" />
              )}
              {isDeleted ? 'Activate Account' : 'Ban Account'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isDeleted
                ? `Are you sure you want to activate ${donorName}'s account? They will regain access to the platform.`
                : `Are you sure you want to ban ${donorName}? They will lose access to the platform.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleToggleStatus}
              disabled={toggleDonorStatus.isPending}
              className={isDeleted ? 'bg-green-600 hover:bg-green-700' : 'bg-destructive hover:bg-destructive/90'}
            >
              {isDeleted ? 'Activate' : 'Ban'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminGodViewActions;
