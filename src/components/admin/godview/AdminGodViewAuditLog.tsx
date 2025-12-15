import React from 'react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import LCARSDataTable, { Column } from '@/components/admin/lcars/LCARSDataTable';
import LCARSStatCard from '@/components/admin/lcars/LCARSStatCard';
import { History, User, Shield, AlertTriangle, Edit, LogIn, LogOut } from 'lucide-react';

interface AuditEntry {
  id: string;
  action: string;
  created_at: string;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  changed_by_admin_id: string | null;
  source: 'address_change' | 'admin_action';
}

interface AdminGodViewAuditLogProps {
  auditLog: AuditEntry[];
  isLoading?: boolean;
}

const ACTION_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  login: { label: 'Login', color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: <LogIn className="h-3 w-3" /> },
  logout: { label: 'Logout', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30', icon: <LogOut className="h-3 w-3" /> },
  profile_update: { label: 'Profile Update', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: <Edit className="h-3 w-3" /> },
  address_update: { label: 'Address Update', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30', icon: <Edit className="h-3 w-3" /> },
  password_change: { label: 'Password Change', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: <Shield className="h-3 w-3" /> },
  pledge_created: { label: 'Pledge Created', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', icon: <History className="h-3 w-3" /> },
  reward_claimed: { label: 'Reward Claimed', color: 'bg-pink-500/20 text-pink-400 border-pink-500/30', icon: <History className="h-3 w-3" /> },
  email_verified: { label: 'Email Verified', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: <Shield className="h-3 w-3" /> },
  account_linked: { label: 'Account Linked', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', icon: <User className="h-3 w-3" /> },
  admin_action: { label: 'Admin Action', color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: <AlertTriangle className="h-3 w-3" /> },
};

const AdminGodViewAuditLog: React.FC<AdminGodViewAuditLogProps> = ({
  auditLog,
  isLoading = false,
}) => {
  // Calculate stats
  const stats = {
    total: auditLog.length,
    adminActions: auditLog.filter(e => e.source === 'admin_action' || e.changed_by_admin_id).length,
    userActions: auditLog.filter(e => e.source !== 'admin_action' && !e.changed_by_admin_id).length,
    recentCount: auditLog.filter(e => {
      const date = new Date(e.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return date > weekAgo;
    }).length,
  };

  const columns: Column<AuditEntry>[] = [
    {
      key: 'created_at',
      header: 'Timestamp',
      sortable: true,
      width: '180px',
      render: (row) => (
        <span className="text-sm tabular-nums text-muted-foreground">
          {row.created_at ? format(new Date(row.created_at), 'MMM d, yyyy h:mm a') : 'Unknown'}
        </span>
      ),
    },
    {
      key: 'action',
      header: 'Action',
      sortable: true,
      width: '160px',
      render: (row) => {
        const config = ACTION_CONFIG[row.action] || { 
          label: row.action, 
          color: 'bg-muted text-muted-foreground border-border', 
          icon: <History className="h-3 w-3" /> 
        };
        return (
          <Badge className={`gap-1 border ${config.color}`}>
            {config.icon}
            {config.label}
          </Badge>
        );
      },
    },
    {
      key: 'changes',
      header: 'Changes',
      render: (row) => {
        if (!row.new_values || Object.keys(row.new_values).length === 0) {
          return <span className="text-muted-foreground text-sm">—</span>;
        }
        const changedFields = Object.keys(row.new_values);
        return (
          <span className="text-sm">
            {changedFields.slice(0, 3).join(', ')}
            {changedFields.length > 3 && ` +${changedFields.length - 3} more`}
          </span>
        );
      },
    },
    {
      key: 'source',
      header: 'Source',
      sortable: true,
      width: '120px',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          {row.changed_by_admin_id || row.source === 'admin_action' ? (
            <>
              <Shield className="h-3.5 w-3.5 text-orange-400" />
              <span className="text-sm text-orange-400">Admin</span>
            </>
          ) : (
            <>
              <User className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">User</span>
            </>
          )}
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-muted/50 rounded-lg animate-pulse" />
          ))}
        </div>
        <div className="h-96 bg-muted/50 rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <LCARSStatCard
          title="Total Events"
          value={stats.total}
          icon={<History className="h-5 w-5" />}
          variant="default"
        />
        <LCARSStatCard
          title="This Week"
          value={stats.recentCount}
          icon={<History className="h-5 w-5" />}
          variant="primary"
        />
        <LCARSStatCard
          title="Admin Actions"
          value={stats.adminActions}
          icon={<Shield className="h-5 w-5" />}
          variant="warning"
        />
        <LCARSStatCard
          title="User Actions"
          value={stats.userActions}
          icon={<User className="h-5 w-5" />}
          variant="success"
        />
      </div>

      {/* Audit Log Table */}
      <LCARSDataTable
        data={auditLog}
        columns={columns}
        searchable
        searchPlaceholder="Search audit log..."
        searchKeys={['action']}
        selectable={false}
        emptyMessage="No activity recorded"
        compact
      />
    </div>
  );
};

export default AdminGodViewAuditLog;
