import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserPresence } from '@/hooks/useUserPresence';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

interface UserSelectorProps {
  onSelectUser: (userId: string, userName: string) => void;
  onClose: () => void;
  className?: string;
  filterAdminsOnly?: boolean;
}

const UserSelector: React.FC<UserSelectorProps> = ({
  onSelectUser,
  onClose,
  className,
  filterAdminsOnly = false
}) => {
  const { user: currentUser } = useAuth();
  const { isUserOnline } = useUserPresence();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: users, isLoading } = useQuery({
    queryKey: ['users-for-selector', filterAdminsOnly],
    queryFn: async () => {
      // First get admin user IDs if filtering by admins
      let adminUserIds: string[] = [];
      if (filterAdminsOnly) {
        const { data: adminData } = await supabase
          .from('admin_users')
          .select('user_id');
        adminUserIds = adminData?.map(a => a.user_id) || [];
      }

      // Fetch profiles
      let query = supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .neq('id', currentUser?.id || '');

      if (filterAdminsOnly && adminUserIds.length > 0) {
        query = query.in('id', adminUserIds);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Add is_admin flag to each user
      const usersWithAdminFlag = data?.map(user => ({
        ...user,
        is_admin: adminUserIds.includes(user.id)
      })) || [];

      return usersWithAdminFlag;
    },
  });

  const filteredUsers = users?.filter(user => {
    const searchString = searchTerm.toLowerCase();
    return (
      user.full_name?.toLowerCase().includes(searchString) ||
      user.username?.toLowerCase().includes(searchString)
    );
  });

  const handleSelectUser = (user: any) => {
    const displayName = user.full_name || user.username || 'Unknown User';
    onSelectUser(user.id, displayName);
  };

  const getInitials = (user: any): string => {
    if (user.full_name) {
      return user.full_name
        .split(' ')
        .map((name: string) => name.charAt(0))
        .join('')
        .slice(0, 2)
        .toUpperCase();
    }
    return user.username?.slice(0, 2).toUpperCase() || 'U';
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            {filterAdminsOnly ? 'Select Support Admin' : 'Start New Conversation'}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={filterAdminsOnly ? "Search admins..." : "Search users..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <ScrollArea className="h-[400px]">
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : filteredUsers && filteredUsers.length > 0 ? (
              <div className="space-y-2">
                {filteredUsers.map((user) => {
                  const isOnline = isUserOnline(user.id);
                  return (
                    <Button
                      key={user.id}
                      variant="ghost"
                      className="w-full justify-start h-auto p-3"
                      onClick={() => handleSelectUser(user)}
                    >
                      <div className="flex items-center space-x-3 w-full">
                        <div className="relative">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.avatar_url || undefined} />
                            <AvatarFallback className="text-sm">
                              {getInitials(user)}
                            </AvatarFallback>
                          </Avatar>
                          {isOnline && (
                            <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 border-2 border-background rounded-full"></div>
                          )}
                        </div>
                        
                        <div className="flex-1 text-left">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm">
                              {user.full_name || user.username || 'Unknown User'}
                            </p>
                            {user.is_admin && (
                              <Badge variant="secondary" className="text-xs">
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
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {filterAdminsOnly ? 'No admins found' : 'No users found'}
              </div>
            )}
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserSelector;
