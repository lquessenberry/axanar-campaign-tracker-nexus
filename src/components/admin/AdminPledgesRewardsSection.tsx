import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminPledgesSection from "./AdminPledgesSection";
import AdminRewardsSection from "./AdminRewardsSection";
import { PledgeRewardReconciliation } from "./PledgeRewardReconciliation";
import { PledgeDataRestoration } from "./PledgeDataRestoration";
import { Package, Gift, Link, Database } from "lucide-react";

export function AdminPledgesRewardsSection() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Pledges & Rewards</h1>
        <p className="text-muted-foreground mt-2">
          Manage pledges, rewards, and reconciliation tools in one place.
        </p>
      </div>

      <Tabs defaultValue="pledges" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pledges" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            <span className="hidden sm:inline">Pledges</span>
          </TabsTrigger>
          <TabsTrigger value="rewards" className="flex items-center gap-2">
            <Gift className="h-4 w-4" />
            <span className="hidden sm:inline">Rewards</span>
          </TabsTrigger>
          <TabsTrigger value="reconciliation" className="flex items-center gap-2">
            <Link className="h-4 w-4" />
            <span className="hidden sm:inline">Reconcile</span>
          </TabsTrigger>
          <TabsTrigger value="restoration" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">Restore</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pledges" className="mt-6">
          <AdminPledgesSection />
        </TabsContent>

        <TabsContent value="rewards" className="mt-6">
          <AdminRewardsSection />
        </TabsContent>

        <TabsContent value="reconciliation" className="mt-6">
          <PledgeRewardReconciliation />
        </TabsContent>

        <TabsContent value="restoration" className="mt-6">
          <PledgeDataRestoration />
        </TabsContent>
      </Tabs>
    </div>
  );
}
