-- Allow player_user_id to be null for AI-generated moves
ALTER TABLE tactical_moves 
ALTER COLUMN player_user_id DROP NOT NULL;