import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import DonorMigrationSection from "@/components/admin/DonorMigrationSection";
import AdminReserveUsersSection from "@/components/admin/AdminReserveUsersSection";
import { UserDiagnostics } from "@/components/admin/UserDiagnostics";
import { AccountOperations } from "@/components/admin/AccountOperations";
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

      <Tabs defaultValue="accounts">
        <TabsList>
          <TabsTrigger value="accounts">Account Tools</TabsTrigger>
          <TabsTrigger value="migration">Data Migration</TabsTrigger>
          <TabsTrigger value="reserve-users">Reserve Users</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            <UserDiagnostics />
            <AccountOperations />
          </div>
        </TabsContent>

        <TabsContent value="migration" className="space-y-6 mt-6">
          <DonorMigrationSection />
        </TabsContent>

        <TabsContent value="reserve-users" className="space-y-6 mt-6">
          <AdminReserveUsersSection />
        </TabsContent>
      </Tabs>

      {/* General Settings Card */}
      <div className="rounded-lg border bg-card p-6">
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
      </div>
    </div>
  );
};

export default Settings;