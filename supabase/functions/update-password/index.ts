import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface UpdatePasswordRequest {
  token: string;
  email: string;
  password: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token, email, password }: UpdatePasswordRequest = await req.json();
    
    console.log(`Processing password update for: ${email}`);

    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // First validate the recovery token
    const { data: tokenValidation, error: tokenError } = await supabase
      .rpc('check_recovery_token_validity', {
        token: token,
        user_email: email
      });

    console.log('Token validation result:', { tokenValidation, tokenError });

    if (tokenError) {
      console.error('Token validation RPC error:', tokenError);
      return new Response(JSON.stringify({ 
        error: `Token validation failed: ${tokenError.message}`
      }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (!tokenValidation || tokenValidation.length === 0 || !tokenValidation[0].is_valid) {
      console.error('Invalid recovery token - validation response:', tokenValidation);
      return new Response(JSON.stringify({ 
        error: tokenValidation?.[0]?.message || 'Invalid or expired recovery token'
      }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Get the auth user ID using the RPC function
    const { data: authUserId, error: userError } = await supabase
      .rpc('get_auth_user_id_by_email', { user_email: email });

    if (userError || !authUserId) {
      console.error('User not found in auth system:', userError);
      return new Response(JSON.stringify({ 
        error: 'User account not found'
      }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log('Found auth user:', authUserId);

    // Update the user's password using admin API
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      authUserId,
      { password: password }
    );

    if (updateError) {
      console.error('Failed to update password:', updateError);
      return new Response(JSON.stringify({ 
        error: 'Failed to update password'
      }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log('Password updated successfully for user:', email);

    return new Response(JSON.stringify({ 
      success: true,
      message: "Password updated successfully"
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in update-password function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);