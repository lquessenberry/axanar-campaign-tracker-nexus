-- Create tactical RPG tables

-- Tactical games table
CREATE TABLE IF NOT EXISTS public.tactical_games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  forum_thread_id UUID REFERENCES public.forum_threads(id) ON DELETE CASCADE,
  gm_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  current_turn INTEGER NOT NULL DEFAULT 1,
  phase TEXT NOT NULL DEFAULT 'patrol' CHECK (phase IN ('patrol', 'combat', 'completed')),
  is_locked BOOLEAN NOT NULL DEFAULT false,
  map_size_x INTEGER NOT NULL DEFAULT 20,
  map_size_y INTEGER NOT NULL DEFAULT 15,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tactical ships table
CREATE TABLE IF NOT EXISTS public.tactical_ships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES public.tactical_games(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  class TEXT NOT NULL,
  captain_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  team TEXT NOT NULL CHECK (team IN ('federation', 'klingon', 'neutral')),
  hull INTEGER NOT NULL,
  max_hull INTEGER NOT NULL,
  shields INTEGER NOT NULL DEFAULT 0,
  max_shields INTEGER NOT NULL,
  position_x INTEGER NOT NULL,
  position_y INTEGER NOT NULL,
  facing INTEGER NOT NULL DEFAULT 0 CHECK (facing >= 0 AND facing <= 5),
  speed INTEGER NOT NULL DEFAULT 0,
  sprite_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'destroyed', 'disabled')),
  stats JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tactical moves table (player submissions)
CREATE TABLE IF NOT EXISTS public.tactical_moves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES public.tactical_games(id) ON DELETE CASCADE,
  ship_id UUID NOT NULL REFERENCES public.tactical_ships(id) ON DELETE CASCADE,
  turn INTEGER NOT NULL,
  player_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  actions JSONB NOT NULL DEFAULT '[]'::jsonb,
  dice_roll_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'cancelled')),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

-- Tactical events table (for animations and combat log)
CREATE TABLE IF NOT EXISTS public.tactical_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES public.tactical_games(id) ON DELETE CASCADE,
  turn INTEGER NOT NULL,
  event_type TEXT NOT NULL,
  source_ship_id UUID REFERENCES public.tactical_ships(id) ON DELETE SET NULL,
  target_ship_id UUID REFERENCES public.tactical_ships(id) ON DELETE SET NULL,
  position JSONB,
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add tactical_game_id to forum_threads
ALTER TABLE public.forum_threads 
ADD COLUMN IF NOT EXISTS tactical_game_id UUID REFERENCES public.tactical_games(id) ON DELETE SET NULL;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tactical_ships_game_id ON public.tactical_ships(game_id);
CREATE INDEX IF NOT EXISTS idx_tactical_moves_game_id ON public.tactical_moves(game_id);
CREATE INDEX IF NOT EXISTS idx_tactical_moves_status ON public.tactical_moves(status);
CREATE INDEX IF NOT EXISTS idx_tactical_events_game_id ON public.tactical_events(game_id);
CREATE INDEX IF NOT EXISTS idx_forum_threads_tactical_game ON public.forum_threads(tactical_game_id);

-- Enable RLS
ALTER TABLE public.tactical_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tactical_ships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tactical_moves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tactical_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies: All authenticated users can view (spectator mode)
CREATE POLICY "Anyone can view tactical games"
  ON public.tactical_games FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can view tactical ships"
  ON public.tactical_ships FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can view tactical moves"
  ON public.tactical_moves FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can view tactical events"
  ON public.tactical_events FOR SELECT
  TO authenticated
  USING (true);

-- GMs can manage games
CREATE POLICY "GM can manage their games"
  ON public.tactical_games FOR ALL
  TO authenticated
  USING (gm_user_id = auth.uid())
  WITH CHECK (gm_user_id = auth.uid());

-- GMs can manage ships
CREATE POLICY "GM can manage ships"
  ON public.tactical_ships FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.tactical_games 
    WHERE id = tactical_ships.game_id 
    AND gm_user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.tactical_games 
    WHERE id = tactical_ships.game_id 
    AND gm_user_id = auth.uid()
  ));

-- Players can submit their own moves
CREATE POLICY "Players can submit moves"
  ON public.tactical_moves FOR INSERT
  TO authenticated
  WITH CHECK (player_user_id = auth.uid());

-- Players can view their own moves
CREATE POLICY "Players can update their pending moves"
  ON public.tactical_moves FOR UPDATE
  TO authenticated
  USING (player_user_id = auth.uid() AND status = 'pending')
  WITH CHECK (player_user_id = auth.uid() AND status = 'pending');

-- GMs can update moves to resolved
CREATE POLICY "GM can resolve moves"
  ON public.tactical_moves FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.tactical_games 
    WHERE id = tactical_moves.game_id 
    AND gm_user_id = auth.uid()
  ));

-- GMs can create events
CREATE POLICY "GM can create events"
  ON public.tactical_events FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.tactical_games 
    WHERE id = tactical_events.game_id 
    AND gm_user_id = auth.uid()
  ));

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.tactical_games;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tactical_ships;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tactical_moves;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tactical_events;

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_tactical_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tactical_games_timestamp
  BEFORE UPDATE ON public.tactical_games
  FOR EACH ROW
  EXECUTE FUNCTION update_tactical_timestamp();

CREATE TRIGGER update_tactical_ships_timestamp
  BEFORE UPDATE ON public.tactical_ships
  FOR EACH ROW
  EXECUTE FUNCTION update_tactical_timestamp();