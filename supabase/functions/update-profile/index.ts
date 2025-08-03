import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface UpdateProfileRequest {
  full_name?: string;
  username?: string;
  bio?: string;
  avatar_url?: string;
}

export default async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Verify the user token
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    
    if (authError || !user) {
      console.error('Auth error:', authError)
      throw new Error('Unauthorized')
    }

    console.log('Authenticated user:', user.id, user.email)

    const updates: UpdateProfileRequest = await req.json()
    console.log('Profile updates requested:', updates)

    // First, try to find existing donor records for this user
    const { data: existingDonors, error: donorError } = await supabaseClient
      .from('donors')
      .select('id, email, full_name, bio, avatar_url')
      .eq('auth_user_id', user.id)

    if (donorError) {
      console.error('Error fetching donors:', donorError)
      throw new Error('Failed to fetch donor records')
    }

    console.log('Found donor records:', existingDonors?.length || 0)

    let updatedProfile = null

    if (existingDonors && existingDonors.length > 0) {
      // Update the primary donor record (first one)
      const primaryDonor = existingDonors[0]
      console.log('Updating primary donor record:', primaryDonor.id)
      
      const { data: updatedDonor, error: updateError } = await supabaseClient
        .from('donors')
        .update({
          full_name: updates.full_name || primaryDonor.full_name,
          bio: updates.bio !== undefined ? updates.bio : primaryDonor.bio,
          avatar_url: updates.avatar_url || primaryDonor.avatar_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', primaryDonor.id)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating donor:', updateError)
        throw new Error('Failed to update donor record')
      }

      console.log('Successfully updated donor record')
      updatedProfile = updatedDonor

      // If there are multiple donor records, sync them all
      if (existingDonors.length > 1) {
        console.log('Syncing additional donor records...')
        for (let i = 1; i < existingDonors.length; i++) {
          const donorId = existingDonors[i].id
          await supabaseClient
            .from('donors')
            .update({
              full_name: updates.full_name || primaryDonor.full_name,
              bio: updates.bio !== undefined ? updates.bio : primaryDonor.bio,
              avatar_url: updates.avatar_url || primaryDonor.avatar_url,
              updated_at: new Date().toISOString()
            })
            .eq('id', donorId)
        }
        console.log('Synced additional donor records')
      }
    } else {
      // No donor record found, create/update profiles table
      console.log('No donor record found, updating profiles table')
      
      const { data: profileData, error: profileError } = await supabaseClient
        .from('profiles')
        .upsert({
          id: user.id,
          username: updates.username,
          full_name: updates.full_name,
          bio: updates.bio,
          avatar_url: updates.avatar_url,
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (profileError) {
        console.error('Error updating profile:', profileError)
        throw new Error('Failed to update profile')
      }

      console.log('Successfully updated profile record')
      updatedProfile = profileData
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Profile updated successfully',
        profile: updatedProfile
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in update-profile function:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
}