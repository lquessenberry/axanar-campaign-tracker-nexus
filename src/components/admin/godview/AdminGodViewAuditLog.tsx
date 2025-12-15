import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { History, ChevronLeft, ChevronRight, User, Globe, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface AuditEntry {
  id: string;
  action: string;
  details: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string | null;
}

interface AdminGodViewAuditLogProps {
  auditLog: AuditEntry[];
  isLoading?: boolean;
}

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  login: { label: 'Login', color: 'bg-green-500/20 text-green-400' },
  logout: { label: 'Logout', color: 'bg-gray-500/20 text-gray-400' },
  profile_update: { label: 'Profile Update', color: 'bg-blue-500/20 text-blue-400' },
  address_update: { label: 'Address Update', color: 'bg-cyan-500/20 text-cyan-400' },
  password_change: { label: 'Password Change', color: 'bg-yellow-500/20 text-yellow-400' },
  pledge_created: { label: 'Pledge Created', color: 'bg-purple-500/20 text-purple-400' },
  reward_claimed: { label: 'Reward Claimed', color: 'bg-pink-500/20 text-pink-400' },
  email_verified: { label: 'Email Verified', color: 'bg-emerald-500/20 text-emerald-400' },
  account_linked: { label: 'Account Linked', color: 'bg-orange-500/20 text-orange-400' },
};

const ITEMS_PER_PAGE = 20;

const AdminGodViewAuditLog: React.FC<AdminGodViewAuditLogProps> = ({
  auditLog,
  isLoading = false,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filterAction, setFilterAction] = useState<string>('all');

  // Filter and paginate
  const filteredLog = filterAction === 'all' 
    ? auditLog 
    : auditLog.filter(entry => entry.action === filterAction);
  
  const totalPages = Math.ceil(filteredLog.length / ITEMS_PER_PAGE);
  const paginatedLog = filteredLog.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Get unique actions for filter
  const uniqueActions = [...new Set(auditLog.map(e => e.action))];

  const getActionBadge = (action: string) => {
    const config = ACTION_LABELS[action] || { label: action, color: 'bg-muted text-muted-foreground' };
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const parseUserAgent = (ua: string | null) => {
    if (!ua) return 'Unknown';
    // Simple parsing - could be enhanced
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    return 'Other Browser';
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="h-16 bg-muted/50 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Activity Log ({filteredLog.length} entries)
          </CardTitle>
          
          <Select value={filterAction} onValueChange={(v) => { setFilterAction(v); setCurrentPage(1); }}>
            <SelectTrigger className="w-[160px] h-8">
              <SelectValue placeholder="Filter by action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              {uniqueActions.map(action => (
                <SelectItem key={action} value={action}>
                  {ACTION_LABELS[action]?.label || action}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {filteredLog.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-8">
            No activity recorded
          </p>
        ) : (
          <>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-2">
                {paginatedLog.map((entry, index) => (
                  <div
                    key={entry.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    {/* Timeline indicator */}
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      {index < paginatedLog.length - 1 && (
                        <div className="w-0.5 h-full bg-border/50 mt-1" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        {getActionBadge(entry.action)}
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {entry.created_at 
                            ? format(new Date(entry.created_at), 'MMM d, yyyy h:mm a')
                            : 'Unknown'}
                        </span>
                      </div>
                      
                      {entry.details && (
                        <p className="text-sm mt-1 text-foreground/80">
                          {entry.details}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        {entry.ip_address && (
                          <span className="flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            {entry.ip_address}
                          </span>
                        )}
                        {entry.user_agent && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {parseUserAgent(entry.user_agent)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminGodViewAuditLog;
