import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, MessageSquare } from 'lucide-react';

export const BetaUserOutreach = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const emailTemplate = `Subject: Axanar Beta Update: Bugs Squashed & Your Data Shines!

Dear [Username],

Great news from Starfleet Command! We've successfully resolved the bugs you and other beta testers reported:

✓ Campaign Links Fixed: All Kickstarter/Indiegogo links now beam straight to the source
✓ Contribution Amounts Corrected: Your pledge history now displays accurately across all campaigns
✓ Physical Rewards Identified: T-shirts, patches, and other physical items are now properly flagged

Your Contribution Summary:
• Total Pledged: $[Total Amount]
• Campaigns Supported: [Campaign Count]
• Member Since: [Join Date]

We couldn't have done this without your feedback. Thank you for being part of this mission!

Next Steps:
→ Visit your dashboard to see the updated data
→ Continue testing and report any issues
→ Stay tuned for upcoming features (tactical battle system, forum enhancements)

Live Long and Prosper,
The Axanar Platform Team

P.S. Having issues? Reply to this email or open a support ticket in-app.`;

  const forumTemplate1 = `**[UPDATE - RESOLVED]**

Thanks for reporting this! The Kickstarter link issue has been verified and fixed. All campaign URLs now resolve correctly:

• Star Trek: Prelude to Axanar ✓
• Star Trek: Axanar ✓  
• Indiegogo Axanar ✓

Check your dashboard—everything should be working now! Let us know if you spot anything else.

Qapla' for helping us improve the platform! 🖖`;

  const forumTemplate2 = `**[FIXED]**

Great catch! This bug affected several donors. We've corrected the contribution amounts across all campaigns:

✓ Pledge totals now accurate
✓ Campaign associations fixed
✓ Physical rewards properly identified

Your profile should reflect the correct data now. If anything still looks off, please let us know!

Thanks for your patience and detailed bug report. 🚀`;

  const sendOutreach = async () => {
    setLoading(true);
    try {
      // Get users who have reported issues or have pledge data
      const { data: donors, error } = await supabase
        .from('donors')
        .select(`
          id,
          email,
          full_name,
          username,
          created_at
        `)
        .not('email', 'is', null)
        .limit(10); // Start with small batch for testing

      if (error) throw error;

      toast({
        title: "Outreach Templates Ready",
        description: `Prepared templates for ${donors?.length || 0} beta testers. Review before sending.`,
      });

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Beta User Outreach
          </CardTitle>
          <CardDescription>
            Notify users about bug fixes and data corrections
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Email Template</h3>
            <Textarea
              value={emailTemplate}
              readOnly
              className="font-mono text-xs h-64"
            />
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Forum Reply Templates
            </h3>
            <div className="space-y-2">
              <Textarea
                value={forumTemplate1}
                readOnly
                className="font-mono text-xs h-32"
              />
              <Textarea
                value={forumTemplate2}
                readOnly
                className="font-mono text-xs h-32"
              />
            </div>
          </div>

          <Button 
            onClick={sendOutreach}
            disabled={loading}
            className="w-full"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Prepare Outreach Campaign
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
