import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// Initialize Supabase client for authentication verification
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? ''
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SendEmailRequest {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
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
    let user = null;
    let isAuthenticated = false;
    
    // Check for authentication (optional for contact forms)
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token);
      
      if (!authError && authUser) {
        user = authUser;
        isAuthenticated = true;
        
        // For authenticated users, check if they're admin for advanced features
        const { data: adminCheck } = await supabase
          .from('admin_users')
          .select('user_id')
          .eq('user_id', user.id)
          .maybeSingle();
          
        if (adminCheck) {
          console.log("Admin user sending email");
        }
      }
    }

    const emailData: SendEmailRequest = await req.json();

    // Validate required fields
    if (!emailData.to || !emailData.subject) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: to, subject" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    if (!emailData.html && !emailData.text) {
      return new Response(
        JSON.stringify({ error: "Either html or text content is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Input validation and sanitization
    if (typeof emailData.subject !== 'string' || emailData.subject.length > 998) {
      return new Response(
        JSON.stringify({ error: "Invalid subject line" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Validate email addresses
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emails = Array.isArray(emailData.to) ? emailData.to : [emailData.to];
    
    for (const email of emails) {
      if (!emailRegex.test(email)) {
        return new Response(
          JSON.stringify({ error: `Invalid email address: ${email}` }),
          {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }
    }

    // Rate limiting based on IP for unauthenticated users, user ID for authenticated
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    let rateLimitKey = 'anonymous';
    let rateLimitValue = 10; // Lower limit for anonymous users
    
    if (user) {
      rateLimitKey = `email_sent by ${user.id}`;
      rateLimitValue = 50; // Higher limit for authenticated users
    } else {
      // For anonymous users, we can't easily rate limit by IP in this context
      // So we'll use a global rate limit
      rateLimitKey = 'anonymous_email_sends';
      rateLimitValue = 100; // Global limit for all anonymous sends
    }

    const { count: recentEmails } = await supabase
      .from('audit_trail')
      .select('*', { count: 'exact' })
      .eq('action', rateLimitKey)
      .gte('created_at', oneHourAgo);

    if (recentEmails && recentEmails >= rateLimitValue) {
      return new Response(
        JSON.stringify({ error: `Rate limit exceeded. Maximum ${rateLimitValue} emails per hour.` }),
        {
          status: 429,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Send email via Resend
    const emailResponse = await resend.emails.send({
      from: emailData.from || "Axanar Support <support@axanardonors.com>",
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text,
      replyTo: emailData.replyTo,
      cc: emailData.cc,
      bcc: emailData.bcc,
    });

    console.log("Email sent successfully:", emailResponse);

    // Log the email send action for audit purposes
    try {
      const auditAction = user ? `email_sent by ${user.id}` : 'anonymous_email_sends';
      await supabase
        .from('audit_trail')
        .insert({
          action: auditAction,
          details: JSON.stringify({
            to: emailData.to,
            subject: emailData.subject,
            email_id: emailResponse.data?.id,
            authenticated: isAuthenticated,
            timestamp: new Date().toISOString()
          })
        });
    } catch (auditError) {
      console.error("Failed to log audit trail:", auditError);
      // Don't fail the request if audit logging fails
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        id: emailResponse.data?.id,
        message: "Email sent successfully" 
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
    console.error("Error in send-email function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || "Failed to send email",
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