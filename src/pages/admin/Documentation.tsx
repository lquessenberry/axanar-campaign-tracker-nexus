import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Database, Zap, Users, Gift, FileText, Settings, Mail, Video } from "lucide-react";

const Documentation = () => {
  const [activeTab, setActiveTab] = useState("canonical-rewards");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">System Documentation</h1>
        <p className="text-muted-foreground">Reference documentation for admin systems and edge functions</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="canonical-rewards" className="gap-2">
            <Gift className="h-4 w-4" />
            Canonical Rewards
          </TabsTrigger>
          <TabsTrigger value="edge-functions" className="gap-2">
            <Zap className="h-4 w-4" />
            Edge Functions
          </TabsTrigger>
          <TabsTrigger value="database" className="gap-2">
            <Database className="h-4 w-4" />
            Database Schema
          </TabsTrigger>
          <TabsTrigger value="auth" className="gap-2">
            <Users className="h-4 w-4" />
            Auth & Users
          </TabsTrigger>
        </TabsList>

        <TabsContent value="canonical-rewards" className="mt-6">
          <CanonicalRewardsDoc />
        </TabsContent>

        <TabsContent value="edge-functions" className="mt-6">
          <EdgeFunctionsDoc />
        </TabsContent>

        <TabsContent value="database" className="mt-6">
          <DatabaseDoc />
        </TabsContent>

        <TabsContent value="auth" className="mt-6">
          <AuthDoc />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const CanonicalRewardsDoc = () => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5" />
          Canonical Rewards Restoration System
        </CardTitle>
        <CardDescription>
          Restores the 61 canonical reward tiers from historical campaign data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-semibold mb-2">Purpose</h3>
          <p className="text-sm text-muted-foreground">
            This system creates canonical reward records from the verified historical spreadsheet data, 
            reassigns pledges from duplicate rewards to canonical versions, and cleans up orphaned duplicates.
          </p>
        </div>

        <div>
          <h3 className="font-semibold mb-3">Campaign Data (61 Canonical Rewards)</h3>
          <div className="grid gap-3">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="font-medium">Star Trek: Prelude to Axanar (Kickstarter)</span>
              <Badge>10 tiers</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="font-medium">Star Trek: Axanar (Kickstarter)</span>
              <Badge>22 tiers</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="font-medium">Axanar (Indiegogo)</span>
              <Badge>29 tiers</Badge>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-3">Edge Function: create-canonical-rewards</h3>
          <div className="space-y-3">
            <PhaseCard 
              phase={1} 
              title="Load Canonical Data" 
              description="Loads 61 canonical reward definitions from embedded data"
            />
            <PhaseCard 
              phase={2} 
              title="Find/Create Canonical Rewards" 
              description="Creates canonical rewards if they don't exist, maps duplicate IDs"
            />
            <PhaseCard 
              phase={3} 
              title="Reassign Pledges" 
              description="Moves pledges from duplicates to canonical rewards (500/batch)"
            />
            <PhaseCard 
              phase={4} 
              title="Delete Orphaned Duplicates" 
              description="Removes duplicate rewards with 0 pledges"
            />
            <PhaseCard 
              phase={5} 
              title="Assign Unassigned Pledges" 
              description="Matches pledges without rewards by amount to canonical tiers"
            />
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Key Files</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li><code className="bg-muted px-1 rounded">supabase/functions/create-canonical-rewards/index.ts</code></li>
            <li><code className="bg-muted px-1 rounded">src/components/admin/CanonicalRewardsButton.tsx</code></li>
            <li><code className="bg-muted px-1 rounded">src/pages/admin/CreateCanonicalRewards.tsx</code></li>
          </ul>
        </div>
      </CardContent>
    </Card>
  </div>
);

const EdgeFunctionsDoc = () => (
  <div className="space-y-4">
    <Card>
      <CardHeader>
        <CardTitle>Edge Functions Overview</CardTitle>
        <CardDescription>Serverless functions deployed to Supabase</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px]">
          <div className="space-y-4">
            <FunctionCard 
              name="create-canonical-rewards"
              description="Restores canonical reward tiers and reassigns pledges"
              auth="Super Admin"
            />
            <FunctionCard 
              name="send-forum-notification"
              description="Sends email notifications when admins reply to forum threads"
              auth="Service Role"
            />
            <FunctionCard 
              name="send-support-notification"
              description="Sends email notifications for support message replies"
              auth="Service Role"
            />
            <FunctionCard 
              name="scrape-youtube-playlist"
              description="Scrapes YouTube playlists/RSS feeds for Axanar TV"
              auth="Public"
            />
            <FunctionCard 
              name="archive-video"
              description="Archives videos to archive.today for redundancy"
              auth="Public"
            />
            <FunctionCard 
              name="send-donor-invitation"
              description="Sends account activation emails to unlinked donors"
              auth="Admin"
            />
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  </div>
);

const DatabaseDoc = () => (
  <div className="space-y-4">
    <Card>
      <CardHeader>
        <CardTitle>Core Tables</CardTitle>
        <CardDescription>Primary database tables and relationships</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px]">
          <div className="space-y-3">
            <TableCard name="donors" description="Donor profiles (legacy + new)" />
            <TableCard name="pledges" description="Individual pledge records linked to donors, campaigns, and rewards" />
            <TableCard name="rewards" description="Reward tiers for each campaign" />
            <TableCard name="campaigns" description="Campaign records (Kickstarter, Indiegogo)" />
            <TableCard name="addresses" description="Shipping addresses for donors" />
            <TableCard name="profiles" description="Auth user profiles" />
            <TableCard name="admin_users" description="Admin role assignments" />
            <TableCard name="ambassadorial_titles" description="62 canonical ambassadorial titles" />
            <TableCard name="forum_threads" description="Forum discussion threads" />
            <TableCard name="forum_comments" description="Comments on forum threads" />
            <TableCard name="axanar_videos" description="Scraped videos for Axanar TV" />
            <TableCard name="direct_messages" description="User-to-user and support messages" />
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  </div>
);

const AuthDoc = () => (
  <div className="space-y-4">
    <Card>
      <CardHeader>
        <CardTitle>Authentication & User Linkage</CardTitle>
        <CardDescription>How auth users connect to donor records</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2">User Flow</h3>
          <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
            <li>User signs up via Supabase Auth (email/password)</li>
            <li>Profile record created in <code className="bg-muted px-1 rounded">profiles</code> table</li>
            <li>System checks for existing donor record by email</li>
            <li>If found, links <code className="bg-muted px-1 rounded">donors.auth_user_id</code> to auth user</li>
            <li>User gains access to their pledge history and rewards</li>
          </ol>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Admin Roles</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-muted rounded">
              <span className="text-sm">Super Admin</span>
              <Badge variant="destructive">Full Access</Badge>
            </div>
            <div className="flex items-center justify-between p-2 bg-muted rounded">
              <span className="text-sm">Content Manager</span>
              <Badge variant="secondary">Limited Access</Badge>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Key Tables</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li><code className="bg-muted px-1 rounded">admin_users</code> - Admin role assignments</li>
            <li><code className="bg-muted px-1 rounded">profiles</code> - Auth user profiles</li>
            <li><code className="bg-muted px-1 rounded">donors</code> - Donor records with auth_user_id link</li>
            <li><code className="bg-muted px-1 rounded">donor_invitation_log</code> - Account activation tracking</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  </div>
);

const PhaseCard = ({ phase, title, description }: { phase: number; title: string; description: string }) => (
  <div className="flex gap-3 p-3 bg-muted rounded-lg">
    <Badge variant="outline" className="h-6 w-6 rounded-full p-0 flex items-center justify-center shrink-0">
      {phase}
    </Badge>
    <div>
      <p className="font-medium text-sm">{title}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  </div>
);

const FunctionCard = ({ name, description, auth }: { name: string; description: string; auth: string }) => (
  <div className="p-3 border rounded-lg">
    <div className="flex items-center justify-between mb-1">
      <code className="text-sm font-mono">{name}</code>
      <Badge variant="outline" className="text-xs">{auth}</Badge>
    </div>
    <p className="text-xs text-muted-foreground">{description}</p>
  </div>
);

const TableCard = ({ name, description }: { name: string; description: string }) => (
  <div className="flex items-center justify-between p-2 border rounded">
    <code className="text-sm font-mono">{name}</code>
    <span className="text-xs text-muted-foreground">{description}</span>
  </div>
);

export default Documentation;
