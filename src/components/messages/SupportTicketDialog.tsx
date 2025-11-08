import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';

interface SupportTicketDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  adminUsers: Array<{ id: string; username?: string; full_name?: string }>;
  onSubmit: (data: {
    recipientId: string;
    subject: string;
    message: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
  }) => Promise<void>;
}

const SupportTicketDialog: React.FC<SupportTicketDialogProps> = ({
  open,
  onOpenChange,
  adminUsers,
  onSubmit
}) => {
  const LEE_USER_ID = '4862bb86-6f9b-4b7d-aa74-e4bee1d50342';
  const [selectedAdmin, setSelectedAdmin] = useState<string>('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Default to @lee when dialog opens or admin users are loaded
  React.useEffect(() => {
    if (adminUsers.length > 0 && !selectedAdmin) {
      const leeAdmin = adminUsers.find(admin => admin.id === LEE_USER_ID);
      if (leeAdmin) {
        setSelectedAdmin(LEE_USER_ID);
      }
    }
  }, [adminUsers, selectedAdmin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedAdmin || !subject.trim() || !message.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        recipientId: selectedAdmin,
        subject: subject.trim(),
        message: message.trim(),
        priority
      });
      
      // Reset form (but keep Lee as default)
      setSelectedAdmin(LEE_USER_ID);
      setSubject('');
      setMessage('');
      setPriority('medium');
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating support ticket:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-primary" />
            Create Support Ticket
          </DialogTitle>
          <DialogDescription>
            Submit a support request to our admin team. We typically respond within 24 hours.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="admin">Support Team Member</Label>
            <Select value={selectedAdmin} onValueChange={setSelectedAdmin}>
              <SelectTrigger id="admin">
                <SelectValue placeholder="Select an admin to contact" />
              </SelectTrigger>
              <SelectContent>
                {adminUsers.map((admin) => (
                  <SelectItem key={admin.id} value={admin.id}>
                    <div className="flex items-center gap-2">
                      {admin.full_name || admin.username}
                      <Badge variant="secondary" className="text-xs">Admin</Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority Level</Label>
            <Select value={priority} onValueChange={(v) => setPriority(v as any)}>
              <SelectTrigger id="priority">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low - General inquiry</SelectItem>
                <SelectItem value="medium">Medium - Standard support</SelectItem>
                <SelectItem value="high">High - Important issue</SelectItem>
                <SelectItem value="urgent">Urgent - Critical problem</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              placeholder="Brief description of your issue..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={100}
              required
            />
            <p className="text-xs text-muted-foreground">{subject.length}/100 characters</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Please describe your issue in detail..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              required
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !selectedAdmin || !subject || !message}>
              {isSubmitting ? 'Creating...' : 'Create Support Ticket'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SupportTicketDialog;
