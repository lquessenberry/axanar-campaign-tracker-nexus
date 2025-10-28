import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

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
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      console.error('Authentication error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Creating demo tactical game for user:', user.id);

    // Create tactical game
    const { data: game, error: gameError } = await supabaseClient
      .from('tactical_games')
      .insert({
        gm_user_id: user.id,
        current_turn: 1,
        phase: 'combat',
        is_locked: false,
        map_size_x: 20,
        map_size_y: 15,
      })
      .select()
      .single();

    if (gameError) {
      console.error('Error creating game:', gameError);
      throw gameError;
    }

    console.log('Game created:', game.id);

    // Create Federation ships
    const federationShips = [
      {
        game_id: game.id,
        name: 'USS Dauntless',
        class: 'Ares-class',
        captain_user_id: user.id,
        team: 'federation',
        hull: 100,
        max_hull: 100,
        shields: 80,
        max_shields: 80,
        position_x: 5,
        position_y: 7,
        facing: 0,
        speed: 22,
        status: 'active',
        stats: {
          weapons: {
            phasers: { damage: 15, range: 3, arcs: ['forward', 'port', 'starboard'] },
            torpedoes: { damage: 25, range: 5, arcs: ['forward'] }
          }
        }
      },
      {
        game_id: game.id,
        name: 'USS Enterprise',
        class: 'Constitution-class',
        captain_user_id: user.id,
        team: 'federation',
        hull: 90,
        max_hull: 90,
        shields: 70,
        max_shields: 70,
        position_x: 6,
        position_y: 8,
        facing: 0,
        speed: 20,
        status: 'active',
        stats: {
          weapons: {
            phasers: { damage: 12, range: 3, arcs: ['forward', 'port', 'starboard'] },
            torpedoes: { damage: 20, range: 5, arcs: ['forward'] }
          }
        }
      }
    ];

    // Create Klingon ships with AI
    const klingonShips = [
      {
        game_id: game.id,
        name: 'IKS Predator',
        class: 'D7-class',
        team: 'klingon',
        hull: 95,
        max_hull: 95,
        shields: 60,
        max_shields: 60,
        position_x: 15,
        position_y: 7,
        facing: 3,
        speed: 18,
        status: 'active',
        ai_difficulty: 'hard',
        stats: {
          weapons: {
            disruptors: { damage: 18, range: 3, arcs: ['forward', 'port', 'starboard'] },
            torpedoes: { damage: 22, range: 4, arcs: ['forward'] }
          }
        }
      },
      {
        game_id: game.id,
        name: 'IKS Vengeance',
        class: 'D6-class',
        team: 'klingon',
        hull: 80,
        max_hull: 80,
        shields: 50,
        max_shields: 50,
        position_x: 14,
        position_y: 8,
        facing: 3,
        speed: 20,
        status: 'active',
        ai_difficulty: 'medium',
        stats: {
          weapons: {
            disruptors: { damage: 15, range: 3, arcs: ['forward', 'port', 'starboard'] },
            torpedoes: { damage: 18, range: 4, arcs: ['forward'] }
          }
        }
      }
    ];

    // Insert all ships
    const { data: ships, error: shipsError } = await supabaseClient
      .from('tactical_ships')
      .insert([...federationShips, ...klingonShips])
      .select();

    if (shipsError) {
      console.error('Error creating ships:', shipsError);
      throw shipsError;
    }

    console.log('Ships created:', ships.length);

    // Create tactical objectives
    const objectives = [
      {
        game_id: game.id,
        name: 'Epsilon Station',
        type: 'capture_point',
        position_x: 10,
        position_y: 7,
        radius: 2,
        controlled_by: 'neutral',
        points_per_turn: 5,
        victory_points: 0,
        status: 'active',
        metadata: { description: 'Strategic refueling station' }
      },
      {
        game_id: game.id,
        name: 'Rally Alpha',
        type: 'rally_point',
        position_x: 4,
        position_y: 12,
        radius: 1,
        points_per_turn: 0,
        victory_points: 10,
        status: 'active',
        metadata: { description: 'Federation rally point' }
      },
      {
        game_id: game.id,
        name: 'Ancient Artifact',
        type: 'artifact',
        position_x: 10,
        position_y: 2,
        radius: 1,
        controlled_by: 'neutral',
        points_per_turn: 0,
        victory_points: 50,
        status: 'active',
        metadata: { description: 'Recover for mission victory' }
      }
    ];

    const { error: objectivesError } = await supabaseClient
      .from('tactical_objectives')
      .insert(objectives);

    if (objectivesError) {
      console.error('Error creating objectives:', objectivesError);
    }

    // Create initial combat log event
    const { error: eventError } = await supabaseClient
      .from('tactical_events')
      .insert({
        game_id: game.id,
        turn: 1,
        event_type: 'game_start',
        data: {
          message: 'Federation vs Klingon forces engage in combat!',
          federation_ships: federationShips.length,
          klingon_ships: klingonShips.length
        }
      });

    if (eventError) {
      console.error('Error creating event:', eventError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        game_id: game.id,
        message: 'Demo tactical game created successfully',
        ships_count: ships.length,
        url: `/tactical/${game.id}`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in create-demo-tactical-game:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
