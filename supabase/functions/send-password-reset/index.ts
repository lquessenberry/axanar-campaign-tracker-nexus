
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PasswordResetRequest {
  email: string;
  redirectUrl?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, redirectUrl }: PasswordResetRequest = await req.json();
    
    console.log(`Processing password reset request for: ${email}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Rate limiting: Check attempts in last hour
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    
    const { count } = await supabase
      .from('password_reset_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('email', email.toLowerCase())
      .eq('ip_address', clientIp)
      .gte('created_at', oneHourAgo);

    if (count && count >= 5) {
      console.log(`Rate limit exceeded for ${email} from ${clientIp}`);
      return new Response(JSON.stringify({ 
        error: 'Too many password reset attempts. Please try again later.',
        retryAfter: '1 hour'
      }), {
        status: 429,
        headers: { 
          "Content-Type": "application/json",
          "Retry-After": "3600",
          ...corsHeaders 
        },
      });
    }

    // Log this attempt
    await supabase
      .from('password_reset_attempts')
      .insert({ email: email.toLowerCase(), ip_address: clientIp });

    // Check if email exists in the system
    const { data: emailCheck } = await supabase
      .rpc('check_email_in_system', { check_email: email });

    if (!emailCheck || emailCheck.length === 0) {
      // Don't reveal whether email exists for security
      return new Response(JSON.stringify({ 
        success: true, 
        message: "If this email exists in our system, you will receive a password reset link." 
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const emailData = emailCheck[0];

    // Generate recovery token
    const { data: recoveryData } = await supabase
      .rpc('initiate_account_recovery', {
        user_email: email,
        recovery_type: 'password_reset'
      });

    if (!recoveryData || recoveryData.length === 0 || !recoveryData[0].success) {
      console.error('Failed to generate recovery token');
      return new Response(JSON.stringify({ 
        error: recoveryData?.[0]?.message || "Failed to initiate password reset" 
      }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { recovery_token, expires_at } = recoveryData[0];
    const resetUrl = `${redirectUrl || 'https://axanardonors.com'}/auth/reset-password?token=${recovery_token}&email=${encodeURIComponent(email)}`;

    // Send email using Resend
    const emailResponse = await resend.emails.send({
      from: "Axanar <axanartech@gmail.com>",
      to: [email],
      subject: "Reset Your Axanar Account Password",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Password Reset - Axanar</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #1f2937 0%, #111827 100%); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
              <h1 style="color: #14b8a6; margin: 0; font-size: 28px; font-weight: bold;">Axanar</h1>
              <p style="color: #e5e7eb; margin: 10px 0 0 0; font-size: 16px;">Donor Portal</p>
            </div>
            
            <div style="background: #f9fafb; padding: 30px; border-radius: 12px; border: 1px solid #e5e7eb;">
              <h2 style="color: #111827; margin-top: 0; font-size: 24px;">Password Reset Request</h2>
              
              <p style="margin: 20px 0; font-size: 16px; color: #374151;">
                We received a request to reset the password for your Axanar account. Click the button below to create a new password:
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="background: #14b8a6; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block;">
                  Reset Password
                </a>
              </div>
              
              <p style="margin: 20px 0; font-size: 14px; color: #6b7280;">
                This link will expire at ${new Date(expires_at).toLocaleString()}. If you didn't request this password reset, you can safely ignore this email.
              </p>
              
              <div style="border-top: 1px solid #e5e7eb; margin-top: 30px; padding-top: 20px;">
                <p style="margin: 0; font-size: 14px; color: #9ca3af; text-align: center;">
                  If the button doesn't work, copy and paste this link into your browser:
                </p>
                <p style="margin: 10px 0 0 0; font-size: 12px; color: #6b7280; word-break: break-all; text-align: center;">
                  ${resetUrl}
                </p>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 14px; color: #9ca3af;">
                © 2024 Axanar Productions. All rights reserved.
              </p>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Password reset email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true,
      message: "Password reset email sent successfully"
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in send-password-reset function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
