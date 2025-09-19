import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserPresence } from '@/hooks/useUserPresence';
import { cn } from '@/lib/utils';

interface User {
  id: string;
  username?: string;
  full_name?: string;
  is_admin?: boolean;
}

interface UserSelectorProps {
  onSelectUser: (userId: string, userName: string) => void;
  onClose: () => void;
  className?: string;
}

const UserSelector: React.FC<UserSelectorProps> = ({
  onSelectUser,
  onClose,
  className
}) => {
  const { user: currentUser } = useAuth();
  const { isUserOnline } = useUserPresence();
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, username, full_name, is_admin')
          .neq('id', currentUser?.id || '');

        if (error) throw error;
        setUsers(data || []);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchUsers();
    }
  }, [currentUser]);

  const filteredUsers = users.filter(user => {
    const searchString = searchTerm.toLowerCase();
    return (
      user.full_name?.toLowerCase().includes(searchString) ||
      user.username?.toLowerCase().includes(searchString)
    );
  });

  const handleSelectUser = (user: User) => {
    const displayName = user.full_name || user.username || 'Unknown User';
    onSelectUser(user.id, displayName);
    onClose();
  };

  const getInitials = (user: User): string => {
    if (user.full_name) {
      return user.full_name
        .split(' ')
        .map(name => name.charAt(0))
        .join('')
        .slice(0, 2)
        .toUpperCase();
    }
    return user.username?.slice(0, 2).toUpperCase() || 'U';
  };

  if (loading) {
    return (
      <div className={cn("bg-card border rounded-lg p-4", className)}>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-1/3"></div>
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-muted rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2 mt-1"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("bg-card border rounded-lg", className)}>
      <div className="p-4 border-b">
        <h3 className="font-semibold text-lg mb-3">Start New Conversation</h3>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <ScrollArea className="h-64">
        <div className="p-2">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No users found</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredUsers.map((user) => {
                const isOnline = isUserOnline(user.id);
                return (
                  <Button
                    key={user.id}
                    variant="ghost"
                    className="w-full justify-start p-3 h-auto"
                    onClick={() => handleSelectUser(user)}
                  >
                    <div className="flex items-center space-x-3 w-full">
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="text-sm">
                            {getInitials(user)}
                          </AvatarFallback>
                        </Avatar>
                        {isOnline && (
                          <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 border-2 border-white rounded-full"></div>
                        )}
                      </div>
                      
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">
                            {user.full_name || user.username || 'Unknown User'}
                          </p>
                          {user.is_admin && (
                            <Badge variant="outline" className="text-xs">
                              Admin
                            </Badge>
                          )}
                        </div>
                        {user.username && user.full_name && (
                          <p className="text-xs text-muted-foreground">
                            @{user.username}
                          </p>
                        )}
                        {isOnline && (
                          <p className="text-xs text-green-600">Online</p>
                        )}
                      </div>
                    </div>
                  </Button>
                );
              })}
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <Button variant="outline" onClick={onClose} className="w-full">
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default UserSelector;