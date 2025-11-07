import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailUpdateRequest {
  oldEmail: string;
  newEmail: string;
  userName: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { oldEmail, newEmail, userName }: EmailUpdateRequest = await req.json();

    console.log(`Sending email update confirmation to ${newEmail}`);

    // Send confirmation to new email address
    const emailResponse = await resend.emails.send({
      from: "Axanar Support <axanartech@gmail.com>",
      to: [newEmail],
      subject: "Email Address Updated Successfully",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Email Address Updated</h1>
          
          <p>Hi ${userName},</p>
          
          <p>This confirms that your email address has been successfully updated in the Axanar Donors system.</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Previous email:</strong> ${oldEmail}</p>
            <p style="margin: 5px 0;"><strong>New email:</strong> ${newEmail}</p>
          </div>
          
          <p>Your account details, donation history, and all associated records have been merged and updated accordingly.</p>
          
          <p>If you did not request this change or have any questions, please contact us immediately at <a href="mailto:axanartech@gmail.com">axanartech@gmail.com</a>.</p>
          
          <p>Thank you for your continued support!</p>
          
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            Best regards,<br>
            The Axanar Team
          </p>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending email update confirmation:", error);
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
