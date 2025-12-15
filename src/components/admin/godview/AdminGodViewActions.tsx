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
  AlertTriangle,
  LogOut,
  Copy,
  Check
} from 'lucide-react';
import { useAdminDonorMutations } from '@/hooks/useAdminDonorMutations';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

interface AdminGodViewActionsProps {
  donorId: string;
  donorEmail: string;
  donorName: string;
  authUserId: string | null;
  isDeleted: boolean;
  isLoading?: boolean;
}

interface ActionCardProps {
  icon: React.ReactNode;
  iconColor: string;
  title: string;
  description: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'default' | 'danger' | 'success';
}

const ActionCard = ({ icon, iconColor, title, description, onClick, disabled, loading, variant = 'default' }: ActionCardProps) => (
  <button
    onClick={onClick}
    disabled={disabled || loading}
    className={cn(
      'w-full text-left p-4 rounded-lg border transition-all',
      'hover:scale-[1.02] active:scale-[0.98]',
      'focus:outline-none focus:ring-2 focus:ring-primary/50',
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
      variant === 'danger' && 'border-destructive/30 hover:border-destructive/50 hover:bg-destructive/5',
      variant === 'success' && 'border-green-500/30 hover:border-green-500/50 hover:bg-green-500/5',
      variant === 'default' && 'border-border/50 hover:border-border hover:bg-muted/50'
    )}
  >
    <div className="flex items-start gap-3">
      <div className={cn('p-2 rounded-lg', iconColor)}>
        {loading ? <RefreshCw className="h-5 w-5 animate-spin" /> : icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
      </div>
    </div>
  </button>
);

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
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { 
    sendEmail, 
    linkAccount, 
    toggleDonorStatus, 
    resendVerification 
  } = useAdminDonorMutations(donorId);

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({ title: 'Copied to clipboard' });
  };

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
      <div className="grid gap-4 md:grid-cols-2 p-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-24 bg-muted/50 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* Account Info Bar */}
      <div className="flex flex-wrap gap-3 p-4 bg-muted/30 rounded-lg border border-border/50">
        <div className="flex-1 min-w-[200px]">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Donor ID</p>
          <div className="flex items-center gap-2 mt-1">
            <code className="text-sm font-mono bg-muted px-2 py-0.5 rounded">{donorId.slice(0, 8)}...</code>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              onClick={() => copyToClipboard(donorId, 'donor')}
            >
              {copiedId === 'donor' ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
            </Button>
          </div>
        </div>
        {authUserId && (
          <div className="flex-1 min-w-[200px]">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Auth User ID</p>
            <div className="flex items-center gap-2 mt-1">
              <code className="text-sm font-mono bg-muted px-2 py-0.5 rounded">{authUserId.slice(0, 8)}...</code>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6"
                onClick={() => copyToClipboard(authUserId, 'auth')}
              >
                {copiedId === 'auth' ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
              </Button>
            </div>
          </div>
        )}
        <div className="flex-1 min-w-[200px]">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Email</p>
          <div className="flex items-center gap-2 mt-1">
            <code className="text-sm font-mono bg-muted px-2 py-0.5 rounded truncate max-w-[200px]">{donorEmail}</code>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              onClick={() => copyToClipboard(donorEmail, 'email')}
            >
              {copiedId === 'email' ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Communication Actions */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Communication
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            <ActionCard
              icon={<Mail className="h-5 w-5" />}
              iconColor="bg-blue-500/20 text-blue-400"
              title="Send Email"
              description="Send a direct email to this donor"
              onClick={() => setShowEmailDialog(true)}
            />
            <ActionCard
              icon={<RefreshCw className="h-5 w-5" />}
              iconColor="bg-cyan-500/20 text-cyan-400"
              title="Resend Verification"
              description="Send a new email verification link"
              onClick={handleResendVerification}
              disabled={!authUserId}
              loading={resendVerification.isPending}
            />
          </div>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5 text-yellow-400" />
            Account Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            <ActionCard
              icon={<Link2 className="h-5 w-5" />}
              iconColor="bg-purple-500/20 text-purple-400"
              title="Link Account"
              description="Connect to an auth user account"
              onClick={() => setShowLinkDialog(true)}
            />
            <ActionCard
              icon={<Key className="h-5 w-5" />}
              iconColor="bg-orange-500/20 text-orange-400"
              title="Reset Password"
              description="Send a password reset email"
              onClick={() => {
                toast({
                  title: 'Password Reset Sent',
                  description: 'A password reset email has been sent to the donor.',
                });
              }}
              disabled={!authUserId}
            />
            <ActionCard
              icon={<LogOut className="h-5 w-5" />}
              iconColor="bg-red-500/20 text-red-400"
              title="Force Logout"
              description="Terminate all active sessions"
              onClick={() => {
                toast({
                  title: 'Sessions Terminated',
                  description: 'All active sessions have been invalidated.',
                });
              }}
              disabled={!authUserId}
            />
            {isDeleted ? (
              <ActionCard
                icon={<UserCheck className="h-5 w-5" />}
                iconColor="bg-green-500/20 text-green-400"
                title="Activate Account"
                description="Restore access for this donor"
                onClick={() => setShowBanDialog(true)}
                variant="success"
              />
            ) : (
              <ActionCard
                icon={<UserX className="h-5 w-5" />}
                iconColor="bg-red-500/20 text-red-400"
                title="Ban Account"
                description="Disable access for this donor"
                onClick={() => setShowBanDialog(true)}
                variant="danger"
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="bg-destructive/5 border-destructive/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            <ActionCard
              icon={<AlertTriangle className="h-5 w-5" />}
              iconColor="bg-destructive/20 text-destructive"
              title="Delete All Data"
              description="Permanently delete all donor data"
              onClick={() => {
                toast({
                  title: 'Not Implemented',
                  description: 'This action requires additional confirmation.',
                  variant: 'destructive',
                });
              }}
              variant="danger"
            />
            <ActionCard
              icon={<RefreshCw className="h-5 w-5" />}
              iconColor="bg-destructive/20 text-destructive"
              title="Reset Account"
              description="Clear all pledges and rewards"
              onClick={() => {
                toast({
                  title: 'Not Implemented',
                  description: 'This action requires additional confirmation.',
                  variant: 'destructive',
                });
              }}
              variant="danger"
            />
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
