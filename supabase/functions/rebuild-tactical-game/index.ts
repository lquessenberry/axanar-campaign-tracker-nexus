import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { gameId, userId } = await req.json();

    console.log('Rebuilding game:', gameId, 'for user:', userId);

    // Delete existing game data
    await supabaseAdmin.from("tactical_moves").delete().eq("game_id", gameId);
    await supabaseAdmin.from("tactical_events").delete().eq("game_id", gameId);
    await supabaseAdmin.from("tactical_objectives").delete().eq("game_id", gameId);
    await supabaseAdmin.from("tactical_ships").delete().eq("game_id", gameId);

    // Insert Federation ships
    const federationShips = [
      {
        game_id: gameId,
        name: "USS Enterprise",
        class: "Constitution-class",
        team: "federation",
        position_x: 6,
        position_y: 8,
        facing: 0,
        hull: 90,
        max_hull: 90,
        shields: 70,
        max_shields: 70,
        speed: 20,
        captain_user_id: userId,
        status: "active",
        stats: {
          weapons: {
            phasers: { damage: 12, range: 3, arcs: ["forward", "port", "starboard"] },
            torpedoes: { damage: 20, range: 5, arcs: ["forward"] }
          }
        }
      },
      {
        game_id: gameId,
        name: "USS Dauntless",
        class: "Ares-class",
        team: "federation",
        position_x: 5,
        position_y: 7,
        facing: 0,
        hull: 100,
        max_hull: 100,
        shields: 80,
        max_shields: 80,
        speed: 22,
        captain_user_id: userId,
        status: "active",
        stats: {
          weapons: {
            phasers: { damage: 15, range: 3, arcs: ["forward", "port", "starboard"] },
            torpedoes: { damage: 25, range: 5, arcs: ["forward"] }
          }
        }
      }
    ];

    // Insert Klingon AI ships
    const klingonShips = [
      {
        game_id: gameId,
        name: "IKS Vengeance",
        class: "D6-class",
        team: "klingon",
        position_x: 14,
        position_y: 8,
        facing: 3,
        hull: 80,
        max_hull: 80,
        shields: 50,
        max_shields: 50,
        speed: 20,
        captain_user_id: null,
        status: "active",
        ai_difficulty: "medium",
        ai_behavior: {},
        stats: {
          weapons: {
            disruptors: { damage: 15, range: 3, arcs: ["forward", "port", "starboard"] },
            torpedoes: { damage: 18, range: 4, arcs: ["forward"] }
          }
        }
      },
      {
        game_id: gameId,
        name: "IKS Predator",
        class: "D7-class",
        team: "klingon",
        position_x: 15,
        position_y: 7,
        facing: 3,
        hull: 95,
        max_hull: 95,
        shields: 60,
        max_shields: 60,
        speed: 18,
        captain_user_id: null,
        status: "active",
        ai_difficulty: "hard",
        ai_behavior: {},
        stats: {
          weapons: {
            disruptors: { damage: 18, range: 3, arcs: ["forward", "port", "starboard"] },
            torpedoes: { damage: 22, range: 4, arcs: ["forward"] }
          }
        }
      }
    ];

    const { error: shipsError } = await supabaseAdmin
      .from("tactical_ships")
      .insert([...federationShips, ...klingonShips]);

    if (shipsError) throw shipsError;

    // Insert objectives
    const objectives = [
      {
        game_id: gameId,
        name: "Alpha Station",
        type: "capture_point",
        position_x: 10,
        position_y: 5,
        points: 5,
        controlled_by: null,
        status: "active"
      },
      {
        game_id: gameId,
        name: "Beta Outpost",
        type: "capture_point",
        position_x: 10,
        position_y: 10,
        points: 5,
        controlled_by: null,
        status: "active"
      },
      {
        game_id: gameId,
        name: "Gamma Research",
        type: "capture_point",
        position_x: 15,
        position_y: 3,
        points: 3,
        controlled_by: null,
        status: "active"
      },
      {
        game_id: gameId,
        name: "Delta Mining",
        type: "capture_point",
        position_x: 5,
        position_y: 12,
        points: 3,
        controlled_by: null,
        status: "active"
      },
      {
        game_id: gameId,
        name: "Central Nexus",
        type: "capture_point",
        position_x: 10,
        position_y: 8,
        points: 10,
        controlled_by: null,
        status: "active"
      }
    ];

    const { error: objectivesError } = await supabaseAdmin
      .from("tactical_objectives")
      .insert(objectives);

    if (objectivesError) throw objectivesError;

    // Insert initial event
    const { error: eventError } = await supabaseAdmin
      .from("tactical_events")
      .insert({
        game_id: gameId,
        turn: 1,
        event_type: "game_start",
        description: "Battle begins! Federation vs Klingon Empire"
      });

    if (eventError) throw eventError;

    return new Response(
      JSON.stringify({ success: true, message: "Game rebuilt successfully" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error rebuilding game:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
