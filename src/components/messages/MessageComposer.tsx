import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { validateMessage, UserProfile } from '@/utils/messageUtils';
import { toast } from 'sonner';

interface MessageComposerProps {
  recipientId?: string;
  recipients?: UserProfile[];
  onSendMessage: (recipientId: string, content: string) => Promise<void>;
  isLoading?: boolean;
  placeholder?: string;
  showRecipientSelect?: boolean;
  disabled?: boolean;
  className?: string;
  maxLength?: number;
}

const MessageComposer: React.FC<MessageComposerProps> = ({
  recipientId: initialRecipientId,
  recipients = [],
  onSendMessage,
  isLoading = false,
  placeholder = "Type your message here...",
  showRecipientSelect = false,
  disabled = false,
  className,
  maxLength = 1000
}) => {
  const [recipientId, setRecipientId] = useState(initialRecipientId || '');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync internal state with prop when it changes
  useEffect(() => {
    if (initialRecipientId) {
      setRecipientId(initialRecipientId);
    }
  }, [initialRecipientId]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (disabled || isLoading || isSubmitting) return;

    // Validate recipient
    if (!recipientId) {
      toast.error(showRecipientSelect ? 'Please select a recipient' : 'No recipient specified');
      return;
    }

    // Validate message content
    const validation = validateMessage(content);
    if (!validation.isValid) {
      toast.error(validation.error);
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSendMessage(recipientId, content);
      setContent('');
      toast.success('Message sent successfully!');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [recipientId, content, onSendMessage, disabled, isLoading, isSubmitting, showRecipientSelect]);

  const canSend = recipientId && content.trim() && !disabled && !isLoading && !isSubmitting;

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-4", className)}>
      {showRecipientSelect && recipients.length > 0 && (
        <div>
          <label className="text-sm font-medium mb-2 block">
            Send to:
          </label>
          <Select 
            value={recipientId} 
            onValueChange={setRecipientId}
            disabled={disabled || isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a recipient" />
            </SelectTrigger>
            <SelectContent>
              {recipients.map((recipient) => (
                <SelectItem key={recipient.id} value={recipient.id}>
                  <div className="flex items-center gap-2">
                    <span>
                      {recipient.full_name || recipient.username || 'Unknown User'}
                    </span>
                    {recipient.username && (
                      <span className="text-muted-foreground">
                        @{recipient.username}
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      
      <div>
        <label className="text-sm font-medium mb-2 block">
          Message:
        </label>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          rows={4}
          maxLength={maxLength}
          disabled={disabled || isLoading}
          className="resize-none"
        />
        <div className="flex justify-between items-center mt-1">
          <div className="text-xs text-muted-foreground">
            {content.length}/{maxLength} characters
          </div>
          {content.length > maxLength * 0.9 && (
            <div className="text-xs text-orange-500">
              Approaching character limit
            </div>
          )}
        </div>
      </div>
      
      <Button 
        type="submit" 
        className="w-full"
        disabled={!canSend}
      >
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Send className="h-4 w-4 mr-2" />
        )}
        {isSubmitting ? 'Sending...' : 'Send Message'}
      </Button>
    </form>
  );
};

export default MessageComposer;