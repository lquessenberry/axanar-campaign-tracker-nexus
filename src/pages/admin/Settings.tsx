import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import DonorMigrationSection from "@/components/admin/DonorMigrationSection";
import AdminReserveUsersSection from "@/components/admin/AdminReserveUsersSection";
import AdminEmailUpdateTool from "@/components/admin/AdminEmailUpdateTool";
import { UpdateRewardsData } from "./UpdateRewardsData";
import { BetaUserOutreach } from "@/components/admin/BetaUserOutreach";
import { ProfileAudit } from "@/components/admin/ProfileAudit";
import { PledgeDataCorrection } from "@/components/admin/PledgeDataCorrection";
import { useSeedForumThreads } from "@/hooks/useSeedForumThreads";
import { MessageSquarePlus } from "lucide-react";

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

      <Tabs defaultValue="migration">
        <TabsList>
          <TabsTrigger value="migration">Data Migration</TabsTrigger>
          <TabsTrigger value="accounts">Account Management</TabsTrigger>
          <TabsTrigger value="reserve-users">Reserve Users</TabsTrigger>
          <TabsTrigger value="general">General Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="migration" className="space-y-6 mt-6">
          <DonorMigrationSection />
          <UpdateRewardsData />
          <BetaUserOutreach />
          <ProfileAudit />
          <PledgeDataCorrection />
        </TabsContent>

        <TabsContent value="accounts" className="space-y-6 mt-6">
          <AdminEmailUpdateTool />
        </TabsContent>

        <TabsContent value="reserve-users" className="space-y-6 mt-6">
          <AdminReserveUsersSection />
        </TabsContent>

        <TabsContent value="general" className="space-y-6 mt-6">
          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-lg font-semibold mb-2">General Settings</h3>
            <p className="text-muted-foreground">
              Platform-wide configuration options will be available here.
            </p>
          </div>

          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <MessageSquarePlus className="h-5 w-5" />
                  Seed Forum Threads
                </h3>
                <p className="text-sm text-muted-foreground">
                  Create official forum announcement threads (missing pledge data notice, etc.)
                </p>
              </div>
              <Button 
                onClick={seedThreads} 
                disabled={isSeeding}
                variant="default"
              >
                {isSeeding ? 'Seeding...' : 'Seed Threads'}
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
