import type { Database } from './types';

export type ForumBadgeRow = {
  id: string;
  slug: string;
  label: string;
  description: string | null;
  icon: string | null;
  created_at: string;
  updated_at: string;
};

export type ForumBadgeInsert = {
  id?: string;
  slug: string;
  label: string;
  description?: string | null;
  icon?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type ForumBadgeUpdate = Partial<ForumBadgeInsert>;

export type ForumUserBadgeRow = {
  user_id: string;
  badge_id: string;
  awarded_at: string;
  source: string | null;
  ref_table: string | null;
  ref_id: string | null;
};

export type ForumUserBadgeInsert = {
  user_id: string;
  badge_id: string;
  awarded_at?: string;
  source?: string | null;
  ref_table?: string | null;
  ref_id?: string | null;
};

export type ForumUserBadgeUpdate = Partial<ForumUserBadgeInsert>;

export type ForumRankRow = {
  id: string;
  slug: string;
  name: string;
  min_points: number;
  sort_order: number;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export type ForumRankInsert = {
  id?: string;
  slug: string;
  name: string;
  min_points?: number;
  sort_order: number;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type ForumRankUpdate = Partial<ForumRankInsert>;

export type ForumUserRankRow = {
  user_id: string;
  rank_id: string;
  set_by: string | null;
  updated_at: string;
};

export type ForumUserRankInsert = {
  user_id: string;
  rank_id: string;
  set_by?: string | null;
  updated_at?: string;
};

export type ForumUserRankUpdate = Partial<ForumUserRankInsert>;

export type DatabaseWithForum = Omit<Database, 'public'> & {
  public: {
    Tables: Database['public']['Tables'] & {
      forum_threads: {
        Row: {
          id: string;
          title: string;
          content: string;
          category: string;
          is_pinned: boolean;
          is_official: boolean;
          author_user_id: string | null;
          author_email: string | null;
          author_username: string;
          author_signature: string | null;
          author_rank_name: string | null;
          author_rank_min_points: number | null;
          author_badges: unknown | null; // jsonb
          author_joined_date: string | null; // date string
          author_post_count: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          category?: string;
          is_pinned?: boolean;
          is_official?: boolean;
          author_user_id?: string | null;
          author_email?: string | null;
          author_username: string;
          author_signature?: string | null;
          author_rank_name?: string | null;
          author_rank_min_points?: number | null;
          author_badges?: unknown | null;
          author_joined_date?: string | null;
          author_post_count?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<{
          id: string;
          title: string;
          content: string;
          category: string;
          is_pinned: boolean;
          is_official: boolean;
          author_user_id: string | null;
          author_email: string | null;
          author_username: string;
          author_signature: string | null;
          author_rank_name: string | null;
          author_rank_min_points: number | null;
          author_badges: unknown | null;
          author_joined_date: string | null;
          author_post_count: number | null;
          created_at: string;
          updated_at: string;
        }>;
        Relationships: [
          {
            foreignKeyName: 'forum_threads_author_user_id_fkey';
            columns: ['author_user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      forum_badges: {
        Row: ForumBadgeRow;
        Insert: ForumBadgeInsert;
        Update: ForumBadgeUpdate;
        Relationships: [];
      };
      forum_user_badges: {
        Row: ForumUserBadgeRow;
        Insert: ForumUserBadgeInsert;
        Update: ForumUserBadgeUpdate;
        Relationships: [
          {
            foreignKeyName: 'forum_user_badges_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'forum_user_badges_badge_id_fkey';
            columns: ['badge_id'];
            isOneToOne: false;
            referencedRelation: 'forum_badges';
            referencedColumns: ['id'];
          }
        ];
      };
      forum_ranks: {
        Row: ForumRankRow;
        Insert: ForumRankInsert;
        Update: ForumRankUpdate;
        Relationships: [];
      };
      forum_user_ranks: {
        Row: ForumUserRankRow;
        Insert: ForumUserRankInsert;
        Update: ForumUserRankUpdate;
        Relationships: [
          {
            foreignKeyName: 'forum_user_ranks_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: true;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'forum_user_ranks_rank_id_fkey';
            columns: ['rank_id'];
            isOneToOne: false;
            referencedRelation: 'forum_ranks';
            referencedColumns: ['id'];
          }
        ];
      };
    };
    Views: Database['public']['Views'];
    Functions: Database['public']['Functions'];
    Enums: Database['public']['Enums'];
    CompositeTypes: Database['public']['CompositeTypes'];
  };
};
