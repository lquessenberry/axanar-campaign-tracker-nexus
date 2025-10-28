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
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { shipId, gameId } = await req.json();

    // Fetch ship data
    const { data: ship, error: shipError } = await supabase
      .from("tactical_ships")
      .select("*")
      .eq("id", shipId)
      .single();

    if (shipError || !ship) {
      throw new Error("Ship not found");
    }

    // Fetch game state
    const { data: game, error: gameError } = await supabase
      .from("tactical_games")
      .select("*")
      .eq("id", gameId)
      .single();

    if (gameError || !game) {
      throw new Error("Game not found");
    }

    // Fetch all ships for targeting
    const { data: allShips } = await supabase
      .from("tactical_ships")
      .select("*")
      .eq("game_id", gameId)
      .eq("status", "active");

    // Fetch objectives
    const { data: objectives } = await supabase
      .from("tactical_objectives")
      .select("*")
      .eq("game_id", gameId)
      .eq("status", "active");

    // AI Decision Logic based on difficulty
    const difficulty = ship.ai_difficulty || "random";
    const actions = [];

    // Find enemy ships
    const enemyShips = allShips?.filter(s => s.team !== ship.team && s.status === 'active') || [];
    const nearestEnemy = enemyShips.length > 0 ? enemyShips[0] : null;

    // Find objectives to capture
    const contestedObjectives = objectives?.filter(
      obj => obj.controlled_by !== ship.team && obj.type === 'capture_point'
    ) || [];
    const targetObjective = contestedObjectives[0];

    switch (difficulty) {
      case "random":
        // Random movement
        const randomX = Math.max(0, Math.min(game.map_size_x - 1, ship.position_x + Math.floor(Math.random() * 3) - 1));
        const randomY = Math.max(0, Math.min(game.map_size_y - 1, ship.position_y + Math.floor(Math.random() * 3) - 1));
        actions.push({
          type: "move",
          target: { x: randomX, y: randomY }
        });
        break;

      case "easy":
        // Move toward nearest enemy, occasionally fire
        if (nearestEnemy) {
          const dx = nearestEnemy.position_x - ship.position_x;
          const dy = nearestEnemy.position_y - ship.position_y;
          const moveX = ship.position_x + Math.sign(dx);
          const moveY = ship.position_y + Math.sign(dy);
          
          actions.push({
            type: "move",
            target: { x: Math.max(0, Math.min(game.map_size_x - 1, moveX)), y: Math.max(0, Math.min(game.map_size_y - 1, moveY)) }
          });

          if (Math.random() > 0.5) {
            actions.push({
              type: "fire_phaser",
              target: { ship_id: nearestEnemy.id }
            });
          }
        }
        break;

      case "medium":
        // Balance between objectives and combat
        if (targetObjective && Math.random() > 0.3) {
          // Move toward objective
          const dx = targetObjective.position_x - ship.position_x;
          const dy = targetObjective.position_y - ship.position_y;
          const moveX = ship.position_x + Math.sign(dx);
          const moveY = ship.position_y + Math.sign(dy);
          
          actions.push({
            type: "move",
            target: { x: Math.max(0, Math.min(game.map_size_x - 1, moveX)), y: Math.max(0, Math.min(game.map_size_y - 1, moveY)) }
          });
        } else if (nearestEnemy) {
          // Engage enemy
          actions.push({
            type: "fire_phaser",
            target: { ship_id: nearestEnemy.id }
          });
          actions.push({
            type: "raise_shields"
          });
        }
        break;

      case "hard":
        // Strategic: prioritize objectives, smart combat
        if (ship.shields < ship.max_shields * 0.5) {
          actions.push({ type: "raise_shields" });
        }

        if (targetObjective) {
          const dist = Math.abs(targetObjective.position_x - ship.position_x) + 
                      Math.abs(targetObjective.position_y - ship.position_y);
          
          if (dist <= 2) {
            // Close to objective, hold and defend
            if (nearestEnemy) {
              actions.push({
                type: "fire_torpedo",
                target: { ship_id: nearestEnemy.id }
              });
            }
          } else {
            // Move toward objective
            const dx = targetObjective.position_x - ship.position_x;
            const dy = targetObjective.position_y - ship.position_y;
            const moveX = ship.position_x + Math.sign(dx);
            const moveY = ship.position_y + Math.sign(dy);
            
            actions.push({
              type: "move",
              target: { x: Math.max(0, Math.min(game.map_size_x - 1, moveX)), y: Math.max(0, Math.min(game.map_size_y - 1, moveY)) }
            });
          }
        } else if (nearestEnemy) {
          actions.push({
            type: "fire_phaser",
            target: { ship_id: nearestEnemy.id }
          });
        }
        break;
    }

    // Create the move
    if (actions.length > 0) {
      const { data: move, error: moveError } = await supabase
        .from("tactical_moves")
        .insert({
          game_id: gameId,
          ship_id: shipId,
          turn: game.current_turn,
          player_user_id: ship.captain_user_id, // Will be null for AI
          actions: actions,
          status: "pending"
        })
        .select()
        .single();

      if (moveError) throw moveError;

      return new Response(JSON.stringify({ success: true, move }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, message: "No actions generated" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error generating AI move:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});