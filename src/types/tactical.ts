export interface TacticalGame {
  id: string;
  forum_thread_id?: string;
  gm_user_id: string;
  current_turn: number;
  phase: 'patrol' | 'combat' | 'completed';
  is_locked: boolean;
  map_size_x: number;
  map_size_y: number;
  created_at: string;
  updated_at: string;
}

export interface TacticalShip {
  id: string;
  game_id: string;
  name: string;
  class: string;
  captain_user_id?: string;
  team: 'federation' | 'klingon' | 'neutral';
  hull: number;
  max_hull: number;
  shields: number;
  max_shields: number;
  position_x: number;
  position_y: number;
  facing: number; // 0-5 for hex directions
  speed: number;
  sprite_url?: string;
  status: 'active' | 'destroyed' | 'disabled';
  stats: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface TacticalMove {
  id: string;
  game_id: string;
  ship_id: string;
  turn: number;
  player_user_id: string;
  actions: TacticalAction[];
  dice_roll_url?: string;
  status: 'pending' | 'resolved' | 'cancelled';
  submitted_at: string;
  resolved_at?: string;
}

export interface TacticalAction {
  type: 'move' | 'fire_phaser' | 'fire_torpedo' | 'raise_shields' | 'scan' | 'evasive';
  target?: { x: number; y: number } | { ship_id: string };
  data?: Record<string, any>;
}

export interface TacticalEvent {
  id: string;
  game_id: string;
  turn: number;
  event_type: 'move' | 'phaser_fire' | 'torpedo' | 'explosion' | 'shield_hit' | 'damage';
  source_ship_id?: string;
  target_ship_id?: string;
  position?: { x: number; y: number };
  data: Record<string, any>;
  created_at: string;
}

export interface HexCoord {
  x: number;
  y: number;
}
