-- Add tactical objectives table for capture points, waypoints, and zones
CREATE TABLE tactical_objectives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES tactical_games(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('capture_point', 'rally_point', 'waypoint', 'zone', 'artifact')),
  position_x INTEGER NOT NULL,
  position_y INTEGER NOT NULL,
  radius INTEGER DEFAULT 1,
  controlled_by TEXT CHECK (controlled_by IN ('federation', 'klingon', 'neutral')),
  points_per_turn INTEGER DEFAULT 1,
  victory_points INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'captured', 'destroyed', 'completed')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add index for game lookups
CREATE INDEX idx_tactical_objectives_game ON tactical_objectives(game_id);

-- Enable RLS
ALTER TABLE tactical_objectives ENABLE ROW LEVEL SECURITY;

-- Anyone can view objectives
CREATE POLICY "Anyone can view tactical objectives"
ON tactical_objectives FOR SELECT
USING (true);

-- GM can manage objectives in their games
CREATE POLICY "GMs can manage objectives in their games"
ON tactical_objectives FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM tactical_games
    WHERE tactical_games.id = tactical_objectives.game_id
    AND tactical_games.gm_user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM tactical_games
    WHERE tactical_games.id = tactical_objectives.game_id
    AND tactical_games.gm_user_id = auth.uid()
  )
);

-- Add AI difficulty column to tactical_ships
ALTER TABLE tactical_ships
ADD COLUMN ai_difficulty TEXT CHECK (ai_difficulty IN ('random', 'easy', 'medium', 'hard'));

-- Add AI behavior metadata
ALTER TABLE tactical_ships
ADD COLUMN ai_behavior JSONB DEFAULT '{}'::jsonb;