import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  CheckCircle, 
  XCircle, 
  MapPin, 
  MessageSquare, 
  Calendar,
  ChevronDown,
  ChevronUp,
  Search,
  Database,
  Link2
} from 'lucide-react';
import { useUserSupportContext } from '@/hooks/useUserSupportContext';
import { format } from 'date-fns';

interface UserSupportContextProps {
  userId: string;
  onOpenDonorSearch?: () => void;
  onOpenPledgeRestore?: () => void;
  onOpenAccountMerge?: () => void;
}

const UserSupportContext: React.FC<UserSupportContextProps> = ({
  userId,
  onOpenDonorSearch,
  onOpenPledgeRestore,
  onOpenAccountMerge
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const { data: context, isLoading } = useUserSupportContext(userId);

  if (isLoading) {
    return (
      <Card className="w-80 h-full overflow-auto border-l rounded-none">
        <CardContent className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded w-32"></div>
            <div className="h-4 bg-muted rounded w-full"></div>
            <div className="h-4 bg-muted rounded w-full"></div>
            <div className="h-4 bg-muted rounded w-24"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!context) {
    return null;
  }

  const StatusIcon = ({ condition }: { condition: boolean }) => 
    condition 
      ? <CheckCircle className="h-4 w-4 text-green-500" />
      : <XCircle className="h-4 w-4 text-red-500" />;

  return (
    <Card className="w-80 h-full overflow-auto border-l rounded-none">
      <CardHeader className="border-b bg-card/40 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-5 w-5" />
            User Context
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8 p-0"
          >
            {collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>

      {!collapsed && (
        <CardContent className="p-6 space-y-6 text-sm">
          {/* Account Status */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Account Status</h4>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Authenticated</span>
                <StatusIcon condition={context.isAuthenticated} />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Donor Linked</span>
                <StatusIcon condition={context.donorLinked} />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Has Pledges</span>
                <StatusIcon condition={context.pledgeCount > 0} />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Address Complete</span>
                <StatusIcon condition={context.addressComplete} />
              </div>
            </div>
          </div>

          <Separator />

          {/* Identity */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Identity</h4>
            <div className="text-xs space-y-1 text-muted-foreground">
              <p><strong>Email:</strong> {context.email || 'N/A'}</p>
              {context.donorName && <p><strong>Name:</strong> {context.donorName}</p>}
              {context.memberSince && (
                <p><strong>Member Since:</strong> {format(new Date(context.memberSince), 'MMM d, yyyy')}</p>
              )}
            </div>
          </div>

          <Separator />

          {/* Contribution Summary */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Contributions</h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <div className="text-2xl font-bold">{context.pledgeCount}</div>
                <div className="text-xs text-muted-foreground">Pledges</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <div className="text-2xl font-bold">${context.totalPledged.toFixed(0)}</div>
                <div className="text-xs text-muted-foreground">Total</div>
              </div>
            </div>
            
            {context.campaigns.length > 0 && (
              <div className="mt-2 space-y-1">
                {context.campaigns.slice(0, 3).map((campaign, i) => (
                  <div key={i} className="text-xs p-2 rounded bg-muted/30">
                    <div className="font-medium">{campaign.name}</div>
                    <div className="text-muted-foreground">
                      ${campaign.amount.toFixed(2)} • {format(new Date(campaign.date), 'MMM yyyy')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Platform History */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Platforms</h4>
            <div className="flex flex-wrap gap-2">
              {context.platforms.kickstarter && <Badge variant="secondary">Kickstarter</Badge>}
              {context.platforms.indiegogo && <Badge variant="secondary">Indiegogo</Badge>}
              {context.platforms.paypal && <Badge variant="secondary">PayPal</Badge>}
              {!context.platforms.kickstarter && !context.platforms.indiegogo && !context.platforms.paypal && (
                <span className="text-xs text-muted-foreground">No legacy platforms</span>
              )}
            </div>
          </div>

          <Separator />

          {/* Forum Activity */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Forum Activity
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-center p-2 rounded bg-muted/30">
                <div className="font-bold">{context.threadCount}</div>
                <div className="text-muted-foreground">Threads</div>
              </div>
              <div className="text-center p-2 rounded bg-muted/30">
                <div className="font-bold">{context.commentCount}</div>
                <div className="text-muted-foreground">Comments</div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Address */}
          {context.hasAddress && (
            <>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Address
                </h4>
                <div className="text-xs text-muted-foreground">
                  {context.addressCity && <p>{context.addressCity}</p>}
                  {context.addressState && context.addressCountry && (
                    <p>{context.addressState}, {context.addressCountry}</p>
                  )}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Admin Quick Actions */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Quick Actions</h4>
            <div className="space-y-2">
              {onOpenDonorSearch && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start gap-2 h-10"
                  onClick={onOpenDonorSearch}
                >
                  <Search className="h-4 w-4" />
                  Search Legacy Data
                </Button>
              )}
              
              {onOpenPledgeRestore && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start gap-2 h-10"
                  onClick={onOpenPledgeRestore}
                >
                  <Database className="h-4 w-4" />
                  Restore Pledges
                </Button>
              )}
              
              {onOpenAccountMerge && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start gap-2 h-10"
                  onClick={onOpenAccountMerge}
                >
                  <Link2 className="h-4 w-4" />
                  Merge Accounts
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default UserSupportContext;
