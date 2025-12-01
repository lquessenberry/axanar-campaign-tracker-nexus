import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DonorInvitation {
  id: string;
  email: string;
  full_name: string | null;
  total_pledged: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Verify admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    const { data: isAdmin } = await supabaseAdmin
      .rpc("check_current_user_is_admin");

    if (!isAdmin) {
      throw new Error("Admin access required");
    }

    const { donor_ids } = await req.json();

    if (!donor_ids || !Array.isArray(donor_ids) || donor_ids.length === 0) {
      throw new Error("Invalid donor_ids provided");
    }

    // Fetch donor details
    const { data: donors, error: donorsError } = await supabaseAdmin
      .from("donors")
      .select("id, email, full_name")
      .in("id", donor_ids)
      .is("auth_user_id", null);

    if (donorsError) throw donorsError;

    let sentCount = 0;
    const errors: string[] = [];

    for (const donor of donors as DonorInvitation[]) {
      try {
        // Generate password reset token
        const { data: resetData, error: resetError } = await supabaseAdmin.auth.admin.generateLink({
          type: 'magiclink',
          email: donor.email,
          options: {
            redirectTo: 'https://axanardonors.com/',
          }
        });

        if (resetError) {
          console.error(`Failed to generate link for ${donor.email}:`, resetError);
          errors.push(`${donor.email}: ${resetError.message}`);
          continue;
        }

        // Send invitation email via Resend
        const emailRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: "Axanar Productions <axanartech@gmail.com>",
            to: [donor.email],
            subject: "Activate Your Axanar Donor Account",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Activate Your Axanar Donor Account</h2>
                
                <p>Hello ${donor.full_name || 'Valued Supporter'},</p>
                
                <p>Thank you for your support of Axanar! We've created an account for you on our new donor portal where you can:</p>
                
                <ul>
                  <li>View your complete pledge history</li>
                  <li>Update your shipping address</li>
                  <li>Track your physical and digital perks</li>
                  <li>Participate in our community forums</li>
                  <li>Earn ARES XP and titles</li>
                </ul>
                
                <p>Click the button below to activate your account:</p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${resetData.properties.action_link}" 
                     style="background-color: #FF6600; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                    Activate Account
                  </a>
                </div>
                
                <p>This link will expire in 24 hours. If you need assistance, please contact us at <a href="mailto:axanartech@gmail.com">axanartech@gmail.com</a>.</p>
                
                <p>Thank you for your continued support!</p>
                
                <p style="color: #666; font-size: 12px; margin-top: 30px;">
                  If you did not request this email or have questions, please contact us at axanartech@gmail.com
                </p>
              </div>
            `,
          }),
        });

        if (!emailRes.ok) {
          const emailError = await emailRes.text();
          console.error(`Failed to send email to ${donor.email}:`, emailError);
          errors.push(`${donor.email}: Email send failed`);
          continue;
        }

        sentCount++;

        // Log invitation
        await supabaseAdmin.from("donor_invitation_log").insert({
          donor_id: donor.id,
          email: donor.email,
          invited_by: user.id,
          invitation_sent_at: new Date().toISOString(),
        });

      } catch (error) {
        console.error(`Error processing ${donor.email}:`, error);
        errors.push(`${donor.email}: ${error.message}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        sent_count: sentCount,
        errors: errors.length > 0 ? errors : undefined,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in send-donor-invitations:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
