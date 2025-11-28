import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

interface UserStatus {
  hasAuth: boolean;
  hasDonor: boolean;
  pledgeCount: number;
  totalPledged: number;
  hasAddress: boolean;
}

interface UserStatusBannerProps {
  status: UserStatus | null;
  loading?: boolean;
}

const UserStatusBanner: React.FC<UserStatusBannerProps> = ({ status, loading }) => {
  if (loading) {
    return (
      <Alert className="border-border bg-muted/30">
        <AlertDescription className="text-base">
          Checking your account status...
        </AlertDescription>
      </Alert>
    );
  }

  if (!status) {
    return null;
  }

  // Determine status level
  let statusType: 'success' | 'warning' | 'error' = 'success';
  let icon = CheckCircle2;
  let message = '';

  if (!status.hasDonor) {
    statusType = 'error';
    icon = XCircle;
    message = `We don't have a donor record for your email yet. If you contributed to an earlier campaign, please let us know so we can link your account.`;
  } else if (status.pledgeCount === 0) {
    statusType = 'warning';
    icon = AlertTriangle;
    message = `Your donor account is linked but we're missing your pledge history. This usually happens with direct PayPal purchases or store orders. We can help restore your contribution records.`;
  } else if (!status.hasAddress) {
    statusType = 'warning';
    icon = AlertTriangle;
    message = `Your account is connected with ${status.pledgeCount} pledge${status.pledgeCount !== 1 ? 's' : ''} totaling $${status.totalPledged.toFixed(2)}, but you're missing a shipping address. You may want to add one for perk fulfillment.`;
  } else {
    statusType = 'success';
    icon = CheckCircle2;
    message = `Your account is fully connected with ${status.pledgeCount} pledge${status.pledgeCount !== 1 ? 's' : ''} totaling $${status.totalPledged.toFixed(2)}.`;
  }

  const Icon = icon;

  return (
    <Alert 
      className={`border ${
        statusType === 'success' 
          ? 'border-green-500/50 bg-green-500/10' 
          : statusType === 'warning'
          ? 'border-yellow-500/50 bg-yellow-500/10'
          : 'border-red-500/50 bg-red-500/10'
      }`}
    >
      <Icon className={`h-5 w-5 ${
        statusType === 'success' 
          ? 'text-green-500' 
          : statusType === 'warning'
          ? 'text-yellow-500'
          : 'text-red-500'
      }`} />
      <AlertDescription className="text-base ml-2">
        {message}
      </AlertDescription>
    </Alert>
  );
};

export default UserStatusBanner;
export type { UserStatus };
