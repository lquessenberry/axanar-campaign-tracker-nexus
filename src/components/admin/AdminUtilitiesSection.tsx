import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CreateCanonicalRewards from "@/pages/admin/CreateCanonicalRewards";
import AxanarVideoArchiveStatus from "./AxanarVideoArchiveStatus";
import { UserDiagnostics } from "./UserDiagnostics";
import { AccountOperations } from "./AccountOperations";
import { Sparkles, Video, UserCog, Wrench } from "lucide-react";

export function AdminUtilitiesSection() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Utilities</h1>
        <p className="text-muted-foreground mt-2">
          One-time tools and diagnostics for data management.
        </p>
      </div>

      <Tabs defaultValue="diagnostics" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="diagnostics" className="flex items-center gap-2">
            <UserCog className="h-4 w-4" />
            <span className="hidden sm:inline">User Diagnostics</span>
          </TabsTrigger>
          <TabsTrigger value="accounts" className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            <span className="hidden sm:inline">Account Ops</span>
          </TabsTrigger>
          <TabsTrigger value="canonical" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">Canonical Rewards</span>
          </TabsTrigger>
          <TabsTrigger value="video" className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            <span className="hidden sm:inline">Video Archive</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="diagnostics" className="mt-6">
          <UserDiagnostics />
        </TabsContent>

        <TabsContent value="accounts" className="mt-6">
          <AccountOperations />
        </TabsContent>

        <TabsContent value="canonical" className="mt-6">
          <CreateCanonicalRewards />
        </TabsContent>

        <TabsContent value="video" className="mt-6">
          <AxanarVideoArchiveStatus />
        </TabsContent>
      </Tabs>
    </div>
  );
}
