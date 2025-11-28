import React, { useState, useEffect } from 'react';
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
import SupportCategorySelector, { SupportCategory } from './SupportCategorySelector';
import UserStatusBanner, { UserStatus } from './UserStatusBanner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface SupportTicketDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    message: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    category?: SupportCategory;
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
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState<SupportCategory>('general');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userStatus, setUserStatus] = useState<UserStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);

  // Auto-detect user status when dialog opens
  useEffect(() => {
    if (open && user?.id) {
      setLoadingStatus(true);
      
      const fetchUserStatus = async () => {
        try {
          // Check donor linkage
          const { data: donor } = await supabase
            .from('donors')
            .select('id, email')
            .eq('auth_user_id', user.id)
            .maybeSingle();

          // Check pledges if donor exists
          let pledgeCount = 0;
          let totalPledged = 0;
          
          if (donor) {
            const { data: pledges } = await supabase
              .from('pledges')
              .select('amount')
              .eq('donor_id', donor.id);
            
            pledgeCount = pledges?.length || 0;
            totalPledged = pledges?.reduce((sum, p) => sum + (Number(p.amount) || 0), 0) || 0;
          }

          // Check address
          const { data: address } = await supabase
            .from('addresses')
            .select('id')
            .eq('donor_id', donor?.id || '')
            .eq('is_primary', true)
            .maybeSingle();

          setUserStatus({
            hasAuth: true,
            hasDonor: !!donor,
            pledgeCount,
            totalPledged,
            hasAddress: !!address
          });
        } catch (error) {
          console.error('Error fetching user status:', error);
        } finally {
          setLoadingStatus(false);
        }
      };

      fetchUserStatus();
    }
  }, [open, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        message: message.trim(),
        priority,
        category
      });
      
      // Reset form
      setMessage('');
      setCategory('general');
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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User Status Banner */}
          <UserStatusBanner status={userStatus} loading={loadingStatus} />

          {/* Category Selection */}
          <SupportCategorySelector value={category} onChange={setCategory} />
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
