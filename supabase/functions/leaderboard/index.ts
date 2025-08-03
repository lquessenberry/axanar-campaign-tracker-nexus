import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    let category = 'total_donated';
    let limit = 10;
    let userId = null;

    // Handle both GET (query params) and POST (body) requests
    if (req.method === 'GET') {
      const { searchParams } = new URL(req.url);
      category = searchParams.get('category') || 'total_donated';
      limit = parseInt(searchParams.get('limit') || '10');
      userId = searchParams.get('userId');
    } else {
      const body = await req.json();
      category = body.category || 'total_donated';
      limit = parseInt(body.limit || '10');
      userId = body.userId;
    }

    console.log(`Fetching leaderboard for category: ${category}, limit: ${limit}`);

    // Get leaderboard data
    const { data: leaderboardData, error: leaderboardError } = await supabaseClient
      .rpc('get_leaderboard', {
        category_type: category,
        limit_count: limit
      });

    if (leaderboardError) {
      console.error('Error fetching leaderboard:', leaderboardError);
      throw leaderboardError;
    }

    let userPosition = null;
    
    // Get user's position if userId provided
    if (userId) {
      const { data: positionData, error: positionError } = await supabaseClient
        .rpc('get_user_leaderboard_position', {
          user_uuid: userId,
          category_type: category
        });

      if (positionError) {
        console.error('Error fetching user position:', positionError);
      } else {
        userPosition = positionData?.[0] || null;
      }
    }

    const response = {
      leaderboard: leaderboardData || [],
      userPosition: userPosition,
      category: category,
      timestamp: new Date().toISOString()
    };

    console.log(`Successfully fetched ${leaderboardData?.length || 0} leaderboard entries`);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Leaderboard function error:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});