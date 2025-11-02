import React from 'react';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface ChatButtonProps {
  userId: string;
  userName: string;
  username?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showIcon?: boolean;
  children?: React.ReactNode;
}

export const ChatButton: React.FC<ChatButtonProps> = ({
  userId,
  userName,
  username,
  variant = 'default',
  size = 'default',
  className = '',
  showIcon = true,
  children,
}) => {
  const { openChat } = useChat();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleClick = () => {
    if (!user) {
      toast.error('Please sign in to send messages');
      navigate('/auth');
      return;
    }

    if (user.id === userId) {
      toast.error("You can't message yourself");
      return;
    }

    openChat(userId, userName, username);
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      className={className}
    >
      {showIcon && <MessageCircle className="h-4 w-4 mr-2" />}
      {children || 'Send Message'}
    </Button>
  );
};
