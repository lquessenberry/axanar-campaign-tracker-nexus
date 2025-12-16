import { AdminCriticalAlerts } from "./AdminCriticalAlerts";
import { AdminQuickSearch } from "./AdminQuickSearch";
import { AdminInboxQueue } from "./AdminInboxQueue";
import { AdminActivityFeed } from "./AdminActivityFeed";
import { AdminVIPRecoveryQueue } from "./AdminVIPRecoveryQueue";
import { AdminDailyPulse } from "./AdminDailyPulse";

export const AdminCommandCenter = () => {
  return (
    <div className="space-y-6">
      {/* Quick Search Bar - Top */}
      <AdminQuickSearch />

      {/* Critical Alerts - Impossible to miss */}
      <AdminCriticalAlerts />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Inbox Queue */}
        <AdminInboxQueue />

        {/* Right Column - Activity Feed */}
        <AdminActivityFeed />
      </div>

      {/* VIP Recovery Queue */}
      <AdminVIPRecoveryQueue />

      {/* Daily Pulse - Bottom */}
      <AdminDailyPulse />
    </div>
  );
};

export default AdminCommandCenter;
