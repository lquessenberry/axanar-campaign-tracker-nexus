import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  Database, Zap, Users, Gift, FileText, Settings, Mail, Video, 
  MessageCircle, Trophy, Shield, BarChart3, Package, Home, Layers
} from "lucide-react";

const Documentation = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">System Documentation</h1>
        <p className="text-muted-foreground">Comprehensive reference for the Axanar Donor Platform</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="overview" className="gap-2">
            <Home className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="database" className="gap-2">
            <Database className="h-4 w-4" />
            Database
          </TabsTrigger>
          <TabsTrigger value="edge-functions" className="gap-2">
            <Zap className="h-4 w-4" />
            Edge Functions
          </TabsTrigger>
          <TabsTrigger value="auth" className="gap-2">
            <Users className="h-4 w-4" />
            Auth & Users
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Campaigns
          </TabsTrigger>
          <TabsTrigger value="rewards" className="gap-2">
            <Gift className="h-4 w-4" />
            Rewards
          </TabsTrigger>
          <TabsTrigger value="forum" className="gap-2">
            <MessageCircle className="h-4 w-4" />
            Forum
          </TabsTrigger>
          <TabsTrigger value="axanar-tv" className="gap-2">
            <Video className="h-4 w-4" />
            Axanar TV
          </TabsTrigger>
          <TabsTrigger value="messaging" className="gap-2">
            <Mail className="h-4 w-4" />
            Messaging
          </TabsTrigger>
          <TabsTrigger value="admin-tools" className="gap-2">
            <Settings className="h-4 w-4" />
            Admin Tools
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6"><OverviewDoc /></TabsContent>
        <TabsContent value="database" className="mt-6"><DatabaseDoc /></TabsContent>
        <TabsContent value="edge-functions" className="mt-6"><EdgeFunctionsDoc /></TabsContent>
        <TabsContent value="auth" className="mt-6"><AuthDoc /></TabsContent>
        <TabsContent value="campaigns" className="mt-6"><CampaignsDoc /></TabsContent>
        <TabsContent value="rewards" className="mt-6"><RewardsDoc /></TabsContent>
        <TabsContent value="forum" className="mt-6"><ForumDoc /></TabsContent>
        <TabsContent value="axanar-tv" className="mt-6"><AxanarTVDoc /></TabsContent>
        <TabsContent value="messaging" className="mt-6"><MessagingDoc /></TabsContent>
        <TabsContent value="admin-tools" className="mt-6"><AdminToolsDoc /></TabsContent>
      </Tabs>
    </div>
  );
};

// ============== OVERVIEW ==============
const OverviewDoc = () => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>Axanar Donor Platform</CardTitle>
        <CardDescription>Fan community support, pledge management, and engagement platform</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-semibold mb-2">Platform Purpose</h3>
          <p className="text-sm text-muted-foreground">
            The Axanar Donor Platform consolidates donor data from multiple crowdfunding campaigns 
            (Kickstarter, Indiegogo, PayPal) into a unified system for pledge tracking, reward fulfillment, 
            community engagement, and donor recognition.
          </p>
        </div>

        <div>
          <h3 className="font-semibold mb-3">Core Systems</h3>
          <div className="grid gap-3 md:grid-cols-2">
            <SystemCard icon={Users} title="User Management" desc="Auth, profiles, donor-auth linkage, account merging" />
            <SystemCard icon={Package} title="Pledge System" desc="Campaign pledges, reward associations, fulfillment tracking" />
            <SystemCard icon={Gift} title="Rewards & Titles" desc="61 canonical rewards, 62 ambassadorial titles, digital perks" />
            <SystemCard icon={MessageCircle} title="Forum" desc="Community discussions, categories, notifications" />
            <SystemCard icon={Video} title="Axanar TV" desc="YouTube aggregation, live TV channel, video archiving" />
            <SystemCard icon={Mail} title="Direct Messages" desc="User-to-user messaging, support system" />
            <SystemCard icon={Trophy} title="ARES XP" desc="Gamification, XP tracking, leaderboards" />
            <SystemCard icon={Shield} title="Admin Tools" desc="Donor management, data restoration, analytics" />
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Key Integrations</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• <strong>Supabase</strong> - Database, auth, edge functions, storage</li>
            <li>• <strong>Resend</strong> - Email notifications (forum, support, invitations)</li>
            <li>• <strong>YouTube</strong> - Video embedding, RSS feed scraping</li>
            <li>• <strong>Archive.today</strong> - Video archival for redundancy</li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Production Domain</h3>
          <code className="bg-muted px-2 py-1 rounded text-sm">axanardonors.com</code>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Support Contact</h3>
          <code className="bg-muted px-2 py-1 rounded text-sm">axanartech@gmail.com</code>
        </div>
      </CardContent>
    </Card>
  </div>
);

// ============== DATABASE ==============
const DatabaseDoc = () => (
  <div className="space-y-4">
    <Card>
      <CardHeader>
        <CardTitle>Database Schema</CardTitle>
        <CardDescription>Supabase PostgreSQL tables and relationships</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="w-full">
          <AccordionItem value="core">
            <AccordionTrigger>Core Tables</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                <TableDoc name="donors" desc="Donor profiles (legacy + new). Links to auth via auth_user_id" 
                  cols={["id", "email", "auth_user_id", "first_name", "last_name", "donor_name", "avatar_url", "bio"]} />
                <TableDoc name="profiles" desc="Auth user profiles created on signup" 
                  cols={["id (auth.uid)", "username", "avatar_url", "created_at"]} />
                <TableDoc name="admin_users" desc="Admin role assignments" 
                  cols={["user_id", "is_super_admin", "is_content_manager"]} />
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="campaigns">
            <AccordionTrigger>Campaign & Pledge Tables</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                <TableDoc name="campaigns" desc="Campaign records (Kickstarter, Indiegogo)" 
                  cols={["id", "name", "provider", "goal_amount", "start_date", "end_date", "status"]} />
                <TableDoc name="pledges" desc="Individual pledge records" 
                  cols={["id", "donor_id", "campaign_id", "reward_id", "amount", "pledge_date", "shipping_status"]} />
                <TableDoc name="rewards" desc="Reward tiers for each campaign" 
                  cols={["id", "campaign_id", "name", "minimum_amount", "description", "is_physical"]} />
                <TableDoc name="campaign_display_overrides" desc="Override displayed campaign totals" 
                  cols={["campaign_id", "display_amount", "display_backers", "source_note"]} />
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="titles">
            <AccordionTrigger>Titles & Recognition</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                <TableDoc name="ambassadorial_titles" desc="62 canonical ambassadorial titles" 
                  cols={["id", "slug", "display_name", "minimum_pledge_amount", "campaign_id", "tier_level", "xp_multiplier"]} />
                <TableDoc name="forum_badges" desc="Forum achievement badges" 
                  cols={["id", "slug", "label", "description", "icon"]} />
                <TableDoc name="forum_user_badges" desc="Badge assignments to users" 
                  cols={["user_id", "badge_id", "source", "awarded_at"]} />
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="forum">
            <AccordionTrigger>Forum Tables</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                <TableDoc name="forum_threads" desc="Discussion threads" 
                  cols={["id", "title", "content", "category", "author_user_id", "is_pinned", "is_official", "video_id"]} />
                <TableDoc name="forum_comments" desc="Thread comments/replies" 
                  cols={["id", "thread_id", "content", "author_user_id", "parent_comment_id"]} />
                <TableDoc name="forum_likes" desc="Likes on threads/comments" 
                  cols={["id", "user_id", "thread_id", "comment_id"]} />
                <TableDoc name="forum_notifications" desc="User notifications" 
                  cols={["id", "user_id", "type", "thread_id", "actor_username", "is_read"]} />
                <TableDoc name="forum_reports" desc="Content reports" 
                  cols={["id", "reporter_user_id", "thread_id", "comment_id", "reason", "status"]} />
                <TableDoc name="forum_bookmarks" desc="Saved threads" 
                  cols={["user_id", "thread_id"]} />
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="messaging">
            <AccordionTrigger>Messaging Tables</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                <TableDoc name="direct_messages" desc="User-to-user and support messages" 
                  cols={["id", "sender_id", "recipient_id", "thread_id", "content", "is_read", "message_type"]} />
                <TableDoc name="message_threads" desc="Conversation threads" 
                  cols={["id", "participant_ids", "last_message_at", "thread_type"]} />
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="video">
            <AccordionTrigger>Video Tables</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                <TableDoc name="axanar_videos" desc="Scraped YouTube videos for Axanar TV" 
                  cols={["id", "video_id", "title", "video_url", "archive_url", "playlist_title", "source_channel", "published_at"]} />
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="addresses">
            <AccordionTrigger>Address & Shipping</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                <TableDoc name="addresses" desc="Shipping addresses for donors" 
                  cols={["id", "donor_id", "address1", "address2", "city", "state", "postal_code", "country", "is_primary"]} />
                <TableDoc name="address_change_log" desc="Audit log for address changes" 
                  cols={["id", "donor_id", "address_id", "action", "old_values", "new_values"]} />
                <TableDoc name="address_update_diagnostics" desc="Debug info for address update failures" 
                  cols={["id", "donor_id", "status", "error_message", "address_data"]} />
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="audit">
            <AccordionTrigger>Audit & Logging</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                <TableDoc name="admin_action_audit" desc="Admin action audit trail" 
                  cols={["id", "admin_user_id", "action_type", "target_table", "target_id", "old_values", "new_values"]} />
                <TableDoc name="audit_trail" desc="General audit trail" 
                  cols={["id", "donor_id", "action", "details", "ip_address"]} />
                <TableDoc name="donor_invitation_log" desc="Account invitation tracking" 
                  cols={["id", "donor_id", "email", "invitation_sent_at", "account_activated_at"]} />
                <TableDoc name="auth_migration_log" desc="Auth migration batch logs" 
                  cols={["id", "batch_id", "donor_id", "email", "status", "error_message"]} />
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="xp">
            <AccordionTrigger>XP & Credits</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                <TableDoc name="axanar_credits_transactions" desc="XP/credits transaction log" 
                  cols={["id", "user_id", "amount", "transaction_type", "source", "reference_id"]} />
                <TableDoc name="axanar_credits_reserve" desc="Daily XP budget tracking" 
                  cols={["id", "reserve_date", "daily_budget", "total_allocated", "total_remaining"]} />
                <TableDoc name="external_transactions" desc="External platform transactions (future)" 
                  cols={["id", "user_id", "platform", "amount", "xp_awarded"]} />
                <TableDoc name="external_platform_links" desc="User links to external platforms (future)" 
                  cols={["id", "user_id", "platform", "external_id", "is_verified"]} />
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="views">
            <AccordionTrigger>Views & Materialized Views</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                <TableDoc name="campaign_analytics" desc="Campaign stats aggregation" cols={["campaign_id", "total_raised", "unique_donors"]} />
                <TableDoc name="campaign_totals" desc="Campaign totals view" cols={["campaign_id", "total_amount", "backers_count"]} />
                <TableDoc name="contributor_leaderboard" desc="Leaderboard data" cols={["donor_id", "total_donated", "campaigns_supported"]} />
                <TableDoc name="donor_pledge_totals" desc="Donor pledge summaries" cols={["donor_id", "total_donated", "pledge_count"]} />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  </div>
);

// ============== EDGE FUNCTIONS ==============
const EdgeFunctionsDoc = () => (
  <div className="space-y-4">
    <Card>
      <CardHeader>
        <CardTitle>Edge Functions</CardTitle>
        <CardDescription>Supabase serverless functions</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="w-full">
          <AccordionItem value="rewards">
            <AccordionTrigger>Rewards & Data Restoration</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                <FunctionDoc 
                  name="create-canonical-rewards" 
                  auth="Super Admin"
                  desc="Restores 61 canonical reward tiers from historical data, reassigns pledges from duplicates, cleans orphans"
                  phases={[
                    "Load canonical data (61 rewards)",
                    "Find/create canonical rewards, map duplicates",
                    "Reassign pledges in batches of 500",
                    "Delete orphaned duplicate rewards",
                    "Assign unassigned pledges by amount"
                  ]}
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="notifications">
            <AccordionTrigger>Email Notifications</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                <FunctionDoc 
                  name="send-forum-notification" 
                  auth="Service Role (DB Trigger)"
                  desc="Sends email when admins reply to forum threads. Triggered by database insert on forum_comments by admin users."
                  details="Uses Resend API. Sends from axanartech@gmail.com with CC to same address."
                />
                <FunctionDoc 
                  name="send-support-notification" 
                  auth="Service Role"
                  desc="Sends email notifications for support message replies"
                />
                <FunctionDoc 
                  name="send-donor-invitation" 
                  auth="Admin"
                  desc="Sends account activation emails to unlinked donors with magic links"
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="video">
            <AccordionTrigger>Video & Archival</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                <FunctionDoc 
                  name="scrape-youtube-playlist" 
                  auth="Public"
                  desc="Scrapes YouTube playlists and RSS feeds for Axanar TV"
                  details="Collects videos from @AxanarHQ, Avalon Fan Films, Chris Lea channels. Uses RSS feeds as primary source (bypasses bot protection). Limited to ~15 recent videos per feed."
                />
                <FunctionDoc 
                  name="archive-video" 
                  auth="Public"
                  desc="Archives YouTube videos to archive.today for redundancy"
                  details="Smart mode: lookup first, submit if missing. Stores archive_url in axanar_videos table."
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  </div>
);

// ============== AUTH ==============
const AuthDoc = () => (
  <div className="space-y-4">
    <Card>
      <CardHeader>
        <CardTitle>Authentication & User Management</CardTitle>
        <CardDescription>User accounts, donor linkage, and admin roles</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-semibold mb-3">User Registration Flow</h3>
          <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
            <li>User signs up via Supabase Auth (email/password)</li>
            <li>Profile record created in <code className="bg-muted px-1 rounded">profiles</code> table</li>
            <li>System checks for existing donor record by email</li>
            <li>If found, links <code className="bg-muted px-1 rounded">donors.auth_user_id</code> to auth user</li>
            <li>User gains access to pledge history, rewards, addresses</li>
          </ol>
        </div>

        <div>
          <h3 className="font-semibold mb-3">Donor-Auth Linkage</h3>
          <p className="text-sm text-muted-foreground mb-2">
            Critical for account continuity. Legacy donors must be linked to auth accounts to access their data.
          </p>
          <div className="bg-muted p-3 rounded text-sm">
            <strong>Current Stats:</strong> ~30,039 unlinked donors representing $719k in pledges
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-3">Account Merge Protocol</h3>
          <p className="text-sm text-muted-foreground mb-2">
            Users may have multiple accounts. Merging requires multi-point identity confirmation:
          </p>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Email match alone is <strong>insufficient</strong></li>
            <li>• Physical address from legacy data is critical confirmation</li>
            <li>• Source account archived (not deleted) after merge</li>
            <li>• Logged in <code className="bg-muted px-1 rounded">merged_accounts</code> table</li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-3">Admin Roles</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-muted rounded">
              <div>
                <span className="font-medium">Super Admin</span>
                <p className="text-xs text-muted-foreground">Full access to all admin functions</p>
              </div>
              <Badge variant="destructive">is_super_admin = true</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded">
              <div>
                <span className="font-medium">Content Manager</span>
                <p className="text-xs text-muted-foreground">Limited access to content management</p>
              </div>
              <Badge variant="secondary">is_content_manager = true</Badge>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Key RLS Functions</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li><code className="bg-muted px-1 rounded">check_current_user_is_admin()</code> - Checks if current user is admin</li>
            <li><code className="bg-muted px-1 rounded">check_user_is_super_admin(uuid)</code> - Checks if user is super admin</li>
            <li><code className="bg-muted px-1 rounded">enhanced_admin_security_check()</code> - Enhanced admin verification</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  </div>
);

// ============== CAMPAIGNS ==============
const CampaignsDoc = () => (
  <div className="space-y-4">
    <Card>
      <CardHeader>
        <CardTitle>Campaigns & Pledges</CardTitle>
        <CardDescription>Crowdfunding campaign data and pledge management</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-semibold mb-3">Active Campaigns</h3>
          <div className="space-y-2">
            <CampaignCard name="Star Trek: Prelude to Axanar" platform="Kickstarter" tiers={10} />
            <CampaignCard name="Star Trek: Axanar" platform="Kickstarter" tiers={22} />
            <CampaignCard name="Axanar" platform="Indiegogo" tiers={29} />
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-3">PayPal Campaign Consolidation</h3>
          <p className="text-sm text-muted-foreground">
            PayPal-variant campaigns have been consolidated into main campaigns. PayPal Axanar pledges → Axanar Indiegogo, 
            PayPal Prelude pledges → Prelude Kickstarter. PayPal campaigns may be marked inactive.
          </p>
        </div>

        <div>
          <h3 className="font-semibold mb-3">Pledge Structure</h3>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>Each pledge links: <code className="bg-muted px-1 rounded">donor_id</code> → <code className="bg-muted px-1 rounded">campaign_id</code> → <code className="bg-muted px-1 rounded">reward_id</code></p>
            <p>Fulfillment fields: <code className="bg-muted px-1 rounded">shipping_status</code>, <code className="bg-muted px-1 rounded">shipped_at</code>, <code className="bg-muted px-1 rounded">delivered_at</code>, <code className="bg-muted px-1 rounded">tracking_number</code></p>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-3">Data Migration Notes</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Legacy tier discovery from XLS import file names (e.g., "Axanar #1 - $65 List.xls")</li>
            <li>• Missing tiers created as "Secret Perk" entries with appropriate amounts</li>
            <li>• 628 donors from "Axanar #1" imports restored via migration</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  </div>
);

// ============== REWARDS ==============
const RewardsDoc = () => (
  <div className="space-y-4">
    <Card>
      <CardHeader>
        <CardTitle>Rewards System</CardTitle>
        <CardDescription>Canonical rewards and ambassadorial titles</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-semibold mb-3">Canonical Rewards (61 Total)</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Verified from historical spreadsheets. Each tier has platform-specific perk name, 
            minimum pledge amount, expected backer count, and physical/shipping flags.
          </p>
          <div className="grid gap-2">
            <div className="flex justify-between p-2 bg-muted rounded text-sm">
              <span>Prelude to Axanar (Kickstarter)</span>
              <Badge>10 tiers</Badge>
            </div>
            <div className="flex justify-between p-2 bg-muted rounded text-sm">
              <span>Star Trek: Axanar (Kickstarter)</span>
              <Badge>22 tiers</Badge>
            </div>
            <div className="flex justify-between p-2 bg-muted rounded text-sm">
              <span>Axanar (Indiegogo)</span>
              <Badge>29 tiers (multi-perk same-price entries)</Badge>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-3">Ambassadorial Titles (62 Total)</h3>
          <p className="text-sm text-muted-foreground mb-2">
            Immutable titles mapping to historical pledge tiers. Automatically assigned via triggers.
          </p>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• <strong>exact_perk_name</strong> - Original campaign perk name</li>
            <li>• <strong>minimum_pledge_amount</strong> - Threshold for earning</li>
            <li>• <strong>tier_level</strong> - 1-50 hierarchy</li>
            <li>• <strong>xp_multiplier</strong> - 1.0x-5.0x XP bonus</li>
            <li>• <strong>forum_xp_bonus</strong> - 25-2000+ bonus XP</li>
            <li>• 1 universal title: Foundation Contributor ($1+, all campaigns)</li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-3">Linkage Milestone</h3>
          <div className="bg-green-500/10 border border-green-500/30 p-3 rounded text-sm">
            <strong>Final Results:</strong>
            <ul className="mt-1 space-y-1">
              <li>• Prelude Kickstarter: 100% (19/19 pledges)</li>
              <li>• Axanar Kickstarter: 100% (2,150/2,150 pledges)</li>
              <li>• Axanar Indiegogo: 95.3% (15,816/16,596 pledges)</li>
            </ul>
            <p className="mt-2 text-muted-foreground">~780 unlinked = no-perk donations or cancelled</p>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

// ============== FORUM ==============
const ForumDoc = () => (
  <div className="space-y-4">
    <Card>
      <CardHeader>
        <CardTitle>Forum System</CardTitle>
        <CardDescription>Community discussions and engagement</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-semibold mb-3">Categories</h3>
          <p className="text-sm text-muted-foreground">
            Forum threads are categorized via the <code className="bg-muted px-1 rounded">forum_category</code> enum: 
            general, announcements, production, lore, fan-content, etc.
          </p>
        </div>

        <div>
          <h3 className="font-semibold mb-3">Features</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Thread creation with optional images</li>
            <li>• Nested comments (parent_comment_id)</li>
            <li>• Likes on threads and comments</li>
            <li>• Bookmarks for saved threads</li>
            <li>• Content reporting (pending/resolved)</li>
            <li>• Author post editing</li>
            <li>• Video integration (video_id links to Axanar TV)</li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-3">Admin Notifications</h3>
          <p className="text-sm text-muted-foreground">
            When admins reply to forum threads, email notifications are sent to thread participants via 
            <code className="bg-muted px-1 rounded">send-forum-notification</code> edge function. 
            Regular user comments do NOT trigger emails.
          </p>
        </div>

        <div>
          <h3 className="font-semibold mb-3">Video Discussion Integration</h3>
          <p className="text-sm text-muted-foreground">
            Forum threads can be linked to videos via <code className="bg-muted px-1 rounded">video_id</code>. 
            Users can create/comment on discussions directly from the Axanar TV player.
          </p>
        </div>
      </CardContent>
    </Card>
  </div>
);

// ============== AXANAR TV ==============
const AxanarTVDoc = () => (
  <div className="space-y-4">
    <Card>
      <CardHeader>
        <CardTitle>Axanar TV</CardTitle>
        <CardDescription>Video library and live broadcast experience</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-semibold mb-3">Architecture</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• <strong>Video Library</strong> (/videos) - Organized by playlist with theater-mode embed</li>
            <li>• <strong>Live TV Channel</strong> - Always-on broadcast cycling through videos sequentially</li>
            <li>• Index-based state management (not time-based) to prevent excessive iframe reloads</li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-3">Content Sources</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Axanar Productions (@AxanarHQ) - Official channel</li>
            <li>• Avalon Fan Films - Related fan content</li>
            <li>• Chris Lea - Additional creator</li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-3">Scraping Strategy</h3>
          <p className="text-sm text-muted-foreground">
            Uses YouTube RSS feeds as primary source (bypasses bot protection). Each channel has feed URL: 
            <code className="bg-muted px-1 rounded block mt-1">https://www.youtube.com/feeds/videos.xml?channel_id=[ID]</code>
            RSS limited to ~15 recent videos; playlist scraping retained for historical coverage.
          </p>
        </div>

        <div>
          <h3 className="font-semibold mb-3">Archive Strategy</h3>
          <p className="text-sm text-muted-foreground">
            Smart archive.today integration: (1) lookup existing archive, (2) submit if missing, (3) store URL. 
            Modes: smart (default), lookup-only, submit-only, skip.
          </p>
        </div>

        <div>
          <h3 className="font-semibold mb-3">Embedding Priority</h3>
          <p className="text-sm text-muted-foreground">
            YouTube embedded players are primary delivery. IPTV streaming was explored but deemed infeasible 
            due to Supabase Edge Function limitations (no binary support, sandbox restrictions).
          </p>
        </div>
      </CardContent>
    </Card>
  </div>
);

// ============== MESSAGING ==============
const MessagingDoc = () => (
  <div className="space-y-4">
    <Card>
      <CardHeader>
        <CardTitle>Direct Messages & Support</CardTitle>
        <CardDescription>User-to-user messaging and support system</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-semibold mb-3">Message Types</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• <strong>User-to-user</strong> - Direct conversations between users</li>
            <li>• <strong>Support</strong> - User-to-admin support requests</li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-3">Features</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Conversation threading</li>
            <li>• Archive (delete) at message and thread level</li>
            <li>• Optimistic UI updates with rollback</li>
            <li>• Mobile-optimized with swipe gestures</li>
            <li>• Unread message badges</li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-3">Support Issue Categories</h3>
          <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
            <li>Missing Contributions - History not showing</li>
            <li>Address Issues - Cannot update shipping address</li>
            <li>Account Merge - Multiple accounts to combine</li>
            <li>Email Change - Update email address</li>
            <li>Perks/Rewards - Cannot access earned rewards</li>
            <li>New Donation - Make new contribution</li>
            <li>General Question - Other</li>
          </ol>
        </div>

        <div>
          <h3 className="font-semibold mb-3">Email Notifications</h3>
          <p className="text-sm text-muted-foreground">
            Admin support replies trigger email notifications to users via 
            <code className="bg-muted px-1 rounded">send-support-notification</code>. 
            Sent from axanartech@gmail.com with CC to same address for records.
          </p>
        </div>
      </CardContent>
    </Card>
  </div>
);

// ============== ADMIN TOOLS ==============
const AdminToolsDoc = () => (
  <div className="space-y-4">
    <Card>
      <CardHeader>
        <CardTitle>Admin Tools</CardTitle>
        <CardDescription>Administrative functions and utilities</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="w-full">
          <AccordionItem value="donor">
            <AccordionTrigger>Donor Management</AccordionTrigger>
            <AccordionContent>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Search and filter donors</li>
                <li>• View/edit donor profiles</li>
                <li>• Link donors to auth accounts</li>
                <li>• Bulk invitation sending</li>
                <li>• Pledge history viewing</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="pledges">
            <AccordionTrigger>Pledge Management</AccordionTrigger>
            <AccordionContent>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• View all pledges with filters</li>
                <li>• Inline fulfillment status editing</li>
                <li>• Reward assignment</li>
                <li>• Shipping status, tracking number updates</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="restoration">
            <AccordionTrigger>Data Restoration</AccordionTrigger>
            <AccordionContent>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <strong>Pledge Data Restoration</strong> - Re-import from source files</li>
                <li>• <strong>Reward Reconciliation</strong> - Match unassigned pledges to rewards</li>
                <li>• <strong>Create Canonical Rewards</strong> - Restore 61 canonical reward tiers</li>
                <li>• <strong>Address Diagnostics</strong> - Debug address update failures</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="invitations">
            <AccordionTrigger>Donor Invitations</AccordionTrigger>
            <AccordionContent>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>Bulk account activation for unlinked donors:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Filter unlinked donors by pledge amount</li>
                  <li>Select donors for invitation</li>
                  <li>Send activation emails via Resend</li>
                  <li>Track in donor_invitation_log</li>
                </ol>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="video">
            <AccordionTrigger>Video Archive</AccordionTrigger>
            <AccordionContent>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Trigger YouTube playlist scraping</li>
                <li>• View video archive status</li>
                <li>• Manage archive.today submissions</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  </div>
);

// ============== HELPER COMPONENTS ==============
const SystemCard = ({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) => (
  <div className="flex gap-3 p-3 bg-muted rounded-lg">
    <Icon className="h-5 w-5 text-primary shrink-0 mt-0.5" />
    <div>
      <p className="font-medium text-sm">{title}</p>
      <p className="text-xs text-muted-foreground">{desc}</p>
    </div>
  </div>
);

const TableDoc = ({ name, desc, cols }: { name: string; desc: string; cols: string[] }) => (
  <div className="p-3 border rounded">
    <div className="flex items-start justify-between gap-2">
      <code className="text-sm font-mono font-medium">{name}</code>
    </div>
    <p className="text-xs text-muted-foreground mt-1">{desc}</p>
    <div className="flex flex-wrap gap-1 mt-2">
      {cols.map(col => (
        <Badge key={col} variant="outline" className="text-xs font-mono">{col}</Badge>
      ))}
    </div>
  </div>
);

const FunctionDoc = ({ name, auth, desc, details, phases }: { 
  name: string; auth: string; desc: string; details?: string; phases?: string[] 
}) => (
  <div className="p-3 border rounded">
    <div className="flex items-center justify-between mb-1">
      <code className="text-sm font-mono font-medium">{name}</code>
      <Badge variant="outline" className="text-xs">{auth}</Badge>
    </div>
    <p className="text-xs text-muted-foreground">{desc}</p>
    {details && <p className="text-xs text-muted-foreground mt-2 italic">{details}</p>}
    {phases && (
      <div className="mt-2 space-y-1">
        {phases.map((phase, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <Badge variant="secondary" className="h-4 w-4 p-0 flex items-center justify-center text-[10px]">{i+1}</Badge>
            <span className="text-muted-foreground">{phase}</span>
          </div>
        ))}
      </div>
    )}
  </div>
);

const CampaignCard = ({ name, platform, tiers }: { name: string; platform: string; tiers: number }) => (
  <div className="flex items-center justify-between p-3 bg-muted rounded">
    <div>
      <p className="font-medium text-sm">{name}</p>
      <p className="text-xs text-muted-foreground">{platform}</p>
    </div>
    <Badge>{tiers} tiers</Badge>
  </div>
);

export default Documentation;
