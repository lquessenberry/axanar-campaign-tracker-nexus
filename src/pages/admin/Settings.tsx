import { Button } from "@/components/ui/button";
import DonorMigrationSection from "@/components/admin/DonorMigrationSection";
import AdminReserveUsersSection from "@/components/admin/AdminReserveUsersSection";
import { useSeedForumThreads } from "@/hooks/useSeedForumThreads";
import { MessageSquarePlus } from "lucide-react";
import { DaystromCard } from "@/components/ui/daystrom-card";

const Settings = () => {
  const { seedThreads, isSeeding } = useSeedForumThreads();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Platform Settings</h1>
        <p className="text-muted-foreground mt-2">
          Configure platform-wide settings and data management.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Data Migration */}
        <DonorMigrationSection />

        {/* Reserve Users */}
        <AdminReserveUsersSection />

        {/* Seed Forum Threads */}
        <DaystromCard className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <MessageSquarePlus className="h-5 w-5" />
                Seed Forum Threads
              </h3>
              <p className="text-sm text-muted-foreground">
                Create official forum announcement threads
              </p>
            </div>
            <Button onClick={seedThreads} disabled={isSeeding} size="sm">
              {isSeeding ? 'Seeding...' : 'Seed Threads'}
            </Button>
          </div>
        </DaystromCard>
      </div>
    </div>
  );
};

export default Settings;