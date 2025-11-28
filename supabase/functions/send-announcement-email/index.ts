import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnnouncementRequest {
  thread_id: string;
  thread_title: string;
  thread_content: string;
  recipient_emails: string[];
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { thread_id, thread_title, thread_content, recipient_emails }: AnnouncementRequest = await req.json();

    console.log(`Sending announcement to ${recipient_emails.length} recipients`);

    const threadUrl = `https://axanardonors.com/forum/thread/${thread_id}`;
    
    // Send individual emails to each recipient
    const emailPromises = recipient_emails.map(email => 
      resend.emails.send({
        from: "Axanar Donor Portal <axanartech@gmail.com>",
        to: email,
        cc: "axanartech@gmail.com",
        subject: `📢 New Announcement: ${thread_title}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">New Official Announcement</h2>
            <h3 style="color: #1e40af; margin-top: 24px;">${thread_title}</h3>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="color: #374151; line-height: 1.6; white-space: pre-wrap;">${thread_content}</p>
            </div>
            <p style="margin-top: 24px;">
              <a href="${threadUrl}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                View Full Announcement →
              </a>
            </p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />
            <p style="color: #6b7280; font-size: 14px;">
              This is an official announcement from the Axanar team. You received this because you're an active member of our community.
            </p>
            <p style="color: #6b7280; font-size: 12px; margin-top: 16px;">
              Questions? Contact us at <a href="mailto:axanartech@gmail.com" style="color: #2563eb;">axanartech@gmail.com</a>
            </p>
          </div>
        `,
      })
    );

    const results = await Promise.allSettled(emailPromises);
    
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    console.log(`Emails sent: ${successful} successful, ${failed} failed`);

    return new Response(
      JSON.stringify({ 
        success: true,
        sent: successful,
        failed: failed,
        total: recipient_emails.length
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error sending announcement emails:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
