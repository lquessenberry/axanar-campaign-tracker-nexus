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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Zap, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SupportTicketDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    message: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
  }) => Promise<void>;
}

const priorityOptions = [
  { value: 'low' as const, label: 'Low', icon: Info, color: 'text-blue-500' },
  { value: 'medium' as const, label: 'Medium', icon: AlertCircle, color: 'text-yellow-500' },
  { value: 'high' as const, label: 'High', icon: AlertTriangle, color: 'text-orange-500' },
  { value: 'urgent' as const, label: 'Urgent', icon: Zap, color: 'text-red-500' },
];

const SupportTicketDialog: React.FC<SupportTicketDialogProps> = ({
  open,
  onOpenChange,
  onSubmit
}) => {
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        message: message.trim(),
        priority
      });
      
      // Reset form
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
            Contact Support
          </DialogTitle>
          <DialogDescription>
            Message our support team - we typically respond within 24 hours.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Priority (Optional)</Label>
            <div className="grid grid-cols-4 gap-2">
              {priorityOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <Button
                    key={option.value}
                    type="button"
                    variant={priority === option.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPriority(option.value)}
                    className={cn(
                      'flex flex-col items-center gap-1 h-auto py-2',
                      priority === option.value && 'ring-2 ring-primary'
                    )}
                  >
                    <Icon className={cn('h-4 w-4', priority === option.value ? 'text-primary-foreground' : option.color)} />
                    <span className="text-xs">{option.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Your Message</Label>
            <Textarea
              id="message"
              placeholder="Describe your issue or question..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={8}
              required
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Your message will be sent to our support team
            </p>
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
            <Button type="submit" disabled={isSubmitting || !message.trim()}>
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SupportTicketDialog;
