export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      account_recovery_attempts: {
        Row: {
          attempt_type: string
          created_at: string
          email: string
          expires_at: string
          id: string
          ip_address: string | null
          recovery_token: string
          used_at: string | null
          user_agent: string | null
        }
        Insert: {
          attempt_type: string
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          ip_address?: string | null
          recovery_token?: string
          used_at?: string | null
          user_agent?: string | null
        }
        Update: {
          attempt_type?: string
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          ip_address?: string | null
          recovery_token?: string
          used_at?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      addresses: {
        Row: {
          address1: string | null
          address2: string | null
          city: string | null
          country: string | null
          created_at: string | null
          donor_id: string | null
          id: string
          is_primary: boolean | null
          legacy_id: number | null
          phone: string | null
          postal_code: string | null
          state: string | null
          updated_at: string | null
        }
        Insert: {
          address1?: string | null
          address2?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          donor_id?: string | null
          id?: string
          is_primary?: boolean | null
          legacy_id?: number | null
          phone?: string | null
          postal_code?: string | null
          state?: string | null
          updated_at?: string | null
        }
        Update: {
          address1?: string | null
          address2?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          donor_id?: string | null
          id?: string
          is_primary?: boolean | null
          legacy_id?: number | null
          phone?: string | null
          postal_code?: string | null
          state?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "addresses_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "contributor_leaderboard"
            referencedColumns: ["donor_id"]
          },
          {
            foreignKeyName: "addresses_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "donor_pledge_totals"
            referencedColumns: ["donor_id"]
          },
          {
            foreignKeyName: "addresses_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "donors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "addresses_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "my_donor_profile"
            referencedColumns: ["donor_id"]
          },
          {
            foreignKeyName: "addresses_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "reserve_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "addresses_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "vw_donor_details"
            referencedColumns: ["donor_id"]
          },
          {
            foreignKeyName: "addresses_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "vw_donors_with_addresses"
            referencedColumns: ["donor_id"]
          },
        ]
      }
      admin_action_audit: {
        Row: {
          action_type: string
          admin_user_id: string
          created_at: string | null
          error_message: string | null
          id: string
          ip_address: unknown
          new_values: Json | null
          old_values: Json | null
          success: boolean | null
          target_id: string | null
          target_table: string | null
          user_agent: string | null
        }
        Insert: {
          action_type: string
          admin_user_id: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          success?: boolean | null
          target_id?: string | null
          target_table?: string | null
          user_agent?: string | null
        }
        Update: {
          action_type?: string
          admin_user_id?: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          success?: boolean | null
          target_id?: string | null
          target_table?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          created_at: string | null
          is_content_manager: boolean
          is_super_admin: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          is_content_manager?: boolean
          is_super_admin?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          is_content_manager?: boolean
          is_super_admin?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      alerts: {
        Row: {
          active: boolean | null
          created_at: string | null
          id: string
          legacy_id: number | null
          message: string
          title: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          legacy_id?: number | null
          message: string
          title: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          legacy_id?: number | null
          message?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      alerts_seen: {
        Row: {
          alert_id: string | null
          donor_id: string | null
          id: string
          seen_at: string | null
        }
        Insert: {
          alert_id?: string | null
          donor_id?: string | null
          id?: string
          seen_at?: string | null
        }
        Update: {
          alert_id?: string | null
          donor_id?: string | null
          id?: string
          seen_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alerts_seen_alert_id_fkey"
            columns: ["alert_id"]
            isOneToOne: false
            referencedRelation: "alerts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_seen_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "contributor_leaderboard"
            referencedColumns: ["donor_id"]
          },
          {
            foreignKeyName: "alerts_seen_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "donor_pledge_totals"
            referencedColumns: ["donor_id"]
          },
          {
            foreignKeyName: "alerts_seen_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "donors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_seen_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "my_donor_profile"
            referencedColumns: ["donor_id"]
          },
          {
            foreignKeyName: "alerts_seen_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "reserve_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_seen_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "vw_donor_details"
            referencedColumns: ["donor_id"]
          },
          {
            foreignKeyName: "alerts_seen_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "vw_donors_with_addresses"
            referencedColumns: ["donor_id"]
          },
        ]
      }
      ambassadorial_titles: {
        Row: {
          badge_style: string | null
          campaign_id: string | null
          color: string | null
          created_at: string | null
          description: string | null
          display_name: string
          forum_xp_bonus: number | null
          icon: string | null
          id: string
          minimum_pledge_amount: number
          original_rank_name: string | null
          participation_xp_bonus: number | null
          slug: string
          special_permissions: Json | null
          updated_at: string | null
          xp_multiplier: number | null
        }
        Insert: {
          badge_style?: string | null
          campaign_id?: string | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          display_name: string
          forum_xp_bonus?: number | null
          icon?: string | null
          id?: string
          minimum_pledge_amount: number
          original_rank_name?: string | null
          participation_xp_bonus?: number | null
          slug: string
          special_permissions?: Json | null
          updated_at?: string | null
          xp_multiplier?: number | null
        }
        Update: {
          badge_style?: string | null
          campaign_id?: string | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          display_name?: string
          forum_xp_bonus?: number | null
          icon?: string | null
          id?: string
          minimum_pledge_amount?: number
          original_rank_name?: string | null
          participation_xp_bonus?: number | null
          slug?: string
          special_permissions?: Json | null
          updated_at?: string | null
          xp_multiplier?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ambassadorial_titles_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaign_analytics"
            referencedColumns: ["campaign_id"]
          },
          {
            foreignKeyName: "ambassadorial_titles_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaign_totals"
            referencedColumns: ["campaign_id"]
          },
          {
            foreignKeyName: "ambassadorial_titles_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_trail: {
        Row: {
          action: string
          created_at: string | null
          details: string | null
          donor_id: string | null
          id: string
          ip_address: string | null
          legacy_id: number | null
          user_agent: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: string | null
          donor_id?: string | null
          id?: string
          ip_address?: string | null
          legacy_id?: number | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: string | null
          donor_id?: string | null
          id?: string
          ip_address?: string | null
          legacy_id?: number | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_trail_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "contributor_leaderboard"
            referencedColumns: ["donor_id"]
          },
          {
            foreignKeyName: "audit_trail_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "donor_pledge_totals"
            referencedColumns: ["donor_id"]
          },
          {
            foreignKeyName: "audit_trail_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "donors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_trail_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "my_donor_profile"
            referencedColumns: ["donor_id"]
          },
          {
            foreignKeyName: "audit_trail_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "reserve_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_trail_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "vw_donor_details"
            referencedColumns: ["donor_id"]
          },
          {
            foreignKeyName: "audit_trail_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "vw_donors_with_addresses"
            referencedColumns: ["donor_id"]
          },
        ]
      }
      auth_migration_log: {
        Row: {
          action: string | null
          auth_id: string | null
          batch_id: number
          created_at: string | null
          donor_id: string | null
          email: string | null
          error_message: string | null
          id: number
          status: string | null
        }
        Insert: {
          action?: string | null
          auth_id?: string | null
          batch_id: number
          created_at?: string | null
          donor_id?: string | null
          email?: string | null
          error_message?: string | null
          id?: number
          status?: string | null
        }
        Update: {
          action?: string | null
          auth_id?: string | null
          batch_id?: number
          created_at?: string | null
          donor_id?: string | null
          email?: string | null
          error_message?: string | null
          id?: number
          status?: string | null
        }
        Relationships: []
      }
      axanar_credits_reserve: {
        Row: {
          created_at: string | null
          daily_budget: number
          emergency_mode: boolean | null
          id: string
          notes: string | null
          reserve_date: string
          total_allocated: number | null
          total_remaining: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          daily_budget?: number
          emergency_mode?: boolean | null
          id?: string
          notes?: string | null
          reserve_date: string
          total_allocated?: number | null
          total_remaining?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          daily_budget?: number
          emergency_mode?: boolean | null
          id?: string
          notes?: string | null
          reserve_date?: string
          total_allocated?: number | null
          total_remaining?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      axanar_credits_transactions: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          metadata: Json | null
          reference_id: string | null
          reference_table: string | null
          source: string
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          metadata?: Json | null
          reference_id?: string | null
          reference_table?: string | null
          source: string
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          metadata?: Json | null
          reference_id?: string | null
          reference_table?: string | null
          source?: string
          transaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "axanar_credits_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_display_overrides: {
        Row: {
          campaign_id: string
          created_at: string | null
          display_amount: number
          display_backers: number
          display_goal: number | null
          source_note: string | null
          updated_at: string | null
        }
        Insert: {
          campaign_id: string
          created_at?: string | null
          display_amount: number
          display_backers: number
          display_goal?: number | null
          source_note?: string | null
          updated_at?: string | null
        }
        Update: {
          campaign_id?: string
          created_at?: string | null
          display_amount?: number
          display_backers?: number
          display_goal?: number | null
          source_note?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_display_overrides_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: true
            referencedRelation: "campaign_analytics"
            referencedColumns: ["campaign_id"]
          },
          {
            foreignKeyName: "campaign_display_overrides_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: true
            referencedRelation: "campaign_totals"
            referencedColumns: ["campaign_id"]
          },
          {
            foreignKeyName: "campaign_display_overrides_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: true
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          active: boolean | null
          created_at: string | null
          end_date: string | null
          goal_amount: number | null
          id: string
          image_url: string | null
          legacy_id: number | null
          name: string
          provider: string | null
          start_date: string | null
          status: string | null
          updated_at: string | null
          web_url: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          end_date?: string | null
          goal_amount?: number | null
          id?: string
          image_url?: string | null
          legacy_id?: number | null
          name: string
          provider?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
          web_url?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          end_date?: string | null
          goal_amount?: number | null
          id?: string
          image_url?: string | null
          legacy_id?: number | null
          name?: string
          provider?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
          web_url?: string | null
        }
        Relationships: []
      }
      donor_campaign_packages: {
        Row: {
          campaign_id: string | null
          created_at: string | null
          donor_id: string | null
          id: string
          legacy_id: number | null
          package_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string | null
          donor_id?: string | null
          id?: string
          legacy_id?: number | null
          package_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          campaign_id?: string | null
          created_at?: string | null
          donor_id?: string | null
          id?: string
          legacy_id?: number | null
          package_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "donor_campaign_packages_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaign_analytics"
            referencedColumns: ["campaign_id"]
          },
          {
            foreignKeyName: "donor_campaign_packages_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaign_totals"
            referencedColumns: ["campaign_id"]
          },
          {
            foreignKeyName: "donor_campaign_packages_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donor_campaign_packages_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "contributor_leaderboard"
            referencedColumns: ["donor_id"]
          },
          {
            foreignKeyName: "donor_campaign_packages_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "donor_pledge_totals"
            referencedColumns: ["donor_id"]
          },
          {
            foreignKeyName: "donor_campaign_packages_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "donors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donor_campaign_packages_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "my_donor_profile"
            referencedColumns: ["donor_id"]
          },
          {
            foreignKeyName: "donor_campaign_packages_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "reserve_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donor_campaign_packages_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "vw_donor_details"
            referencedColumns: ["donor_id"]
          },
          {
            foreignKeyName: "donor_campaign_packages_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "vw_donors_with_addresses"
            referencedColumns: ["donor_id"]
          },
          {
            foreignKeyName: "donor_campaign_packages_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      donor_sku_items: {
        Row: {
          created_at: string | null
          donor_id: string | null
          id: string
          legacy_id: number | null
          quantity: number | null
          sku_item_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          donor_id?: string | null
          id?: string
          legacy_id?: number | null
          quantity?: number | null
          sku_item_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          donor_id?: string | null
          id?: string
          legacy_id?: number | null
          quantity?: number | null
          sku_item_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "donor_sku_items_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "contributor_leaderboard"
            referencedColumns: ["donor_id"]
          },
          {
            foreignKeyName: "donor_sku_items_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "donor_pledge_totals"
            referencedColumns: ["donor_id"]
          },
          {
            foreignKeyName: "donor_sku_items_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "donors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donor_sku_items_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "my_donor_profile"
            referencedColumns: ["donor_id"]
          },
          {
            foreignKeyName: "donor_sku_items_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "reserve_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donor_sku_items_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "vw_donor_details"
            referencedColumns: ["donor_id"]
          },
          {
            foreignKeyName: "donor_sku_items_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "vw_donors_with_addresses"
            referencedColumns: ["donor_id"]
          },
          {
            foreignKeyName: "donor_sku_items_sku_item_id_fkey"
            columns: ["sku_item_id"]
            isOneToOne: false
            referencedRelation: "sku_items"
            referencedColumns: ["id"]
          },
        ]
      }
      donors: {
        Row: {
          admin: boolean | null
          auth_user_id: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          deleted: boolean | null
          donor_name: string | null
          donor_tier: string | null
          email: string
          email_lists: string | null
          email_permission_status: string | null
          email_status: string | null
          email_verified_at: string | null
          first_name: string | null
          full_name: string | null
          id: string
          import_file_name: string | null
          imported_at: string | null
          is_duplicate: boolean | null
          last_login: string | null
          last_name: string | null
          legacy_id: number | null
          need_update: boolean | null
          notes: string | null
          package_count: number | null
          password: string | null
          remember_token: string | null
          reset_pass: string | null
          reward_lists: string | null
          sku_count: number | null
          source: string | null
          source_amount: string | null
          source_campaign: string | null
          source_contribution_date: string | null
          source_contribution_id: string | null
          source_name: string | null
          source_order_status: string | null
          source_payment_status: string | null
          source_perk_name: string | null
          source_platform: string | null
          source_raw_data: Json | null
          source_record_id: string | null
          source_reward_title: string | null
          temp_id: number | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          admin?: boolean | null
          auth_user_id?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          deleted?: boolean | null
          donor_name?: string | null
          donor_tier?: string | null
          email: string
          email_lists?: string | null
          email_permission_status?: string | null
          email_status?: string | null
          email_verified_at?: string | null
          first_name?: string | null
          full_name?: string | null
          id?: string
          import_file_name?: string | null
          imported_at?: string | null
          is_duplicate?: boolean | null
          last_login?: string | null
          last_name?: string | null
          legacy_id?: number | null
          need_update?: boolean | null
          notes?: string | null
          package_count?: number | null
          password?: string | null
          remember_token?: string | null
          reset_pass?: string | null
          reward_lists?: string | null
          sku_count?: number | null
          source?: string | null
          source_amount?: string | null
          source_campaign?: string | null
          source_contribution_date?: string | null
          source_contribution_id?: string | null
          source_name?: string | null
          source_order_status?: string | null
          source_payment_status?: string | null
          source_perk_name?: string | null
          source_platform?: string | null
          source_raw_data?: Json | null
          source_record_id?: string | null
          source_reward_title?: string | null
          temp_id?: number | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          admin?: boolean | null
          auth_user_id?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          deleted?: boolean | null
          donor_name?: string | null
          donor_tier?: string | null
          email?: string
          email_lists?: string | null
          email_permission_status?: string | null
          email_status?: string | null
          email_verified_at?: string | null
          first_name?: string | null
          full_name?: string | null
          id?: string
          import_file_name?: string | null
          imported_at?: string | null
          is_duplicate?: boolean | null
          last_login?: string | null
          last_name?: string | null
          legacy_id?: number | null
          need_update?: boolean | null
          notes?: string | null
          package_count?: number | null
          password?: string | null
          remember_token?: string | null
          reset_pass?: string | null
          reward_lists?: string | null
          sku_count?: number | null
          source?: string | null
          source_amount?: string | null
          source_campaign?: string | null
          source_contribution_date?: string | null
          source_contribution_id?: string | null
          source_name?: string | null
          source_order_status?: string | null
          source_payment_status?: string | null
          source_perk_name?: string | null
          source_platform?: string | null
          source_raw_data?: Json | null
          source_record_id?: string | null
          source_reward_title?: string | null
          temp_id?: number | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      donors_with_duplicate_legacy_ids: {
        Row: {
          created_at: string | null
          donor_tier: string | null
          email: string | null
          email_lists: string | null
          email_permission_status: string | null
          email_status: string | null
          first_name: string | null
          id: string | null
          import_file_name: string | null
          imported_at: string | null
          last_name: string | null
          legacy_id: number | null
          legacy_id_occurrence_count: number | null
          notes: string | null
          reward_lists: string | null
          source: string | null
          source_name: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          donor_tier?: string | null
          email?: string | null
          email_lists?: string | null
          email_permission_status?: string | null
          email_status?: string | null
          first_name?: string | null
          id?: string | null
          import_file_name?: string | null
          imported_at?: string | null
          last_name?: string | null
          legacy_id?: number | null
          legacy_id_occurrence_count?: number | null
          notes?: string | null
          reward_lists?: string | null
          source?: string | null
          source_name?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          donor_tier?: string | null
          email?: string | null
          email_lists?: string | null
          email_permission_status?: string | null
          email_status?: string | null
          first_name?: string | null
          id?: string | null
          import_file_name?: string | null
          imported_at?: string | null
          last_name?: string | null
          legacy_id?: number | null
          legacy_id_occurrence_count?: number | null
          notes?: string | null
          reward_lists?: string | null
          source?: string | null
          source_name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      forum_badges: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          label: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          label: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          label?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      forum_bookmarks: {
        Row: {
          created_at: string | null
          thread_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          thread_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          thread_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_bookmarks_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "forum_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_comments: {
        Row: {
          author_user_id: string | null
          author_username: string
          content: string
          created_at: string | null
          id: string
          image_url: string | null
          is_edited: boolean | null
          like_count: number | null
          parent_comment_id: string | null
          thread_id: string
          updated_at: string | null
        }
        Insert: {
          author_user_id?: string | null
          author_username: string
          content: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_edited?: boolean | null
          like_count?: number | null
          parent_comment_id?: string | null
          thread_id: string
          updated_at?: string | null
        }
        Update: {
          author_user_id?: string | null
          author_username?: string
          content?: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_edited?: boolean | null
          like_count?: number | null
          parent_comment_id?: string | null
          thread_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "forum_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "forum_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_comments_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "forum_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_likes: {
        Row: {
          comment_id: string | null
          created_at: string | null
          id: string
          thread_id: string | null
          user_id: string
        }
        Insert: {
          comment_id?: string | null
          created_at?: string | null
          id?: string
          thread_id?: string | null
          user_id: string
        }
        Update: {
          comment_id?: string | null
          created_at?: string | null
          id?: string
          thread_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "forum_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_likes_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "forum_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_notifications: {
        Row: {
          actor_user_id: string | null
          actor_username: string
          comment_id: string | null
          content: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          thread_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          actor_user_id?: string | null
          actor_username: string
          comment_id?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          thread_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          actor_user_id?: string | null
          actor_username?: string
          comment_id?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          thread_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_notifications_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "forum_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_notifications_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "forum_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_ranks: {
        Row: {
          created_at: string
          description: string | null
          id: string
          min_points: number
          name: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          min_points?: number
          name: string
          slug: string
          sort_order: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          min_points?: number
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      forum_reports: {
        Row: {
          comment_id: string | null
          created_at: string | null
          id: string
          reason: string
          reporter_user_id: string
          status: string | null
          thread_id: string | null
          updated_at: string | null
        }
        Insert: {
          comment_id?: string | null
          created_at?: string | null
          id?: string
          reason: string
          reporter_user_id: string
          status?: string | null
          thread_id?: string | null
          updated_at?: string | null
        }
        Update: {
          comment_id?: string | null
          created_at?: string | null
          id?: string
          reason?: string
          reporter_user_id?: string
          status?: string | null
          thread_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "forum_reports_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "forum_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_reports_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "forum_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_threads: {
        Row: {
          author_badges: Json | null
          author_joined_date: string | null
          author_post_count: number | null
          author_rank_min_points: number | null
          author_rank_name: string | null
          author_signature: string | null
          author_user_id: string | null
          author_username: string
          category: Database["public"]["Enums"]["forum_category"]
          comment_count: number | null
          content: string
          created_at: string
          id: string
          image_url: string | null
          is_official: boolean
          is_pinned: boolean
          like_count: number | null
          tactical_game_id: string | null
          title: string
          updated_at: string
          view_count: number | null
        }
        Insert: {
          author_badges?: Json | null
          author_joined_date?: string | null
          author_post_count?: number | null
          author_rank_min_points?: number | null
          author_rank_name?: string | null
          author_signature?: string | null
          author_user_id?: string | null
          author_username: string
          category?: Database["public"]["Enums"]["forum_category"]
          comment_count?: number | null
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_official?: boolean
          is_pinned?: boolean
          like_count?: number | null
          tactical_game_id?: string | null
          title: string
          updated_at?: string
          view_count?: number | null
        }
        Update: {
          author_badges?: Json | null
          author_joined_date?: string | null
          author_post_count?: number | null
          author_rank_min_points?: number | null
          author_rank_name?: string | null
          author_signature?: string | null
          author_user_id?: string | null
          author_username?: string
          category?: Database["public"]["Enums"]["forum_category"]
          comment_count?: number | null
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_official?: boolean
          is_pinned?: boolean
          like_count?: number | null
          tactical_game_id?: string | null
          title?: string
          updated_at?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "forum_threads_tactical_game_id_fkey"
            columns: ["tactical_game_id"]
            isOneToOne: false
            referencedRelation: "tactical_games"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_user_badges: {
        Row: {
          awarded_at: string
          badge_id: string
          ref_id: string | null
          ref_table: string | null
          source: string | null
          user_id: string
        }
        Insert: {
          awarded_at?: string
          badge_id: string
          ref_id?: string | null
          ref_table?: string | null
          source?: string | null
          user_id: string
        }
        Update: {
          awarded_at?: string
          badge_id?: string
          ref_id?: string | null
          ref_table?: string | null
          source?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "forum_badges"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_user_follows: {
        Row: {
          created_at: string | null
          follower_id: string
          following_id: string
        }
        Insert: {
          created_at?: string | null
          follower_id: string
          following_id: string
        }
        Update: {
          created_at?: string | null
          follower_id?: string
          following_id?: string
        }
        Relationships: []
      }
      forum_user_ranks: {
        Row: {
          rank_id: string
          set_by: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          rank_id: string
          set_by?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          rank_id?: string
          set_by?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_user_ranks_rank_id_fkey"
            columns: ["rank_id"]
            isOneToOne: false
            referencedRelation: "forum_ranks"
            referencedColumns: ["id"]
          },
        ]
      }
      legacy_campaigns: {
        Row: {
          created_at: string | null
          description: string | null
          end_date: string | null
          id: number
          image_url: string | null
          is_active: boolean | null
          legacy_id: number | null
          name: string
          platform: string | null
          start_date: string | null
          updated_at: string | null
          url: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: number
          image_url?: string | null
          is_active?: boolean | null
          legacy_id?: number | null
          name: string
          platform?: string | null
          start_date?: string | null
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: number
          image_url?: string | null
          is_active?: boolean | null
          legacy_id?: number | null
          name?: string
          platform?: string | null
          start_date?: string | null
          updated_at?: string | null
          url?: string | null
        }
        Relationships: []
      }
      legacy_donor_packages: {
        Row: {
          amount: number | null
          campaign_id: number | null
          created_at: string | null
          donor_id: number | null
          id: number
          package_id: number | null
          updated_at: string | null
        }
        Insert: {
          amount?: number | null
          campaign_id?: number | null
          created_at?: string | null
          donor_id?: number | null
          id: number
          package_id?: number | null
          updated_at?: string | null
        }
        Update: {
          amount?: number | null
          campaign_id?: number | null
          created_at?: string | null
          donor_id?: number | null
          id?: number
          package_id?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "legacy_donor_packages_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "legacy_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      legacy_donor_skus: {
        Row: {
          created_at: string | null
          date: string | null
          donation_id: number | null
          donor_id: number | null
          id: number
          sku_id: number | null
          status: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date?: string | null
          donation_id?: number | null
          donor_id?: number | null
          id: number
          sku_id?: number | null
          status?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string | null
          donation_id?: number | null
          donor_id?: number | null
          id?: number
          sku_id?: number | null
          status?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "legacy_donor_skus_sku_id_fkey"
            columns: ["sku_id"]
            isOneToOne: false
            referencedRelation: "legacy_skus"
            referencedColumns: ["id"]
          },
        ]
      }
      legacy_donors: {
        Row: {
          created_at: string | null
          donor_tier: string | null
          email: string | null
          email_lists: string | null
          email_permission_status: string | null
          email_status: string | null
          first_name: string | null
          id: string
          import_file_name: string | null
          imported_at: string | null
          is_duplicate: boolean | null
          last_name: string | null
          legacy_id: number | null
          notes: string | null
          package_count: number | null
          reward_lists: string | null
          sku_count: number | null
          source: string | null
          source_amount: string | null
          source_campaign: string | null
          source_contribution_date: string | null
          source_contribution_id: string | null
          source_name: string | null
          source_order_status: string | null
          source_payment_status: string | null
          source_perk_name: string | null
          source_platform: string | null
          source_raw_data: Json | null
          source_record_id: string | null
          source_reward_title: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          donor_tier?: string | null
          email?: string | null
          email_lists?: string | null
          email_permission_status?: string | null
          email_status?: string | null
          first_name?: string | null
          id: string
          import_file_name?: string | null
          imported_at?: string | null
          is_duplicate?: boolean | null
          last_name?: string | null
          legacy_id?: number | null
          notes?: string | null
          package_count?: number | null
          reward_lists?: string | null
          sku_count?: number | null
          source?: string | null
          source_amount?: string | null
          source_campaign?: string | null
          source_contribution_date?: string | null
          source_contribution_id?: string | null
          source_name?: string | null
          source_order_status?: string | null
          source_payment_status?: string | null
          source_perk_name?: string | null
          source_platform?: string | null
          source_raw_data?: Json | null
          source_record_id?: string | null
          source_reward_title?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          donor_tier?: string | null
          email?: string | null
          email_lists?: string | null
          email_permission_status?: string | null
          email_status?: string | null
          first_name?: string | null
          id?: string
          import_file_name?: string | null
          imported_at?: string | null
          is_duplicate?: boolean | null
          last_name?: string | null
          legacy_id?: number | null
          notes?: string | null
          package_count?: number | null
          reward_lists?: string | null
          sku_count?: number | null
          source?: string | null
          source_amount?: string | null
          source_campaign?: string | null
          source_contribution_date?: string | null
          source_contribution_id?: string | null
          source_name?: string | null
          source_order_status?: string | null
          source_payment_status?: string | null
          source_perk_name?: string | null
          source_platform?: string | null
          source_raw_data?: Json | null
          source_record_id?: string | null
          source_reward_title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      legacy_package_skus: {
        Row: {
          created_at: string | null
          id: number
          package_id: number | null
          sku_id: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id: number
          package_id?: number | null
          sku_id?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          package_id?: number | null
          sku_id?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "legacy_package_skus_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "legacy_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "legacy_package_skus_sku_id_fkey"
            columns: ["sku_id"]
            isOneToOne: false
            referencedRelation: "legacy_skus"
            referencedColumns: ["id"]
          },
        ]
      }
      legacy_packages: {
        Row: {
          active: boolean | null
          created_at: string | null
          id: number
          name: string | null
          price: number | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          id: number
          name?: string | null
          price?: number | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          id?: number
          name?: string | null
          price?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      legacy_pledges: {
        Row: {
          amount: number | null
          campaign_id: number | null
          created_at: string | null
          donor_id: string | null
          donor_reference: number | null
          id: number
          legacy_id: number | null
          perk_id: number | null
          reward_id: number | null
          status: string | null
          updated_at: string | null
          user_id: number | null
        }
        Insert: {
          amount?: number | null
          campaign_id?: number | null
          created_at?: string | null
          donor_id?: string | null
          donor_reference?: number | null
          id?: number
          legacy_id?: number | null
          perk_id?: number | null
          reward_id?: number | null
          status?: string | null
          updated_at?: string | null
          user_id?: number | null
        }
        Update: {
          amount?: number | null
          campaign_id?: number | null
          created_at?: string | null
          donor_id?: string | null
          donor_reference?: number | null
          id?: number
          legacy_id?: number | null
          perk_id?: number | null
          reward_id?: number | null
          status?: string | null
          updated_at?: string | null
          user_id?: number | null
        }
        Relationships: []
      }
      legacy_rewards: {
        Row: {
          amount: number | null
          campaign_id: number | null
          created_at: string | null
          description: string | null
          id: number
          image_url: string | null
          is_active: boolean | null
          legacy_id: number | null
          name: string | null
          updated_at: string | null
        }
        Insert: {
          amount?: number | null
          campaign_id?: number | null
          created_at?: string | null
          description?: string | null
          id?: number
          image_url?: string | null
          is_active?: boolean | null
          legacy_id?: number | null
          name?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number | null
          campaign_id?: number | null
          created_at?: string | null
          description?: string | null
          id?: number
          image_url?: string | null
          is_active?: boolean | null
          legacy_id?: number | null
          name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      legacy_skus: {
        Row: {
          created_at: string | null
          description: string | null
          id: number
          name: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id: number
          name?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: number
          name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      legacy_src_indiegogo: {
        Row: {
          amount: number | null
          contributor_name: string | null
          email: string | null
          id: number
          imported_at: string | null
          perk_name: string | null
          pledge_date: string | null
          raw_data: Json | null
        }
        Insert: {
          amount?: number | null
          contributor_name?: string | null
          email?: string | null
          id?: number
          imported_at?: string | null
          perk_name?: string | null
          pledge_date?: string | null
          raw_data?: Json | null
        }
        Update: {
          amount?: number | null
          contributor_name?: string | null
          email?: string | null
          id?: number
          imported_at?: string | null
          perk_name?: string | null
          pledge_date?: string | null
          raw_data?: Json | null
        }
        Relationships: []
      }
      legacy_src_kickstarter_axanar: {
        Row: {
          amount: number | null
          backer_name: string | null
          email: string | null
          id: number
          imported_at: string | null
          perk_name: string | null
          pledge_date: string | null
          raw_data: Json | null
        }
        Insert: {
          amount?: number | null
          backer_name?: string | null
          email?: string | null
          id?: number
          imported_at?: string | null
          perk_name?: string | null
          pledge_date?: string | null
          raw_data?: Json | null
        }
        Update: {
          amount?: number | null
          backer_name?: string | null
          email?: string | null
          id?: number
          imported_at?: string | null
          perk_name?: string | null
          pledge_date?: string | null
          raw_data?: Json | null
        }
        Relationships: []
      }
      legacy_src_kickstarter_prelude: {
        Row: {
          amount: number | null
          backer_name: string | null
          email: string | null
          id: number
          imported_at: string | null
          perk_name: string | null
          pledge_date: string | null
          raw_data: Json | null
        }
        Insert: {
          amount?: number | null
          backer_name?: string | null
          email?: string | null
          id?: number
          imported_at?: string | null
          perk_name?: string | null
          pledge_date?: string | null
          raw_data?: Json | null
        }
        Update: {
          amount?: number | null
          backer_name?: string | null
          email?: string | null
          id?: number
          imported_at?: string | null
          perk_name?: string | null
          pledge_date?: string | null
          raw_data?: Json | null
        }
        Relationships: []
      }
      legacy_src_paypal_axanar: {
        Row: {
          amount: number | null
          email: string | null
          first_name: string | null
          id: number
          imported_at: string | null
          last_name: string | null
          name: string | null
          perk_name: string | null
          pledge_date: string | null
          raw_data: Json | null
        }
        Insert: {
          amount?: number | null
          email?: string | null
          first_name?: string | null
          id?: number
          imported_at?: string | null
          last_name?: string | null
          name?: string | null
          perk_name?: string | null
          pledge_date?: string | null
          raw_data?: Json | null
        }
        Update: {
          amount?: number | null
          email?: string | null
          first_name?: string | null
          id?: number
          imported_at?: string | null
          last_name?: string | null
          name?: string | null
          perk_name?: string | null
          pledge_date?: string | null
          raw_data?: Json | null
        }
        Relationships: []
      }
      legacy_src_paypal_prelude: {
        Row: {
          amount: number | null
          email: string | null
          first_name: string | null
          id: number
          imported_at: string | null
          last_name: string | null
          name: string | null
          perk_name: string | null
          pledge_date: string | null
          raw_data: Json | null
        }
        Insert: {
          amount?: number | null
          email?: string | null
          first_name?: string | null
          id?: number
          imported_at?: string | null
          last_name?: string | null
          name?: string | null
          perk_name?: string | null
          pledge_date?: string | null
          raw_data?: Json | null
        }
        Update: {
          amount?: number | null
          email?: string | null
          first_name?: string | null
          id?: number
          imported_at?: string | null
          last_name?: string | null
          name?: string | null
          perk_name?: string | null
          pledge_date?: string | null
          raw_data?: Json | null
        }
        Relationships: []
      }
      legacy_src_secret_perks: {
        Row: {
          amount: number | null
          email: string | null
          first_name: string | null
          id: number
          imported_at: string | null
          last_name: string | null
          name: string | null
          perk_name: string | null
          pledge_date: string | null
          raw_data: Json | null
        }
        Insert: {
          amount?: number | null
          email?: string | null
          first_name?: string | null
          id?: number
          imported_at?: string | null
          last_name?: string | null
          name?: string | null
          perk_name?: string | null
          pledge_date?: string | null
          raw_data?: Json | null
        }
        Update: {
          amount?: number | null
          email?: string | null
          first_name?: string | null
          id?: number
          imported_at?: string | null
          last_name?: string | null
          name?: string | null
          perk_name?: string | null
          pledge_date?: string | null
          raw_data?: Json | null
        }
        Relationships: []
      }
      "legacy-user-skus": {
        Row: {
          "0": string | null
          "0_1": string | null
          "1": string | null
          "2016-09-17 00:04:24": string | null
          "6": number | null
          donation_id: number | null
          legacy_id: number | null
        }
        Insert: {
          "0"?: string | null
          "0_1"?: string | null
          "1"?: string | null
          "2016-09-17 00:04:24"?: string | null
          "6"?: number | null
          donation_id?: number | null
          legacy_id?: number | null
        }
        Update: {
          "0"?: string | null
          "0_1"?: string | null
          "1"?: string | null
          "2016-09-17 00:04:24"?: string | null
          "6"?: number | null
          donation_id?: number | null
          legacy_id?: number | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          category: string | null
          content: string
          created_at: string | null
          id: number
          is_read: boolean | null
          priority: string | null
          recipient_id: string
          sender_id: string
          status: string | null
          subject: string | null
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string | null
          id?: number
          is_read?: boolean | null
          priority?: string | null
          recipient_id: string
          sender_id: string
          status?: string | null
          subject?: string | null
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string | null
          id?: number
          is_read?: boolean | null
          priority?: string | null
          recipient_id?: string
          sender_id?: string
          status?: string | null
          subject?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          donor_id: string | null
          id: string
          legacy_id: number | null
          message: string
          read: boolean | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          donor_id?: string | null
          id?: string
          legacy_id?: number | null
          message: string
          read?: boolean | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          donor_id?: string | null
          id?: string
          legacy_id?: number | null
          message?: string
          read?: boolean | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "contributor_leaderboard"
            referencedColumns: ["donor_id"]
          },
          {
            foreignKeyName: "notifications_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "donor_pledge_totals"
            referencedColumns: ["donor_id"]
          },
          {
            foreignKeyName: "notifications_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "donors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "my_donor_profile"
            referencedColumns: ["donor_id"]
          },
          {
            foreignKeyName: "notifications_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "reserve_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "vw_donor_details"
            referencedColumns: ["donor_id"]
          },
          {
            foreignKeyName: "notifications_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "vw_donors_with_addresses"
            referencedColumns: ["donor_id"]
          },
        ]
      }
      orphaned_data_summary: {
        Row: {
          donors_missing_email: number | null
          donors_with_duplicate_emails: number | null
          donors_with_duplicate_legacy_ids: number | null
          generated_at: string | null
          total_donors: number | null
        }
        Insert: {
          donors_missing_email?: number | null
          donors_with_duplicate_emails?: number | null
          donors_with_duplicate_legacy_ids?: number | null
          generated_at?: string | null
          total_donors?: number | null
        }
        Update: {
          donors_missing_email?: number | null
          donors_with_duplicate_emails?: number | null
          donors_with_duplicate_legacy_ids?: number | null
          generated_at?: string | null
          total_donors?: number | null
        }
        Relationships: []
      }
      orphaned_donors_no_email: {
        Row: {
          created_at: string | null
          donor_tier: string | null
          email: string | null
          email_lists: string | null
          email_permission_status: string | null
          email_status: string | null
          first_name: string | null
          id: string | null
          import_file_name: string | null
          imported_at: string | null
          last_name: string | null
          legacy_id: number | null
          notes: string | null
          reward_lists: string | null
          source: string | null
          source_name: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          donor_tier?: string | null
          email?: string | null
          email_lists?: string | null
          email_permission_status?: string | null
          email_status?: string | null
          first_name?: string | null
          id?: string | null
          import_file_name?: string | null
          imported_at?: string | null
          last_name?: string | null
          legacy_id?: number | null
          notes?: string | null
          reward_lists?: string | null
          source?: string | null
          source_name?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          donor_tier?: string | null
          email?: string | null
          email_lists?: string | null
          email_permission_status?: string | null
          email_status?: string | null
          first_name?: string | null
          id?: string | null
          import_file_name?: string | null
          imported_at?: string | null
          last_name?: string | null
          legacy_id?: number | null
          notes?: string | null
          reward_lists?: string | null
          source?: string | null
          source_name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      package_sku_items: {
        Row: {
          created_at: string | null
          id: string
          legacy_id: number | null
          package_id: string | null
          quantity: number | null
          sku_item_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          legacy_id?: number | null
          package_id?: string | null
          quantity?: number | null
          sku_item_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          legacy_id?: number | null
          package_id?: string | null
          quantity?: number | null
          sku_item_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "package_sku_items_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "package_sku_items_sku_item_id_fkey"
            columns: ["sku_item_id"]
            isOneToOne: false
            referencedRelation: "sku_items"
            referencedColumns: ["id"]
          },
        ]
      }
      packages: {
        Row: {
          active: boolean | null
          created_at: string | null
          description: string | null
          id: string
          legacy_id: number | null
          name: string
          price: number | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          legacy_id?: number | null
          name: string
          price?: number | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          legacy_id?: number | null
          name?: string
          price?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      password_reset_attempts: {
        Row: {
          created_at: string | null
          email: string
          id: string
          ip_address: unknown
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          ip_address: unknown
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          ip_address?: unknown
        }
        Relationships: []
      }
      password_reset_security_log: {
        Row: {
          attempt_count: number | null
          blocked_until: string | null
          created_at: string | null
          email: string
          id: string
          ip_address: unknown
          last_attempt: string | null
          user_agent: string | null
        }
        Insert: {
          attempt_count?: number | null
          blocked_until?: string | null
          created_at?: string | null
          email: string
          id?: string
          ip_address?: unknown
          last_attempt?: string | null
          user_agent?: string | null
        }
        Update: {
          attempt_count?: number | null
          blocked_until?: string | null
          created_at?: string | null
          email?: string
          id?: string
          ip_address?: unknown
          last_attempt?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      placeholder_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      platformuser: {
        Row: {
          campaign_id: number | null
          created_at: string | null
          email_address: string | null
          first_name: string | null
          id: number
          last_name: string | null
          legacy_id: number | null
          platform_id: number | null
          status: number | null
          updated_at: string | null
        }
        Insert: {
          campaign_id?: number | null
          created_at?: string | null
          email_address?: string | null
          first_name?: string | null
          id?: number
          last_name?: string | null
          legacy_id?: number | null
          platform_id?: number | null
          status?: number | null
          updated_at?: string | null
        }
        Update: {
          campaign_id?: number | null
          created_at?: string | null
          email_address?: string | null
          first_name?: string | null
          id?: number
          last_name?: string | null
          legacy_id?: number | null
          platform_id?: number | null
          status?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      pledges: {
        Row: {
          amount: number
          campaign_id: string | null
          created_at: string
          delivered_at: string | null
          donor_id: string | null
          id: string
          legacy_id: number | null
          reward_id: string | null
          shipped_at: string | null
          shipping_notes: string | null
          shipping_status: string | null
          source: string | null
          status: string | null
          tracking_number: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          campaign_id?: string | null
          created_at?: string
          delivered_at?: string | null
          donor_id?: string | null
          id?: string
          legacy_id?: number | null
          reward_id?: string | null
          shipped_at?: string | null
          shipping_notes?: string | null
          shipping_status?: string | null
          source?: string | null
          status?: string | null
          tracking_number?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          campaign_id?: string | null
          created_at?: string
          delivered_at?: string | null
          donor_id?: string | null
          id?: string
          legacy_id?: number | null
          reward_id?: string | null
          shipped_at?: string | null
          shipping_notes?: string | null
          shipping_status?: string | null
          source?: string | null
          status?: string | null
          tracking_number?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pledges_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaign_analytics"
            referencedColumns: ["campaign_id"]
          },
          {
            foreignKeyName: "pledges_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaign_totals"
            referencedColumns: ["campaign_id"]
          },
          {
            foreignKeyName: "pledges_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pledges_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "contributor_leaderboard"
            referencedColumns: ["donor_id"]
          },
          {
            foreignKeyName: "pledges_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "donor_pledge_totals"
            referencedColumns: ["donor_id"]
          },
          {
            foreignKeyName: "pledges_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "donors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pledges_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "my_donor_profile"
            referencedColumns: ["donor_id"]
          },
          {
            foreignKeyName: "pledges_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "reserve_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pledges_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "vw_donor_details"
            referencedColumns: ["donor_id"]
          },
          {
            foreignKeyName: "pledges_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "vw_donors_with_addresses"
            referencedColumns: ["donor_id"]
          },
          {
            foreignKeyName: "pledges_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "rewards"
            referencedColumns: ["id"]
          },
        ]
      }
      pledges_backup_rollback_20250910: {
        Row: {
          amount: number | null
          campaign_id: string | null
          created_at: string | null
          donor_id: string | null
          id: string | null
          legacy_id: number | null
          reward_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          amount?: number | null
          campaign_id?: string | null
          created_at?: string | null
          donor_id?: string | null
          id?: string | null
          legacy_id?: number | null
          reward_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number | null
          campaign_id?: string | null
          created_at?: string | null
          donor_id?: string | null
          id?: string | null
          legacy_id?: number | null
          reward_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      pledges_reassign_backup2: {
        Row: {
          amount: number | null
          backup_at: string | null
          backup_id: number
          backup_reason: string | null
          campaign_id: string | null
          created_at: string | null
          donor_id: string | null
          id: string | null
          legacy_id: number | null
          moved_to_campaign: string | null
          reward_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          amount?: number | null
          backup_at?: string | null
          backup_id?: number
          backup_reason?: string | null
          campaign_id?: string | null
          created_at?: string | null
          donor_id?: string | null
          id?: string | null
          legacy_id?: number | null
          moved_to_campaign?: string | null
          reward_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number | null
          backup_at?: string | null
          backup_id?: number
          backup_reason?: string | null
          campaign_id?: string | null
          created_at?: string | null
          donor_id?: string | null
          id?: string | null
          legacy_id?: number | null
          moved_to_campaign?: string | null
          reward_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      problematic_donor_emails: {
        Row: {
          created_at: string | null
          donor_tier: string | null
          email: string | null
          email_lists: string | null
          email_occurrence_count: number | null
          email_permission_status: string | null
          email_status: string | null
          first_name: string | null
          id: string | null
          import_file_name: string | null
          imported_at: string | null
          last_name: string | null
          legacy_id: number | null
          notes: string | null
          reward_lists: string | null
          source: string | null
          source_name: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          donor_tier?: string | null
          email?: string | null
          email_lists?: string | null
          email_occurrence_count?: number | null
          email_permission_status?: string | null
          email_status?: string | null
          first_name?: string | null
          id?: string | null
          import_file_name?: string | null
          imported_at?: string | null
          last_name?: string | null
          legacy_id?: number | null
          notes?: string | null
          reward_lists?: string | null
          source?: string | null
          source_name?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          donor_tier?: string | null
          email?: string | null
          email_lists?: string | null
          email_occurrence_count?: number | null
          email_permission_status?: string | null
          email_status?: string | null
          first_name?: string | null
          id?: string | null
          import_file_name?: string | null
          imported_at?: string | null
          last_name?: string | null
          legacy_id?: number | null
          notes?: string | null
          reward_lists?: string | null
          source?: string | null
          source_name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          achievement_xp: number | null
          active_title_multiplier: number | null
          avatar_url: string | null
          background_url: string | null
          bio: string | null
          created_at: string
          donation_xp: number | null
          forum_xp: number | null
          full_name: string | null
          id: string
          participation_xp: number | null
          profile_completion_xp: number | null
          recruitment_xp: number | null
          show_avatar_publicly: boolean | null
          show_background_publicly: boolean | null
          show_real_name_publicly: boolean | null
          title_bonus_xp: number | null
          total_comments: number | null
          total_posts: number | null
          unified_xp: number | null
          updated_at: string
          username: string | null
        }
        Insert: {
          achievement_xp?: number | null
          active_title_multiplier?: number | null
          avatar_url?: string | null
          background_url?: string | null
          bio?: string | null
          created_at?: string
          donation_xp?: number | null
          forum_xp?: number | null
          full_name?: string | null
          id: string
          participation_xp?: number | null
          profile_completion_xp?: number | null
          recruitment_xp?: number | null
          show_avatar_publicly?: boolean | null
          show_background_publicly?: boolean | null
          show_real_name_publicly?: boolean | null
          title_bonus_xp?: number | null
          total_comments?: number | null
          total_posts?: number | null
          unified_xp?: number | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          achievement_xp?: number | null
          active_title_multiplier?: number | null
          avatar_url?: string | null
          background_url?: string | null
          bio?: string | null
          created_at?: string
          donation_xp?: number | null
          forum_xp?: number | null
          full_name?: string | null
          id?: string
          participation_xp?: number | null
          profile_completion_xp?: number | null
          recruitment_xp?: number | null
          show_avatar_publicly?: boolean | null
          show_background_publicly?: boolean | null
          show_real_name_publicly?: boolean | null
          title_bonus_xp?: number | null
          total_comments?: number | null
          total_posts?: number | null
          unified_xp?: number | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      rewards: {
        Row: {
          campaign_id: string | null
          created_at: string | null
          description: string | null
          estimated_ship_date: string | null
          id: string
          is_physical: boolean | null
          legacy_id: number | null
          minimum_amount: number | null
          name: string | null
          requires_shipping: boolean | null
          updated_at: string | null
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string | null
          description?: string | null
          estimated_ship_date?: string | null
          id?: string
          is_physical?: boolean | null
          legacy_id?: number | null
          minimum_amount?: number | null
          name?: string | null
          requires_shipping?: boolean | null
          updated_at?: string | null
        }
        Update: {
          campaign_id?: string | null
          created_at?: string | null
          description?: string | null
          estimated_ship_date?: string | null
          id?: string
          is_physical?: boolean | null
          legacy_id?: number | null
          minimum_amount?: number | null
          name?: string | null
          requires_shipping?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rewards_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaign_analytics"
            referencedColumns: ["campaign_id"]
          },
          {
            foreignKeyName: "rewards_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaign_totals"
            referencedColumns: ["campaign_id"]
          },
          {
            foreignKeyName: "rewards_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      schema_versions: {
        Row: {
          applied_at: string | null
          description: string | null
          id: number
          version: string
        }
        Insert: {
          applied_at?: string | null
          description?: string | null
          id?: number
          version: string
        }
        Update: {
          applied_at?: string | null
          description?: string | null
          id?: number
          version?: string
        }
        Relationships: []
      }
      sku_items: {
        Row: {
          active: boolean | null
          created_at: string | null
          description: string | null
          id: string
          legacy_id: number | null
          name: string
          price: number | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          legacy_id?: number | null
          name: string
          price?: number | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          legacy_id?: number | null
          name?: string
          price?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      src_indiegogo: {
        Row: {
          contribution_amount: string | null
          contribution_date: string | null
          contributor_id: string | null
          contributor_name: string | null
          created_at: string | null
          donor_id: string | null
          email: string | null
          fulfillment_status: string | null
          id: string
          imported: boolean | null
          legacy_id: number | null
          notes: string | null
          perk_amount: string | null
          perk_id: number | null
          perk_title: string | null
          shipping_amount: string | null
          shipping_country: string | null
        }
        Insert: {
          contribution_amount?: string | null
          contribution_date?: string | null
          contributor_id?: string | null
          contributor_name?: string | null
          created_at?: string | null
          donor_id?: string | null
          email?: string | null
          fulfillment_status?: string | null
          id?: string
          imported?: boolean | null
          legacy_id?: number | null
          notes?: string | null
          perk_amount?: string | null
          perk_id?: number | null
          perk_title?: string | null
          shipping_amount?: string | null
          shipping_country?: string | null
        }
        Update: {
          contribution_amount?: string | null
          contribution_date?: string | null
          contributor_id?: string | null
          contributor_name?: string | null
          created_at?: string | null
          donor_id?: string | null
          email?: string | null
          fulfillment_status?: string | null
          id?: string
          imported?: boolean | null
          legacy_id?: number | null
          notes?: string | null
          perk_amount?: string | null
          perk_id?: number | null
          perk_title?: string | null
          shipping_amount?: string | null
          shipping_country?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "src_indiegogo_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "contributor_leaderboard"
            referencedColumns: ["donor_id"]
          },
          {
            foreignKeyName: "src_indiegogo_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "donor_pledge_totals"
            referencedColumns: ["donor_id"]
          },
          {
            foreignKeyName: "src_indiegogo_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "donors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "src_indiegogo_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "my_donor_profile"
            referencedColumns: ["donor_id"]
          },
          {
            foreignKeyName: "src_indiegogo_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "reserve_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "src_indiegogo_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "vw_donor_details"
            referencedColumns: ["donor_id"]
          },
          {
            foreignKeyName: "src_indiegogo_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "vw_donors_with_addresses"
            referencedColumns: ["donor_id"]
          },
        ]
      }
      src_kickstarter_axanar: {
        Row: {
          backer_name: string | null
          backer_number: number | null
          backer_uid: number | null
          created_at: string | null
          donor_id: string | null
          email: string | null
          id: string
          imported: boolean | null
          legacy_id: number | null
          notes: string | null
          pledge_amt: string | null
          pledged_at: string | null
          pledged_status: string | null
          reward_id: number | null
          reward_min: string | null
          rewards_sent: string | null
          shipping_amount: string | null
          shipping_country: string | null
        }
        Insert: {
          backer_name?: string | null
          backer_number?: number | null
          backer_uid?: number | null
          created_at?: string | null
          donor_id?: string | null
          email?: string | null
          id?: string
          imported?: boolean | null
          legacy_id?: number | null
          notes?: string | null
          pledge_amt?: string | null
          pledged_at?: string | null
          pledged_status?: string | null
          reward_id?: number | null
          reward_min?: string | null
          rewards_sent?: string | null
          shipping_amount?: string | null
          shipping_country?: string | null
        }
        Update: {
          backer_name?: string | null
          backer_number?: number | null
          backer_uid?: number | null
          created_at?: string | null
          donor_id?: string | null
          email?: string | null
          id?: string
          imported?: boolean | null
          legacy_id?: number | null
          notes?: string | null
          pledge_amt?: string | null
          pledged_at?: string | null
          pledged_status?: string | null
          reward_id?: number | null
          reward_min?: string | null
          rewards_sent?: string | null
          shipping_amount?: string | null
          shipping_country?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "src_kickstarter_axanar_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "contributor_leaderboard"
            referencedColumns: ["donor_id"]
          },
          {
            foreignKeyName: "src_kickstarter_axanar_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "donor_pledge_totals"
            referencedColumns: ["donor_id"]
          },
          {
            foreignKeyName: "src_kickstarter_axanar_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "donors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "src_kickstarter_axanar_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "my_donor_profile"
            referencedColumns: ["donor_id"]
          },
          {
            foreignKeyName: "src_kickstarter_axanar_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "reserve_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "src_kickstarter_axanar_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "vw_donor_details"
            referencedColumns: ["donor_id"]
          },
          {
            foreignKeyName: "src_kickstarter_axanar_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "vw_donors_with_addresses"
            referencedColumns: ["donor_id"]
          },
        ]
      }
      src_kickstarter_prelude: {
        Row: {
          backer_name: string | null
          backer_number: number | null
          backer_uid: number | null
          created_at: string | null
          donor_id: string | null
          email: string | null
          id: string
          imported: boolean | null
          legacy_id: number | null
          notes: string | null
          pledge_amt: string | null
          pledged_at: string | null
          pledged_status: string | null
          reward_id: number | null
          reward_min: string | null
          rewards_sent: string | null
          shipping_amount: string | null
          shipping_country: string | null
        }
        Insert: {
          backer_name?: string | null
          backer_number?: number | null
          backer_uid?: number | null
          created_at?: string | null
          donor_id?: string | null
          email?: string | null
          id?: string
          imported?: boolean | null
          legacy_id?: number | null
          notes?: string | null
          pledge_amt?: string | null
          pledged_at?: string | null
          pledged_status?: string | null
          reward_id?: number | null
          reward_min?: string | null
          rewards_sent?: string | null
          shipping_amount?: string | null
          shipping_country?: string | null
        }
        Update: {
          backer_name?: string | null
          backer_number?: number | null
          backer_uid?: number | null
          created_at?: string | null
          donor_id?: string | null
          email?: string | null
          id?: string
          imported?: boolean | null
          legacy_id?: number | null
          notes?: string | null
          pledge_amt?: string | null
          pledged_at?: string | null
          pledged_status?: string | null
          reward_id?: number | null
          reward_min?: string | null
          rewards_sent?: string | null
          shipping_amount?: string | null
          shipping_country?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "src_kickstarter_prelude_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "contributor_leaderboard"
            referencedColumns: ["donor_id"]
          },
          {
            foreignKeyName: "src_kickstarter_prelude_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "donor_pledge_totals"
            referencedColumns: ["donor_id"]
          },
          {
            foreignKeyName: "src_kickstarter_prelude_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "donors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "src_kickstarter_prelude_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "my_donor_profile"
            referencedColumns: ["donor_id"]
          },
          {
            foreignKeyName: "src_kickstarter_prelude_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "reserve_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "src_kickstarter_prelude_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "vw_donor_details"
            referencedColumns: ["donor_id"]
          },
          {
            foreignKeyName: "src_kickstarter_prelude_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "vw_donors_with_addresses"
            referencedColumns: ["donor_id"]
          },
        ]
      }
      src_paypal_axanar: {
        Row: {
          amount: string | null
          created_at: string | null
          donor_id: string | null
          donor_name: string | null
          email: string | null
          id: string
          imported: boolean | null
          legacy_id: number | null
          notes: string | null
          status: string | null
          transaction_date: string | null
          transaction_id: string | null
        }
        Insert: {
          amount?: string | null
          created_at?: string | null
          donor_id?: string | null
          donor_name?: string | null
          email?: string | null
          id?: string
          imported?: boolean | null
          legacy_id?: number | null
          notes?: string | null
          status?: string | null
          transaction_date?: string | null
          transaction_id?: string | null
        }
        Update: {
          amount?: string | null
          created_at?: string | null
          donor_id?: string | null
          donor_name?: string | null
          email?: string | null
          id?: string
          imported?: boolean | null
          legacy_id?: number | null
          notes?: string | null
          status?: string | null
          transaction_date?: string | null
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "src_paypal_axanar_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "contributor_leaderboard"
            referencedColumns: ["donor_id"]
          },
          {
            foreignKeyName: "src_paypal_axanar_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "donor_pledge_totals"
            referencedColumns: ["donor_id"]
          },
          {
            foreignKeyName: "src_paypal_axanar_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "donors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "src_paypal_axanar_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "my_donor_profile"
            referencedColumns: ["donor_id"]
          },
          {
            foreignKeyName: "src_paypal_axanar_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "reserve_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "src_paypal_axanar_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "vw_donor_details"
            referencedColumns: ["donor_id"]
          },
          {
            foreignKeyName: "src_paypal_axanar_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "vw_donors_with_addresses"
            referencedColumns: ["donor_id"]
          },
        ]
      }
      src_paypal_prelude: {
        Row: {
          amount: string | null
          created_at: string | null
          donor_id: string | null
          donor_name: string | null
          email: string | null
          id: string
          imported: boolean | null
          legacy_id: number | null
          notes: string | null
          status: string | null
          transaction_date: string | null
          transaction_id: string | null
        }
        Insert: {
          amount?: string | null
          created_at?: string | null
          donor_id?: string | null
          donor_name?: string | null
          email?: string | null
          id?: string
          imported?: boolean | null
          legacy_id?: number | null
          notes?: string | null
          status?: string | null
          transaction_date?: string | null
          transaction_id?: string | null
        }
        Update: {
          amount?: string | null
          created_at?: string | null
          donor_id?: string | null
          donor_name?: string | null
          email?: string | null
          id?: string
          imported?: boolean | null
          legacy_id?: number | null
          notes?: string | null
          status?: string | null
          transaction_date?: string | null
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "src_paypal_prelude_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "contributor_leaderboard"
            referencedColumns: ["donor_id"]
          },
          {
            foreignKeyName: "src_paypal_prelude_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "donor_pledge_totals"
            referencedColumns: ["donor_id"]
          },
          {
            foreignKeyName: "src_paypal_prelude_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "donors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "src_paypal_prelude_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "my_donor_profile"
            referencedColumns: ["donor_id"]
          },
          {
            foreignKeyName: "src_paypal_prelude_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "reserve_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "src_paypal_prelude_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "vw_donor_details"
            referencedColumns: ["donor_id"]
          },
          {
            foreignKeyName: "src_paypal_prelude_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "vw_donors_with_addresses"
            referencedColumns: ["donor_id"]
          },
        ]
      }
      src_secret_perks: {
        Row: {
          amount: string | null
          created_at: string | null
          donor_id: string | null
          donor_name: string | null
          email: string | null
          id: string
          imported: boolean | null
          legacy_id: number | null
          notes: string | null
          perk_description: string | null
          transaction_date: string | null
        }
        Insert: {
          amount?: string | null
          created_at?: string | null
          donor_id?: string | null
          donor_name?: string | null
          email?: string | null
          id?: string
          imported?: boolean | null
          legacy_id?: number | null
          notes?: string | null
          perk_description?: string | null
          transaction_date?: string | null
        }
        Update: {
          amount?: string | null
          created_at?: string | null
          donor_id?: string | null
          donor_name?: string | null
          email?: string | null
          id?: string
          imported?: boolean | null
          legacy_id?: number | null
          notes?: string | null
          perk_description?: string | null
          transaction_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "src_secret_perks_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "contributor_leaderboard"
            referencedColumns: ["donor_id"]
          },
          {
            foreignKeyName: "src_secret_perks_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "donor_pledge_totals"
            referencedColumns: ["donor_id"]
          },
          {
            foreignKeyName: "src_secret_perks_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "donors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "src_secret_perks_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "my_donor_profile"
            referencedColumns: ["donor_id"]
          },
          {
            foreignKeyName: "src_secret_perks_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "reserve_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "src_secret_perks_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "vw_donor_details"
            referencedColumns: ["donor_id"]
          },
          {
            foreignKeyName: "src_secret_perks_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "vw_donors_with_addresses"
            referencedColumns: ["donor_id"]
          },
        ]
      }
      staging_axanar_kickstarter: {
        Row: {
          amount: number | null
          created_at: string | null
          display_name: string | null
          email: string | null
          id: number
          pledge_date: string | null
          raw_line: Json | null
          reward_name: string | null
          source: string | null
          status: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          id?: number
          pledge_date?: string | null
          raw_line?: Json | null
          reward_name?: string | null
          source?: string | null
          status?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          id?: number
          pledge_date?: string | null
          raw_line?: Json | null
          reward_name?: string | null
          source?: string | null
          status?: string | null
        }
        Relationships: []
      }
      staging_axanar_paypal: {
        Row: {
          amount: number | null
          created_at: string | null
          email: string | null
          first_name: string | null
          id: number
          idx: number | null
          last_name: string | null
          note: string | null
          raw_line: Json | null
          source: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: number
          idx?: number | null
          last_name?: string | null
          note?: string | null
          raw_line?: Json | null
          source?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: number
          idx?: number | null
          last_name?: string | null
          note?: string | null
          raw_line?: Json | null
          source?: string | null
        }
        Relationships: []
      }
      staging_indiegogo: {
        Row: {
          amount: number | null
          created_at: string | null
          display_name: string | null
          email: string | null
          id: number
          order_id: string | null
          order_status: string | null
          perk_name: string | null
          pledge_date: string | null
          raw_line: Json | null
          source: string | null
          transaction_id: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          id?: number
          order_id?: string | null
          order_status?: string | null
          perk_name?: string | null
          pledge_date?: string | null
          raw_line?: Json | null
          source?: string | null
          transaction_id?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          id?: number
          order_id?: string | null
          order_status?: string | null
          perk_name?: string | null
          pledge_date?: string | null
          raw_line?: Json | null
          source?: string | null
          transaction_id?: string | null
        }
        Relationships: []
      }
      staging_prelude_kickstarter: {
        Row: {
          amount: number | null
          created_at: string | null
          display_name: string | null
          email: string | null
          id: number
          pledge_date: string | null
          raw_line: Json | null
          reward_name: string | null
          source: string | null
          status: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          id?: number
          pledge_date?: string | null
          raw_line?: Json | null
          reward_name?: string | null
          source?: string | null
          status?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          id?: number
          pledge_date?: string | null
          raw_line?: Json | null
          reward_name?: string | null
          source?: string | null
          status?: string | null
        }
        Relationships: []
      }
      staging_prelude_paypal: {
        Row: {
          amount: number | null
          created_at: string | null
          email: string | null
          first_name: string | null
          id: number
          idx: number | null
          last_name: string | null
          note: string | null
          pledge_date: string | null
          raw_line: Json | null
          reward_name: string | null
          source: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: number
          idx?: number | null
          last_name?: string | null
          note?: string | null
          pledge_date?: string | null
          raw_line?: Json | null
          reward_name?: string | null
          source?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: number
          idx?: number | null
          last_name?: string | null
          note?: string | null
          pledge_date?: string | null
          raw_line?: Json | null
          reward_name?: string | null
          source?: string | null
        }
        Relationships: []
      }
      staging_secret_perks: {
        Row: {
          created_at: string | null
          email: string | null
          first_name: string | null
          full_name: string | null
          id: number
          last_name: string | null
          perk_label: string | null
          raw_line: Json | null
          source: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          full_name?: string | null
          id?: number
          last_name?: string | null
          perk_label?: string | null
          raw_line?: Json | null
          source?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          full_name?: string | null
          id?: number
          last_name?: string | null
          perk_label?: string | null
          raw_line?: Json | null
          source?: string | null
        }
        Relationships: []
      }
      tactical_events: {
        Row: {
          created_at: string
          data: Json | null
          event_type: string
          game_id: string
          id: string
          position: Json | null
          source_ship_id: string | null
          target_ship_id: string | null
          turn: number
        }
        Insert: {
          created_at?: string
          data?: Json | null
          event_type: string
          game_id: string
          id?: string
          position?: Json | null
          source_ship_id?: string | null
          target_ship_id?: string | null
          turn: number
        }
        Update: {
          created_at?: string
          data?: Json | null
          event_type?: string
          game_id?: string
          id?: string
          position?: Json | null
          source_ship_id?: string | null
          target_ship_id?: string | null
          turn?: number
        }
        Relationships: [
          {
            foreignKeyName: "tactical_events_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "tactical_games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tactical_events_source_ship_id_fkey"
            columns: ["source_ship_id"]
            isOneToOne: false
            referencedRelation: "tactical_ships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tactical_events_target_ship_id_fkey"
            columns: ["target_ship_id"]
            isOneToOne: false
            referencedRelation: "tactical_ships"
            referencedColumns: ["id"]
          },
        ]
      }
      tactical_games: {
        Row: {
          created_at: string
          current_turn: number
          forum_thread_id: string | null
          gm_user_id: string | null
          id: string
          is_locked: boolean
          map_size_x: number
          map_size_y: number
          phase: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_turn?: number
          forum_thread_id?: string | null
          gm_user_id?: string | null
          id?: string
          is_locked?: boolean
          map_size_x?: number
          map_size_y?: number
          phase?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_turn?: number
          forum_thread_id?: string | null
          gm_user_id?: string | null
          id?: string
          is_locked?: boolean
          map_size_x?: number
          map_size_y?: number
          phase?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tactical_games_forum_thread_id_fkey"
            columns: ["forum_thread_id"]
            isOneToOne: false
            referencedRelation: "forum_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      tactical_moves: {
        Row: {
          actions: Json
          dice_roll_url: string | null
          game_id: string
          id: string
          player_user_id: string | null
          resolved_at: string | null
          ship_id: string
          status: string
          submitted_at: string
          turn: number
        }
        Insert: {
          actions?: Json
          dice_roll_url?: string | null
          game_id: string
          id?: string
          player_user_id?: string | null
          resolved_at?: string | null
          ship_id: string
          status?: string
          submitted_at?: string
          turn: number
        }
        Update: {
          actions?: Json
          dice_roll_url?: string | null
          game_id?: string
          id?: string
          player_user_id?: string | null
          resolved_at?: string | null
          ship_id?: string
          status?: string
          submitted_at?: string
          turn?: number
        }
        Relationships: [
          {
            foreignKeyName: "tactical_moves_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "tactical_games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tactical_moves_ship_id_fkey"
            columns: ["ship_id"]
            isOneToOne: false
            referencedRelation: "tactical_ships"
            referencedColumns: ["id"]
          },
        ]
      }
      tactical_objectives: {
        Row: {
          controlled_by: string | null
          created_at: string | null
          game_id: string
          id: string
          metadata: Json | null
          name: string
          points_per_turn: number | null
          position_x: number
          position_y: number
          radius: number | null
          status: string | null
          type: string
          updated_at: string | null
          victory_points: number | null
        }
        Insert: {
          controlled_by?: string | null
          created_at?: string | null
          game_id: string
          id?: string
          metadata?: Json | null
          name: string
          points_per_turn?: number | null
          position_x: number
          position_y: number
          radius?: number | null
          status?: string | null
          type: string
          updated_at?: string | null
          victory_points?: number | null
        }
        Update: {
          controlled_by?: string | null
          created_at?: string | null
          game_id?: string
          id?: string
          metadata?: Json | null
          name?: string
          points_per_turn?: number | null
          position_x?: number
          position_y?: number
          radius?: number | null
          status?: string | null
          type?: string
          updated_at?: string | null
          victory_points?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tactical_objectives_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "tactical_games"
            referencedColumns: ["id"]
          },
        ]
      }
      tactical_ships: {
        Row: {
          ai_behavior: Json | null
          ai_difficulty: string | null
          captain_user_id: string | null
          class: string
          created_at: string
          facing: number
          game_id: string
          hull: number
          id: string
          max_hull: number
          max_shields: number
          name: string
          position_x: number
          position_y: number
          shields: number
          speed: number
          sprite_url: string | null
          stats: Json | null
          status: string
          team: string
          updated_at: string
        }
        Insert: {
          ai_behavior?: Json | null
          ai_difficulty?: string | null
          captain_user_id?: string | null
          class: string
          created_at?: string
          facing?: number
          game_id: string
          hull: number
          id?: string
          max_hull: number
          max_shields: number
          name: string
          position_x: number
          position_y: number
          shields?: number
          speed?: number
          sprite_url?: string | null
          stats?: Json | null
          status?: string
          team: string
          updated_at?: string
        }
        Update: {
          ai_behavior?: Json | null
          ai_difficulty?: string | null
          captain_user_id?: string | null
          class?: string
          created_at?: string
          facing?: number
          game_id?: string
          hull?: number
          id?: string
          max_hull?: number
          max_shields?: number
          name?: string
          position_x?: number
          position_y?: number
          shields?: number
          speed?: number
          sprite_url?: string | null
          stats?: Json | null
          status?: string
          team?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tactical_ships_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "tactical_games"
            referencedColumns: ["id"]
          },
        ]
      }
      temp_user_mappings: {
        Row: {
          email: string | null
          first_name: string | null
          last_name: string | null
          legacy_id: number | null
        }
        Insert: {
          email?: string | null
          first_name?: string | null
          last_name?: string | null
          legacy_id?: number | null
        }
        Update: {
          email?: string | null
          first_name?: string | null
          last_name?: string | null
          legacy_id?: number | null
        }
        Relationships: []
      }
      title_benefits: {
        Row: {
          benefit_type: string
          benefit_value: Json
          created_at: string | null
          description: string | null
          id: string
          title_id: string | null
        }
        Insert: {
          benefit_type: string
          benefit_value: Json
          created_at?: string | null
          description?: string | null
          id?: string
          title_id?: string | null
        }
        Update: {
          benefit_type?: string
          benefit_value?: Json
          created_at?: string | null
          description?: string | null
          id?: string
          title_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "title_benefits_title_id_fkey"
            columns: ["title_id"]
            isOneToOne: false
            referencedRelation: "ambassadorial_titles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_data: Json | null
          achievement_type: string
          earned_at: string | null
          id: string
          is_visible: boolean | null
          user_id: string
        }
        Insert: {
          achievement_data?: Json | null
          achievement_type: string
          earned_at?: string | null
          id?: string
          is_visible?: boolean | null
          user_id: string
        }
        Update: {
          achievement_data?: Json | null
          achievement_type?: string
          earned_at?: string | null
          id?: string
          is_visible?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      user_activity_metrics: {
        Row: {
          created_at: string | null
          current_streak_days: number | null
          days_active_current_week: number | null
          last_calculated_at: string | null
          last_login_date: string | null
          login_count_30d: number | null
          login_count_7d: number | null
          longest_streak_days: number | null
          pulse_score: number | null
          recent_comments_7d: number | null
          recent_threads_7d: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_streak_days?: number | null
          days_active_current_week?: number | null
          last_calculated_at?: string | null
          last_login_date?: string | null
          login_count_30d?: number | null
          login_count_7d?: number | null
          longest_streak_days?: number | null
          pulse_score?: number | null
          recent_comments_7d?: number | null
          recent_threads_7d?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_streak_days?: number | null
          days_active_current_week?: number | null
          last_calculated_at?: string | null
          last_login_date?: string | null
          login_count_30d?: number | null
          login_count_7d?: number | null
          longest_streak_days?: number | null
          pulse_score?: number | null
          recent_comments_7d?: number | null
          recent_threads_7d?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_ambassadorial_titles: {
        Row: {
          awarded_at: string | null
          is_displayed: boolean | null
          is_primary: boolean | null
          source: string | null
          source_pledge_id: string | null
          title_id: string
          user_id: string
        }
        Insert: {
          awarded_at?: string | null
          is_displayed?: boolean | null
          is_primary?: boolean | null
          source?: string | null
          source_pledge_id?: string | null
          title_id: string
          user_id: string
        }
        Update: {
          awarded_at?: string | null
          is_displayed?: boolean | null
          is_primary?: boolean | null
          source?: string | null
          source_pledge_id?: string | null
          title_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_ambassadorial_titles_source_pledge_id_fkey"
            columns: ["source_pledge_id"]
            isOneToOne: false
            referencedRelation: "my_pledge_history"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_ambassadorial_titles_source_pledge_id_fkey"
            columns: ["source_pledge_id"]
            isOneToOne: false
            referencedRelation: "pledges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_ambassadorial_titles_title_id_fkey"
            columns: ["title_id"]
            isOneToOne: false
            referencedRelation: "ambassadorial_titles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_presence: {
        Row: {
          created_at: string | null
          id: string
          is_online: boolean | null
          last_seen: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_online?: boolean | null
          last_seen?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_online?: boolean | null
          last_seen?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_presence_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_recruits: {
        Row: {
          id: string
          recruited_at: string | null
          recruited_user_id: string
          recruiter_id: string
          recruitment_code: string | null
          status: string | null
        }
        Insert: {
          id?: string
          recruited_at?: string | null
          recruited_user_id: string
          recruiter_id: string
          recruitment_code?: string | null
          status?: string | null
        }
        Update: {
          id?: string
          recruited_at?: string | null
          recruited_user_id?: string
          recruiter_id?: string
          recruitment_code?: string | null
          status?: string | null
        }
        Relationships: []
      }
      wrappers_fdw_stats: {
        Row: {
          bytes_in: number | null
          bytes_out: number | null
          create_times: number | null
          created_at: string
          fdw_name: string
          metadata: Json | null
          rows_in: number | null
          rows_out: number | null
          updated_at: string
        }
        Insert: {
          bytes_in?: number | null
          bytes_out?: number | null
          create_times?: number | null
          created_at?: string
          fdw_name: string
          metadata?: Json | null
          rows_in?: number | null
          rows_out?: number | null
          updated_at?: string
        }
        Update: {
          bytes_in?: number | null
          bytes_out?: number | null
          create_times?: number | null
          created_at?: string
          fdw_name?: string
          metadata?: Json | null
          rows_in?: number | null
          rows_out?: number | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      campaign_analytics: {
        Row: {
          active: boolean | null
          campaign_id: string | null
          end_date: string | null
          goal_amount: number | null
          name: string | null
          progress_percentage: number | null
          start_date: string | null
          status: string | null
          total_pledges: number | null
          total_raised: number | null
          unique_donors: number | null
        }
        Relationships: []
      }
      campaign_totals: {
        Row: {
          active: boolean | null
          backers_count: number | null
          campaign_id: string | null
          campaign_name: string | null
          end_date: string | null
          goal_amount: number | null
          provider: string | null
          start_date: string | null
          total_amount: number | null
          total_pledges: number | null
        }
        Relationships: []
      }
      contributor_leaderboard: {
        Row: {
          achievement_count: number | null
          activity_score: number | null
          avatar_url: string | null
          campaigns_supported: number | null
          donor_id: string | null
          donor_name: string | null
          email: string | null
          first_contribution_date: string | null
          first_name: string | null
          full_name: string | null
          is_account_linked: boolean | null
          last_contribution_date: string | null
          last_name: string | null
          profile_completeness_score: number | null
          proposed_ares: number | null
          recruitment_xp: number | null
          recruits_confirmed: number | null
          total_contributions: number | null
          total_donated: number | null
          years_supporting: number | null
        }
        Relationships: []
      }
      donor_pledge_totals: {
        Row: {
          avatar_url: string | null
          campaigns_supported: number | null
          donor_id: string | null
          donor_name: string | null
          email: string | null
          first_name: string | null
          first_pledge_date: string | null
          full_name: string | null
          last_name: string | null
          last_pledge_date: string | null
          pledge_count: number | null
          total_donated: number | null
          years_supporting: number | null
        }
        Relationships: []
      }
      my_addresses: {
        Row: {
          address1: string | null
          address2: string | null
          city: string | null
          country: string | null
          created_at: string | null
          donor_id: string | null
          id: string | null
          is_primary: boolean | null
          phone: string | null
          postal_code: string | null
          state: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "addresses_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "contributor_leaderboard"
            referencedColumns: ["donor_id"]
          },
          {
            foreignKeyName: "addresses_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "donor_pledge_totals"
            referencedColumns: ["donor_id"]
          },
          {
            foreignKeyName: "addresses_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "donors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "addresses_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "my_donor_profile"
            referencedColumns: ["donor_id"]
          },
          {
            foreignKeyName: "addresses_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "reserve_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "addresses_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "vw_donor_details"
            referencedColumns: ["donor_id"]
          },
          {
            foreignKeyName: "addresses_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "vw_donors_with_addresses"
            referencedColumns: ["donor_id"]
          },
        ]
      }
      my_donor_profile: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          donor_id: string | null
          donor_name: string | null
          first_name: string | null
          full_name: string | null
          last_name: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          donor_id?: string | null
          donor_name?: string | null
          first_name?: string | null
          full_name?: string | null
          last_name?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          donor_id?: string | null
          donor_name?: string | null
          first_name?: string | null
          full_name?: string | null
          last_name?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      my_pledge_history: {
        Row: {
          amount: number | null
          campaign_id: string | null
          campaign_name: string | null
          created_at: string | null
          id: string | null
          reward_id: string | null
          reward_name: string | null
          status: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pledges_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaign_analytics"
            referencedColumns: ["campaign_id"]
          },
          {
            foreignKeyName: "pledges_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaign_totals"
            referencedColumns: ["campaign_id"]
          },
          {
            foreignKeyName: "pledges_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pledges_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "rewards"
            referencedColumns: ["id"]
          },
        ]
      }
      orphaned_data_analysis_report: {
        Row: {
          donors_with_duplicate_legacy_ids_count: number | null
          generated_at: string | null
          orphaned_donors_no_email_count: number | null
          problematic_donor_emails_count: number | null
          report_name: string | null
        }
        Relationships: []
      }
      reserve_users: {
        Row: {
          created_at: string | null
          display_name: string | null
          email: string | null
          email_permission_status: string | null
          email_status: string | null
          first_name: string | null
          id: string | null
          last_name: string | null
          notes: string | null
          source: string | null
          source_name: string | null
          source_platform: string | null
          updated_at: string | null
          user_type: string | null
        }
        Relationships: []
      }
      vw_donor_details: {
        Row: {
          auth_user_id: string | null
          avatar_url: string | null
          bio: string | null
          donor_created_at: string | null
          donor_email: string | null
          donor_id: string | null
          donor_name: string | null
          donor_tier: string | null
          donor_updated_at: string | null
          email_permission_status: string | null
          email_status: string | null
          first_name: string | null
          full_name: string | null
          last_name: string | null
          legacy_id: number | null
          notes: string | null
          source_name: string | null
          source_platform: string | null
          username: string | null
        }
        Insert: {
          auth_user_id?: string | null
          avatar_url?: string | null
          bio?: string | null
          donor_created_at?: string | null
          donor_email?: string | null
          donor_id?: string | null
          donor_name?: string | null
          donor_tier?: string | null
          donor_updated_at?: string | null
          email_permission_status?: string | null
          email_status?: string | null
          first_name?: string | null
          full_name?: string | null
          last_name?: string | null
          legacy_id?: number | null
          notes?: string | null
          source_name?: string | null
          source_platform?: string | null
          username?: string | null
        }
        Update: {
          auth_user_id?: string | null
          avatar_url?: string | null
          bio?: string | null
          donor_created_at?: string | null
          donor_email?: string | null
          donor_id?: string | null
          donor_name?: string | null
          donor_tier?: string | null
          donor_updated_at?: string | null
          email_permission_status?: string | null
          email_status?: string | null
          first_name?: string | null
          full_name?: string | null
          last_name?: string | null
          legacy_id?: number | null
          notes?: string | null
          source_name?: string | null
          source_platform?: string | null
          username?: string | null
        }
        Relationships: []
      }
      vw_donors_with_addresses: {
        Row: {
          address_created_at: string | null
          address_id: string | null
          address_updated_at: string | null
          address1: string | null
          address2: string | null
          city: string | null
          country: string | null
          donor_email: string | null
          donor_full_name: string | null
          donor_id: string | null
          is_primary: boolean | null
          phone: string | null
          postal_code: string | null
          state: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_admin_by_email: { Args: { admin_email: string }; Returns: undefined }
      add_admin_user: {
        Args: {
          make_content_manager?: boolean
          make_super_admin?: boolean
          target_email: string
        }
        Returns: undefined
      }
      add_auth_user_id_column: { Args: never; Returns: undefined }
      admin_link_donor_account: {
        Args: { donor_email_to_link: string; target_auth_user_id: string }
        Returns: {
          auth_user_id: string
          donor_id: string
          email: string
          message: string
        }[]
      }
      airtable_fdw_handler: { Args: never; Returns: unknown }
      airtable_fdw_meta: {
        Args: never
        Returns: {
          author: string
          name: string
          version: string
          website: string
        }[]
      }
      airtable_fdw_validator: {
        Args: { catalog: unknown; options: string[] }
        Returns: undefined
      }
      auth0_fdw_handler: { Args: never; Returns: unknown }
      auth0_fdw_meta: {
        Args: never
        Returns: {
          author: string
          name: string
          version: string
          website: string
        }[]
      }
      auth0_fdw_validator: {
        Args: { catalog: unknown; options: string[] }
        Returns: undefined
      }
      ban_user: { Args: { target_user_id: string }; Returns: boolean }
      big_query_fdw_handler: { Args: never; Returns: unknown }
      big_query_fdw_meta: {
        Args: never
        Returns: {
          author: string
          name: string
          version: string
          website: string
        }[]
      }
      big_query_fdw_validator: {
        Args: { catalog: unknown; options: string[] }
        Returns: undefined
      }
      bytea_to_text: { Args: { data: string }; Returns: string }
      calculate_ambassadorial_titles: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      calculate_donation_achievements: {
        Args: { user_uuid: string }
        Returns: undefined
      }
      calculate_pulse_score_v1: {
        Args: {
          p_comment_count: number
          p_is_online: boolean
          p_last_seen: string
          p_thread_count: number
          p_unified_xp: number
          p_user_id: string
        }
        Returns: {
          pulse_score: number
          tier: string
        }[]
      }
      calculate_unified_xp: { Args: { user_uuid: string }; Returns: undefined }
      check_current_user_is_admin: { Args: never; Returns: boolean }
      check_current_user_is_super_admin: { Args: never; Returns: boolean }
      check_email_exists: {
        Args: { check_email: string }
        Returns: {
          auth_id: string
          donor_id: string
          exists_in_auth: boolean
          exists_in_donors: boolean
          is_linked: boolean
        }[]
      }
      check_email_in_system: {
        Args: { check_email: string }
        Returns: {
          auth_user_id: string
          donor_id: string
          exists_in_auth: boolean
          exists_in_donors: boolean
          has_auth_link: boolean
          suggested_providers: string[]
        }[]
      }
      check_password_reset_rate_limit: {
        Args: { client_ip?: string; user_email: string }
        Returns: {
          allowed: boolean
          remaining_attempts: number
          reset_time: string
        }[]
      }
      check_recovery_token_validity: {
        Args: { token: string; user_email: string }
        Returns: {
          attempt_type: string
          is_valid: boolean
          message: string
        }[]
      }
      check_user_is_admin: { Args: { user_id: string }; Returns: boolean }
      check_user_is_super_admin: { Args: { user_id: string }; Returns: boolean }
      click_house_fdw_handler: { Args: never; Returns: unknown }
      click_house_fdw_meta: {
        Args: never
        Returns: {
          author: string
          name: string
          version: string
          website: string
        }[]
      }
      click_house_fdw_validator: {
        Args: { catalog: unknown; options: string[] }
        Returns: undefined
      }
      cognito_fdw_handler: { Args: never; Returns: unknown }
      cognito_fdw_meta: {
        Args: never
        Returns: {
          author: string
          name: string
          version: string
          website: string
        }[]
      }
      cognito_fdw_validator: {
        Args: { catalog: unknown; options: string[] }
        Returns: undefined
      }
      create_auth_users_for_all_donors: {
        Args: never
        Returns: {
          count: number
          details: string
          result_status: string
        }[]
      }
      create_auth_users_for_donors: {
        Args: never
        Returns: {
          count: number
          result_status: string
        }[]
      }
      create_legacy_user: {
        Args: {
          created_at: string
          email: string
          email_confirmed: boolean
          last_sign_in_at: string
          password_hash: string
          raw_app_meta_data: Json
          raw_user_meta_data: Json
          user_id: string
        }
        Returns: undefined
      }
      create_placeholder_profile: {
        Args: { target_username: string }
        Returns: {
          avatar_url: string
          display_name: string
          email: string
          source_type: string
          user_id: string
        }[]
      }
      csv_parse_line_plpgsql: { Args: { line: string }; Returns: string[] }
      duckdb_fdw_handler: { Args: never; Returns: unknown }
      duckdb_fdw_meta: {
        Args: never
        Returns: {
          author: string
          name: string
          version: string
          website: string
        }[]
      }
      duckdb_fdw_validator: {
        Args: { catalog: unknown; options: string[] }
        Returns: undefined
      }
      enhanced_admin_security_check: { Args: never; Returns: boolean }
      ensure_profile_usernames: { Args: never; Returns: undefined }
      extract_mentions: { Args: { text_content: string }; Returns: string[] }
      find_pledge_data_issues: {
        Args: { search_email: string }
        Returns: {
          campaign_name: string
          current_amount: number
          donor_email: string
          donor_id: string
          pledge_id: string
          source_amount: string
        }[]
      }
      firebase_fdw_handler: { Args: never; Returns: unknown }
      firebase_fdw_meta: {
        Args: never
        Returns: {
          author: string
          name: string
          version: string
          website: string
        }[]
      }
      firebase_fdw_validator: {
        Args: { catalog: unknown; options: string[] }
        Returns: undefined
      }
      forum_backfill_badges_from_rewards: { Args: never; Returns: undefined }
      forum_slugify: { Args: { src: string }; Returns: string }
      forum_sync_admin_ranks: { Args: never; Returns: undefined }
      generate_username_from_email: {
        Args: { email_input: string }
        Returns: string
      }
      get_active_title_buffs: { Args: { p_user_id: string }; Returns: Json }
      get_admin_analytics: { Args: never; Returns: Json }
      get_admin_profiles: {
        Args: never
        Returns: {
          full_name: string
          id: string
          username: string
        }[]
      }
      get_admin_users: {
        Args: never
        Returns: {
          created_at: string
          email: string
          is_content_manager: boolean
          is_super_admin: boolean
          updated_at: string
          user_id: string
        }[]
      }
      get_all_users: { Args: never; Returns: Json[] }
      get_auth_user_id_by_email: {
        Args: { user_email: string }
        Returns: string
      }
      get_campaign_analytics_paginated: {
        Args: {
          page_offset?: number
          page_size?: number
          search_term?: string
          sort_column?: string
          sort_direction?: string
        }
        Returns: Json
      }
      get_comprehensive_admin_analytics: { Args: never; Returns: Json }
      get_donor_analytics: {
        Args: {
          page_offset?: number
          page_size?: number
          search_term?: string
          sort_column?: string
          sort_direction?: string
        }
        Returns: Json
      }
      get_donor_auth_migration_status: {
        Args: never
        Returns: {
          linked_donors: number
          migration_progress: number
          total_donors: number
          unlinked_no_email: number
          unlinked_with_email: number
        }[]
      }
      get_forum_activity_leaderboard: {
        Args: { p_limit: string }
        Returns: {
          achievements: number
          activity_7d: number
          avatar_url: string
          comment_count: number
          donor_id: string
          donor_name: string
          full_name: string
          is_account_linked: boolean
          is_online: boolean
          last_seen: string
          metric_value: number
          profile_id: string
          profile_score: number
          proposed_ares: number
          pulse_score: number
          rank: number
          recruits: number
          streak_days: number
          thread_count: number
          tier: string
          total_donated: number
          unified_xp: number
          years_supporting: number
        }[]
      }
      get_leaderboard:
        | {
            Args: { p_category?: string; p_limit?: string; p_user_id?: string }
            Returns: {
              achievements: number
              avatar_url: string
              donor_id: string
              donor_name: string
              full_name: string
              is_account_linked: boolean
              is_online: boolean
              last_seen: string
              metric_value: number
              profile_id: string
              profile_score: number
              proposed_ares: number
              rank: number
              recruits: number
              total_donated: number
              unified_xp: number
              years_supporting: number
            }[]
          }
        | {
            Args: { category_type: string; limit_count?: number }
            Returns: {
              achievements: number
              avatar_url: string
              donor_id: string
              donor_name: string
              full_name: string
              is_account_linked: boolean
              metric_value: number
              profile_score: number
              proposed_ares: number
              rank: number
              recruits: number
              total_donated: number
              years_supporting: number
            }[]
          }
      get_online_activity_leaderboard: {
        Args: { p_limit: string }
        Returns: {
          achievements: number
          activity_7d: number
          avatar_url: string
          comment_count: number
          donor_id: string
          donor_name: string
          full_name: string
          is_account_linked: boolean
          is_online: boolean
          last_seen: string
          metric_value: number
          profile_id: string
          profile_score: number
          proposed_ares: number
          pulse_score: number
          rank: number
          recruits: number
          streak_days: number
          thread_count: number
          tier: string
          total_donated: number
          unified_xp: number
          years_supporting: number
        }[]
      }
      get_recently_active_users: {
        Args: { days_limit?: number }
        Returns: {
          full_name: string
          id: string
          last_sign_in_at: string
          username: string
        }[]
      }
      get_reserve_users: {
        Args: {
          page_offset?: number
          page_size?: number
          search_term?: string
          sort_column?: string
          sort_direction?: string
        }
        Returns: Json
      }
      get_total_raised: { Args: never; Returns: number }
      get_user_by_username: {
        Args: { lookup_username: string }
        Returns: {
          avatar_url: string
          background_url: string
          bio: string
          created_at: string
          display_name: string
          email: string
          full_name: string
          show_avatar_publicly: boolean
          show_background_publicly: boolean
          show_real_name_publicly: boolean
          source_type: string
          user_id: string
          username: string
        }[]
      }
      get_user_leaderboard_position: {
        Args: { p_category?: string; p_user_id: string }
        Returns: {
          metric_value: number
          percentile: number
          total_contributors: number
          unified_xp: number
          user_rank: number
        }[]
      }
      get_verified_donor_counts: {
        Args: never
        Returns: {
          authenticated_donors: number
          total_active_donors: number
        }[]
      }
      hello_world_fdw_handler: { Args: never; Returns: unknown }
      hello_world_fdw_meta: {
        Args: never
        Returns: {
          author: string
          name: string
          version: string
          website: string
        }[]
      }
      hello_world_fdw_validator: {
        Args: { catalog: unknown; options: string[] }
        Returns: undefined
      }
      http: {
        Args: { request: Database["public"]["CompositeTypes"]["http_request"] }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
        SetofOptions: {
          from: "http_request"
          to: "http_response"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      http_delete:
        | {
            Args: { uri: string }
            Returns: Database["public"]["CompositeTypes"]["http_response"]
            SetofOptions: {
              from: "*"
              to: "http_response"
              isOneToOne: true
              isSetofReturn: false
            }
          }
        | {
            Args: { content: string; content_type: string; uri: string }
            Returns: Database["public"]["CompositeTypes"]["http_response"]
            SetofOptions: {
              from: "*"
              to: "http_response"
              isOneToOne: true
              isSetofReturn: false
            }
          }
      http_get:
        | {
            Args: { uri: string }
            Returns: Database["public"]["CompositeTypes"]["http_response"]
            SetofOptions: {
              from: "*"
              to: "http_response"
              isOneToOne: true
              isSetofReturn: false
            }
          }
        | {
            Args: { data: Json; uri: string }
            Returns: Database["public"]["CompositeTypes"]["http_response"]
            SetofOptions: {
              from: "*"
              to: "http_response"
              isOneToOne: true
              isSetofReturn: false
            }
          }
      http_head: {
        Args: { uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
        SetofOptions: {
          from: "*"
          to: "http_response"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      http_header: {
        Args: { field: string; value: string }
        Returns: Database["public"]["CompositeTypes"]["http_header"]
        SetofOptions: {
          from: "*"
          to: "http_header"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      http_list_curlopt: {
        Args: never
        Returns: {
          curlopt: string
          value: string
        }[]
      }
      http_patch: {
        Args: { content: string; content_type: string; uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
        SetofOptions: {
          from: "*"
          to: "http_response"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      http_post:
        | {
            Args: { content: string; content_type: string; uri: string }
            Returns: Database["public"]["CompositeTypes"]["http_response"]
            SetofOptions: {
              from: "*"
              to: "http_response"
              isOneToOne: true
              isSetofReturn: false
            }
          }
        | {
            Args: { data: Json; uri: string }
            Returns: Database["public"]["CompositeTypes"]["http_response"]
            SetofOptions: {
              from: "*"
              to: "http_response"
              isOneToOne: true
              isSetofReturn: false
            }
          }
      http_put: {
        Args: { content: string; content_type: string; uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
        SetofOptions: {
          from: "*"
          to: "http_response"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      http_reset_curlopt: { Args: never; Returns: boolean }
      http_set_curlopt: {
        Args: { curlopt: string; value: string }
        Returns: boolean
      }
      iceberg_fdw_handler: { Args: never; Returns: unknown }
      iceberg_fdw_meta: {
        Args: never
        Returns: {
          author: string
          name: string
          version: string
          website: string
        }[]
      }
      iceberg_fdw_validator: {
        Args: { catalog: unknown; options: string[] }
        Returns: undefined
      }
      initiate_account_recovery: {
        Args: { recovery_type: string; user_email: string }
        Returns: {
          expires_at: string
          message: string
          recovery_token: string
          success: boolean
        }[]
      }
      is_admin: { Args: { check_user_id: string }; Returns: boolean }
      is_message_to_admin: {
        Args: { recipient_user_id: string }
        Returns: boolean
      }
      is_super_admin: { Args: never; Returns: boolean }
      link_donor_to_auth_user: {
        Args: { donor_email: string }
        Returns: string
      }
      link_donors_to_auth_users: {
        Args: never
        Returns: {
          count: number
          result_status: string
        }[]
      }
      load_staging_axanar_kickstarter_from_url: {
        Args: { row_limit: number; url: string }
        Returns: number
      }
      load_staging_axanar_paypal_from_url: {
        Args: { row_limit: number; url: string }
        Returns: number
      }
      load_staging_indiegogo_from_url: {
        Args: { row_limit: number; url: string }
        Returns: number
      }
      load_staging_prelude_kickstarter_from_url: {
        Args: { row_limit: number; url: string }
        Returns: number
      }
      load_staging_prelude_paypal_from_url: {
        Args: { row_limit: number; url: string }
        Returns: number
      }
      load_staging_secret_perks_from_url: {
        Args: { row_limit: number; url: string }
        Returns: number
      }
      log_admin_action: {
        Args: { action_type: string; details?: Json; target_user_id: string }
        Returns: undefined
      }
      log_admin_action_enhanced: {
        Args: {
          action_type: string
          client_ip?: string
          client_user_agent?: string
          new_values?: Json
          old_values?: Json
          target_id?: string
          target_table?: string
        }
        Returns: undefined
      }
      logflare_fdw_handler: { Args: never; Returns: unknown }
      logflare_fdw_meta: {
        Args: never
        Returns: {
          author: string
          name: string
          version: string
          website: string
        }[]
      }
      logflare_fdw_validator: {
        Args: { catalog: unknown; options: string[] }
        Returns: undefined
      }
      merge_legacy_donor_data: {
        Args: never
        Returns: {
          action: string
          count: number
        }[]
      }
      mssql_fdw_handler: { Args: never; Returns: unknown }
      mssql_fdw_meta: {
        Args: never
        Returns: {
          author: string
          name: string
          version: string
          website: string
        }[]
      }
      mssql_fdw_validator: {
        Args: { catalog: unknown; options: string[] }
        Returns: undefined
      }
      redis_fdw_handler: { Args: never; Returns: unknown }
      redis_fdw_meta: {
        Args: never
        Returns: {
          author: string
          name: string
          version: string
          website: string
        }[]
      }
      redis_fdw_validator: {
        Args: { catalog: unknown; options: string[] }
        Returns: undefined
      }
      remove_admin_user: {
        Args: { target_user_id: string }
        Returns: undefined
      }
      s3_fdw_handler: { Args: never; Returns: unknown }
      s3_fdw_meta: {
        Args: never
        Returns: {
          author: string
          name: string
          version: string
          website: string
        }[]
      }
      s3_fdw_validator: {
        Args: { catalog: unknown; options: string[] }
        Returns: undefined
      }
      sanitize_text_input: { Args: { input_text: string }; Returns: string }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      stripe_fdw_handler: { Args: never; Returns: unknown }
      stripe_fdw_meta: {
        Args: never
        Returns: {
          author: string
          name: string
          version: string
          website: string
        }[]
      }
      stripe_fdw_validator: {
        Args: { catalog: unknown; options: string[] }
        Returns: undefined
      }
      text_to_bytea: { Args: { data: string }; Returns: string }
      unban_user: { Args: { target_user_id: string }; Returns: boolean }
      update_admin_user: {
        Args: {
          make_content_manager: boolean
          make_super_admin: boolean
          target_user_id: string
        }
        Returns: undefined
      }
      update_user_presence: {
        Args: { is_online_status: boolean }
        Returns: undefined
      }
      urlencode:
        | { Args: { data: Json }; Returns: string }
        | {
            Args: { string: string }
            Returns: {
              error: true
            } & "Could not choose the best candidate function between: public.urlencode(string => bytea), public.urlencode(string => varchar). Try renaming the parameters or the function itself in the database so function overloading can be resolved"
          }
        | {
            Args: { string: string }
            Returns: {
              error: true
            } & "Could not choose the best candidate function between: public.urlencode(string => bytea), public.urlencode(string => varchar). Try renaming the parameters or the function itself in the database so function overloading can be resolved"
          }
      validate_email_secure: { Args: { email_input: string }; Returns: boolean }
      validate_recovery_token: {
        Args: { token: string; user_email: string }
        Returns: {
          attempt_type: string
          is_valid: boolean
          message: string
        }[]
      }
      validate_recovery_token_secure: {
        Args: { token: string; user_email: string }
        Returns: {
          attempt_type: string
          is_valid: boolean
          message: string
        }[]
      }
      wasm_fdw_handler: { Args: never; Returns: unknown }
      wasm_fdw_meta: {
        Args: never
        Returns: {
          author: string
          name: string
          version: string
          website: string
        }[]
      }
      wasm_fdw_validator: {
        Args: { catalog: unknown; options: string[] }
        Returns: undefined
      }
    }
    Enums: {
      forum_category:
        | "announcements"
        | "general"
        | "production-updates"
        | "fan-content"
        | "support"
        | "off-topic"
    }
    CompositeTypes: {
      http_header: {
        field: string | null
        value: string | null
      }
      http_request: {
        method: unknown
        uri: string | null
        headers: Database["public"]["CompositeTypes"]["http_header"][] | null
        content_type: string | null
        content: string | null
      }
      http_response: {
        status: number | null
        content_type: string | null
        headers: Database["public"]["CompositeTypes"]["http_header"][] | null
        content: string | null
      }
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      forum_category: [
        "announcements",
        "general",
        "production-updates",
        "fan-content",
        "support",
        "off-topic",
      ],
    },
  },
} as const
