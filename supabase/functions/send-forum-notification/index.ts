import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ForumNotificationRequest {
  recipient_email: string;
  recipient_username: string;
  admin_username: string;
  thread_title: string;
  thread_id: string;
  comment_content: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      recipient_email,
      recipient_username,
      admin_username,
      thread_title,
      thread_id,
      comment_content,
    }: ForumNotificationRequest = await req.json();

    console.log("Sending forum notification to:", recipient_email);

    const threadUrl = `https://axanardonors.com/forum/thread/${thread_id}`;

    const emailResponse = await resend.emails.send({
      from: "Axanar Support <axanartech@gmail.com>",
      to: [recipient_email],
      subject: `${admin_username} replied to your forum thread`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New Reply from Axanar Team</h2>
          <p>Hi ${recipient_username},</p>
          <p><strong>${admin_username}</strong> has replied to your forum thread:</p>
          <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #555;">${thread_title}</h3>
            <p style="color: #666; white-space: pre-wrap;">${comment_content.substring(0, 300)}${comment_content.length > 300 ? '...' : ''}</p>
          </div>
          <a href="${threadUrl}" style="display: inline-block; background: #0066CC; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">View Full Thread</a>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          <p style="color: #999; font-size: 12px;">
            You're receiving this email because you participated in a forum discussion on the Axanar platform.
            <br>Questions? Contact us at axanartech@gmail.com
          </p>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-forum-notification function:", error);
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
