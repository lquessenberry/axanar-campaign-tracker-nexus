import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DonorMigrationSection from "@/components/admin/DonorMigrationSection";
import AdminReserveUsersSection from "@/components/admin/AdminReserveUsersSection";
import { UpdateRewardsData } from "./UpdateRewardsData";
import { BetaUserOutreach } from "@/components/admin/BetaUserOutreach";
import { ProfileAudit } from "@/components/admin/ProfileAudit";
import { PledgeDataCorrection } from "@/components/admin/PledgeDataCorrection";

const Settings = () => {
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
