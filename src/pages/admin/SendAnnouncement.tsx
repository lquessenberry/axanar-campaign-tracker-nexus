import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Send, Users } from "lucide-react";

export default function SendAnnouncement() {
  const [title, setTitle] = useState("Canonical Rewards System Complete - Your Perks Are Now Linked!");
  const [content, setContent] = useState(`We're excited to announce that the canonical rewards system is now complete!

🎉 What This Means For You:
• 100% of Kickstarter pledges are now linked to their rewards (2,169/2,169 pledges)
• 95.3% of Indiegogo pledges are linked (15,816/16,596 pledges)
• Your dashboard now shows all your earned perks and physical rewards
• Historical reward data has been fully restored from original campaign records

You can now view your complete "trophy collection" of earned perks, ambassadorial titles, and physical rewards on your profile dashboard. All shipping addresses are ready for future fulfillment.

Thank you for your patience as we completed this critical data migration milestone!`);
  const [isSending, setIsSending] = useState(false);
  const [activeUserCount, setActiveUserCount] = useState<number | null>(null);

  const fetchActiveUserCount = async () => {
    try {
      const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();
      
      const { data: threads } = await supabase
        .from('forum_threads')
        .select('author_user_id')
        .gte('created_at', sixtyDaysAgo)
        .not('author_user_id', 'is', null);

      const { data: comments } = await supabase
        .from('forum_comments')
        .select('author_user_id')
        .gte('created_at', sixtyDaysAgo)
        .not('author_user_id', 'is', null);

      const userIds = new Set<string>([
        ...(threads?.map(t => t.author_user_id).filter((id): id is string => id !== null) || []),
        ...(comments?.map(c => c.author_user_id).filter((id): id is string => id !== null) || [])
      ]);

      setActiveUserCount(userIds.size);
    } catch (error) {
      console.error("Error fetching active user count:", error);
      toast.error("Failed to fetch active user count");
    }
  };

  const handleSend = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Please provide both title and content");
      return;
    }

    setIsSending(true);

    try {
      // Get current admin user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Not authenticated");
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single();

      // Create official forum thread
      const { data: thread, error: threadError } = await supabase
        .from('forum_threads')
        .insert({
          title,
          content,
          author_user_id: user.id,
          author_username: profile?.username || 'Admin',
          category: 'announcements',
          is_official: true,
          is_pinned: true,
        })
        .select()
        .single();

      if (threadError) throw threadError;

      // Get active forum users from last 60 days
      const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();
      
      const { data: threads } = await supabase
        .from('forum_threads')
        .select('author_user_id')
        .gte('created_at', sixtyDaysAgo)
        .not('author_user_id', 'is', null);

      const { data: comments } = await supabase
        .from('forum_comments')
        .select('author_user_id')
        .gte('created_at', sixtyDaysAgo)
        .not('author_user_id', 'is', null);

      // Collect unique user IDs
      const userIds = new Set<string>([
        ...(threads?.map(t => t.author_user_id).filter((id): id is string => id !== null) || []),
        ...(comments?.map(c => c.author_user_id).filter((id): id is string => id !== null) || [])
      ]);

      if (userIds.size === 0) {
        toast.error("No active forum users found in the last 60 days");
        return;
      }

      // Get email addresses from auth.users via admin API
      const recipientEmails: string[] = [];
      for (const userId of Array.from(userIds)) {
        const { data: userData } = await supabase.auth.admin.getUserById(userId);
        if (userData?.user?.email) {
          recipientEmails.push(userData.user.email);
        }
      }

      if (recipientEmails.length === 0) {
        toast.error("No email addresses found for active users");
        return;
      }

      // Send announcement emails
      const { error: emailError } = await supabase.functions.invoke(
        'send-announcement-email',
        {
          body: {
            thread_id: thread.id,
            thread_title: title,
            thread_content: content,
            recipient_emails: recipientEmails,
          }
        }
      );

      if (emailError) throw emailError;

      toast.success(`Announcement posted and sent to ${recipientEmails.length} active users!`);

      // Reset form
      setTitle("");
      setContent("");
    } catch (error: any) {
      console.error("Error sending announcement:", error);
      toast.error(error.message || "Failed to send announcement");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Send Forum Announcement
          </CardTitle>
          <CardDescription>
            Create an official pinned announcement and notify all active forum users via email
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Announcement Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter announcement title..."
              disabled={isSending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Announcement Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter announcement content..."
              rows={12}
              disabled={isSending}
            />
          </div>

          <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
            <Users className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm font-medium">Active Forum Users (Last 60 Days)</p>
              <p className="text-xs text-muted-foreground">
                {activeUserCount !== null 
                  ? `${activeUserCount} users will receive this announcement`
                  : 'Click "Check Recipients" to see count'}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchActiveUserCount}
              disabled={isSending}
            >
              Check Recipients
            </Button>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleSend}
              disabled={isSending || !title.trim() || !content.trim()}
              className="flex-1"
            >
              {isSending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Post & Send Emails
                </>
              )}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            This will create an official pinned thread in the Announcements category and send email notifications to all users who have posted or commented in the last 60 days.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
