import { AdminCriticalAlerts } from "./AdminCriticalAlerts";
import { AdminQuickSearch } from "./AdminQuickSearch";
import { AdminInboxQueue } from "./AdminInboxQueue";
import { AdminActivityFeed } from "./AdminActivityFeed";
import { AdminVIPRecoveryQueue } from "./AdminVIPRecoveryQueue";
import { AdminDailyPulse } from "./AdminDailyPulse";
import { LCARSBar } from "./LCARSBar";

export const AdminCommandCenter = () => {
  return (
    <div className="space-y-4 bg-background min-h-screen p-4">
      {/* Top LCARS segmented bar */}
      <LCARSBar position="top" />

      {/* Quick Search Bar - LCARS panel with left elbow */}
      <AdminQuickSearch />

      {/* Critical Alerts - Hero banner with asymmetric frame */}
      <AdminCriticalAlerts />

      {/* Main Content Grid - Two panels with opposing asymmetry */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Column - Inbox Queue (left-sided frame) */}
        <AdminInboxQueue />

        {/* Right Column - Activity Feed (right-sided frame) */}
        <AdminActivityFeed />
      </div>

      {/* VIP Recovery Queue - Full-width LCARS table with top frame */}
      <AdminVIPRecoveryQueue />

      {/* Daily Pulse - Footer bar with elbow connector */}
      <AdminDailyPulse />

      {/* Bottom LCARS segmented bar */}
      <LCARSBar position="bottom" />
    </div>
  );
};

export default AdminCommandCenter;
