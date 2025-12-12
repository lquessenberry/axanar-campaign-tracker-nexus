import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface UpdateEmailRequest {
  userId: string;
  oldEmail: string;
  newEmail: string;
  userName: string;
  sendConfirmation?: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create admin client with service role
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Verify the requesting user is an admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user: requestingUser }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !requestingUser) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Check if requesting user is admin
    const { data: adminCheck } = await supabaseAdmin
      .from("admin_users")
      .select("user_id")
      .eq("user_id", requestingUser.id)
      .single();

    if (!adminCheck) {
      return new Response(JSON.stringify({ error: "Unauthorized - admin access required" }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { userId, oldEmail, newEmail, userName, sendConfirmation = true }: UpdateEmailRequest = await req.json();

    console.log(`Admin ${requestingUser.email} updating email for user ${userId}: ${oldEmail} -> ${newEmail}`);

    // Step 1: Update auth.users email using Admin API
    const { data: updatedUser, error: updateAuthError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { email: newEmail, email_confirm: true }
    );

    if (updateAuthError) {
      console.error("Failed to update auth email:", updateAuthError);
      return new Response(
        JSON.stringify({ error: `Failed to update auth email: ${updateAuthError.message}` }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Auth email updated successfully");

    // Step 2: Update donors table email
    const { error: donorUpdateError } = await supabaseAdmin
      .from("donors")
      .update({ email: newEmail, updated_at: new Date().toISOString() })
      .eq("auth_user_id", userId);

    if (donorUpdateError) {
      console.error("Failed to update donor email:", donorUpdateError);
      // Don't fail completely - auth was updated
    } else {
      console.log("Donor email updated successfully");
    }

    // Step 3: Update profiles table if it has email
    const { error: profileUpdateError } = await supabaseAdmin
      .from("profiles")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", userId);

    if (profileUpdateError) {
      console.log("Profile update note:", profileUpdateError.message);
    }

    // Step 4: Log the admin action
    await supabaseAdmin.from("admin_action_audit").insert({
      admin_user_id: requestingUser.id,
      action_type: "email_update",
      target_id: userId,
      target_table: "auth.users",
      old_values: { email: oldEmail },
      new_values: { email: newEmail },
      success: true,
    });

    // Step 5: Send confirmation email if requested
    if (sendConfirmation) {
      try {
        const { Resend } = await import("npm:resend@2.0.0");
        const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

        await resend.emails.send({
          from: "Axanar Support <support@axanardonors.com>",
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
              
              <p>Your account details, donation history, and all associated records have been updated accordingly.</p>
              
              <p>If you did not request this change or have any questions, please contact us immediately at <a href="mailto:axanartech@gmail.com">axanartech@gmail.com</a>.</p>
              
              <p>Thank you for your continued support!</p>
              
              <p style="color: #666; font-size: 12px; margin-top: 30px;">
                Best regards,<br>
                The Axanar Team
              </p>
            </div>
          `,
        });
        console.log("Confirmation email sent to", newEmail);
      } catch (emailError) {
        console.error("Failed to send confirmation email:", emailError);
        // Don't fail the whole operation for email failure
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Email updated from ${oldEmail} to ${newEmail}`,
        updatedUser: { id: updatedUser.user.id, email: updatedUser.user.email },
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in admin-update-email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
