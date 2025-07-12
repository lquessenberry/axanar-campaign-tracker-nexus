import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface RecoveryEmailRequest {
  email: string;
  recoveryToken: string;
  firstName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }

  try {
    const { email, recoveryToken, firstName }: RecoveryEmailRequest = await req.json();

    if (!email || !recoveryToken) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: email, recoveryToken" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Create recovery URL - using lovable.dev URL for testing, update to donors.axanar.com for production
    const recoveryUrl = `https://your-project.lovable.dev/auth?token=${recoveryToken}&email=${encodeURIComponent(email)}&type=recovery`;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Account Recovery - Axanar</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #1e40af, #06b6d4); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Account Recovery</h1>
            <p style="color: #e0f2fe; margin: 10px 0 0 0;">Axanar Donor Platform</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #1e40af; margin-top: 0;">Hello${firstName ? ` ${firstName}` : ''}!</h2>
            
            <p>We received a request to recover your account access. If you made this request, please click the button below to continue with your account recovery:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${recoveryUrl}" 
                 style="background: linear-gradient(135deg, #1e40af, #06b6d4); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        font-weight: bold; 
                        display: inline-block;
                        transition: transform 0.2s;">
                Recover My Account
              </a>
            </div>
            
            <p><strong>Important:</strong> This recovery link will expire in 1 hour for security reasons.</p>
            
            <p>If you didn't request this recovery, you can safely ignore this email. Your account remains secure.</p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="color: #666; font-size: 14px;">
              If the button above doesn't work, copy and paste this link into your browser:<br>
              <a href="${recoveryUrl}" style="color: #1e40af; word-break: break-all;">${recoveryUrl}</a>
            </p>
            
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              Best regards,<br>
              The Axanar Team<br>
              <em>"Written in starlight, bound by hope"</em>
            </p>
          </div>
        </body>
      </html>
    `;

    const textContent = `
Account Recovery - Axanar

Hello${firstName ? ` ${firstName}` : ''}!

We received a request to recover your account access. If you made this request, please use the following link to continue with your account recovery:

${recoveryUrl}

Important: This recovery link will expire in 1 hour for security reasons.

If you didn't request this recovery, you can safely ignore this email. Your account remains secure.

Best regards,
The Axanar Team
"Written in starlight, bound by hope"
    `;

    const emailResponse = await resend.emails.send({
      from: "Axanar <noreply@donors.axanar.com>",
      to: email,
      subject: "Account Recovery - Axanar Donor Platform",
      html: emailHtml,
      text: textContent,
    });

    console.log("Recovery email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        id: emailResponse.data?.id,
        message: "Recovery email sent successfully" 
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );

  } catch (error: any) {
    console.error("Error in send-recovery-email function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || "Failed to send recovery email",
        success: false 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);