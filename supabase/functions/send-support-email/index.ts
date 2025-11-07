import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SupportEmailRequest {
  name: string;
  email: string;
  subject: string;
  category: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { name, email, subject, category, message }: SupportEmailRequest = await req.json();

    console.log('Support email request received:', { name, email, subject, category });

    // Validate that the email exists in the system
    const { data: emailCheck, error: emailCheckError } = await supabaseClient
      .rpc('check_email_in_system', { check_email: email });

    if (emailCheckError) {
      console.error('Error checking email:', emailCheckError);
      return new Response(
        JSON.stringify({ error: 'Error validating email address' }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const emailResult = emailCheck?.[0];
    if (!emailResult || (!emailResult.exists_in_auth && !emailResult.exists_in_donors)) {
      console.log('Email not found in system:', email);
      return new Response(
        JSON.stringify({ error: 'Email address not found in our system. Please use the email associated with your account.' }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log('Email validated successfully, sending support email');

    // Send email to support team (routes to Gmail but shows axanardonors.com to users)
    const emailResponse = await resend.emails.send({
      from: "Axanar Support <support@axanardonors.com>",
      to: ["axanartech@gmail.com"],
      replyTo: email,
      subject: `Support Request: ${subject}`,
      html: `
        <h2>New Support Request</h2>
        <p><strong>From:</strong> ${name} (${email})</p>
        <p><strong>Category:</strong> ${category}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <hr />
        <h3>Message:</h3>
        <p style="white-space: pre-wrap;">${message}</p>
        <hr />
        <p style="color: #666; font-size: 12px;">Reply to this email to respond directly to the user.</p>
      `,
    });

    console.log("Support email sent successfully:", emailResponse);

    // Send confirmation email to user
    const confirmationResponse = await resend.emails.send({
      from: "Axanar Support <support@axanardonors.com>",
      to: [email],
      subject: "We received your support request",
      html: `
        <h2>Thank you for contacting Axanar Support</h2>
        <p>Hi ${name},</p>
        <p>We have received your support request and will get back to you as soon as possible.</p>
        <h3>Your Request:</h3>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Category:</strong> ${category}</p>
        <p style="white-space: pre-wrap;">${message}</p>
        <hr />
        <p>Best regards,<br>The Axanar Support Team</p>
      `,
    });

    console.log("Confirmation email sent successfully:", confirmationResponse);

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Support request submitted successfully'
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-support-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message || 'An unexpected error occurred' }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
