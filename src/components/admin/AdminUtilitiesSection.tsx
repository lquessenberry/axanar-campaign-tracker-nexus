import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserDiagnostics } from "./UserDiagnostics";
import { AccountOperations } from "./AccountOperations";
import { UserCog, Wrench } from "lucide-react";

export function AdminUtilitiesSection() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Utilities</h1>
        <p className="text-muted-foreground mt-2">
          Diagnostics and account operations.
        </p>
      </div>

      <Tabs defaultValue="diagnostics" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="diagnostics" className="flex items-center gap-2">
            <UserCog className="h-4 w-4" />
            <span className="hidden sm:inline">User Diagnostics</span>
          </TabsTrigger>
          <TabsTrigger value="accounts" className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            <span className="hidden sm:inline">Account Ops</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="diagnostics" className="mt-6">
          <UserDiagnostics />
        </TabsContent>

        <TabsContent value="accounts" className="mt-6">
          <AccountOperations />
        </TabsContent>
      </Tabs>
    </div>
  );
}
