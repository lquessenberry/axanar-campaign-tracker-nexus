import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminPledgesSection from "./AdminPledgesSection";
import AdminRewardsSection from "./AdminRewardsSection";
import { Package, Gift } from "lucide-react";

export function AdminPledgesRewardsSection() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Pledges & Rewards</h1>
        <p className="text-muted-foreground mt-2">
          Manage pledges and rewards.
        </p>
      </div>

      <Tabs defaultValue="pledges" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pledges" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            <span className="hidden sm:inline">Pledges</span>
          </TabsTrigger>
          <TabsTrigger value="rewards" className="flex items-center gap-2">
            <Gift className="h-4 w-4" />
            <span className="hidden sm:inline">Rewards</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pledges" className="mt-6">
          <AdminPledgesSection />
        </TabsContent>

        <TabsContent value="rewards" className="mt-6">
          <AdminRewardsSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}
