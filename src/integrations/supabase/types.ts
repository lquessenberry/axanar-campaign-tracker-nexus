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
          ip_address: unknown | null
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
          ip_address?: unknown | null
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
          ip_address?: unknown | null
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
          content: string
          created_at: string | null
          id: number
          is_read: boolean | null
          recipient_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: number
          is_read?: boolean | null
          recipient_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: number
          is_read?: boolean | null
          recipient_id?: string
          sender_id?: string
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
      password_reset_security_log: {
        Row: {
          attempt_count: number | null
          blocked_until: string | null
          created_at: string | null
          email: string
          id: string
          ip_address: unknown | null
          last_attempt: string | null
          user_agent: string | null
        }
        Insert: {
          attempt_count?: number | null
          blocked_until?: string | null
          created_at?: string | null
          email: string
          id?: string
          ip_address?: unknown | null
          last_attempt?: string | null
          user_agent?: string | null
        }
        Update: {
          attempt_count?: number | null
          blocked_until?: string | null
          created_at?: string | null
          email?: string
          id?: string
          ip_address?: unknown | null
          last_attempt?: string | null
          user_agent?: string | null
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
          created_at: string | null
          donor_id: string | null
          id: string
          legacy_id: number | null
          reward_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          campaign_id?: string | null
          created_at?: string | null
          donor_id?: string | null
          id?: string
          legacy_id?: number | null
          reward_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          campaign_id?: string | null
          created_at?: string | null
          donor_id?: string | null
          id?: string
          legacy_id?: number | null
          reward_id?: string | null
          status?: string | null
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
          avatar_url: string | null
          background_url: string | null
          bio: string | null
          created_at: string
          full_name: string | null
          id: string
          is_admin: boolean | null
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          background_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          is_admin?: boolean | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          background_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          is_admin?: boolean | null
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
          id: string
          legacy_id: number | null
          minimum_amount: number | null
          name: string | null
          updated_at: string | null
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          legacy_id?: number | null
          minimum_amount?: number | null
          name?: string | null
          updated_at?: string | null
        }
        Update: {
          campaign_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          legacy_id?: number | null
          minimum_amount?: number | null
          name?: string | null
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
      users: {
        Row: {
          created_at: string | null
          email: string | null
          id: number
          is_admin: boolean | null
          is_banned: boolean | null
          is_verified: boolean | null
          name: string | null
          password: string | null
          permissions: Json | null
          remember_token: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id: number
          is_admin?: boolean | null
          is_banned?: boolean | null
          is_verified?: boolean | null
          name?: string | null
          password?: string | null
          permissions?: Json | null
          remember_token?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: number
          is_admin?: boolean | null
          is_banned?: boolean | null
          is_verified?: boolean | null
          name?: string | null
          password?: string | null
          permissions?: Json | null
          remember_token?: string | null
          updated_at?: string | null
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
          last_contribution_date: string | null
          last_name: string | null
          profile_completeness_score: number | null
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
          imported_at: string | null
          last_name: string | null
          notes: string | null
          source: string | null
          source_contribution_date: string | null
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
          donor_created_at: string | null
          donor_email: string | null
          donor_id: string | null
          donor_name: string | null
          donor_updated_at: string | null
          first_name: string | null
          full_name: string | null
          last_name: string | null
          legacy_id: number | null
        }
        Insert: {
          auth_user_id?: string | null
          donor_created_at?: string | null
          donor_email?: string | null
          donor_id?: string | null
          donor_name?: string | null
          donor_updated_at?: string | null
          first_name?: string | null
          full_name?: string | null
          last_name?: string | null
          legacy_id?: number | null
        }
        Update: {
          auth_user_id?: string | null
          donor_created_at?: string | null
          donor_email?: string | null
          donor_id?: string | null
          donor_name?: string | null
          donor_updated_at?: string | null
          first_name?: string | null
          full_name?: string | null
          last_name?: string | null
          legacy_id?: number | null
        }
        Relationships: []
      }
      vw_donors_with_addresses: {
        Row: {
          address_created_at: string | null
          address_id: string | null
          address_line1: string | null
          address_line2: string | null
          address_updated_at: string | null
          city: string | null
          country: string | null
          donor_email: string | null
          donor_full_name: string | null
          donor_id: string | null
          is_primary: boolean | null
          phone_number: string | null
          postal_zip_code: string | null
          state_province_region: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_admin_by_email: {
        Args: { admin_email: string }
        Returns: undefined
      }
      add_admin_user: {
        Args: {
          make_content_manager?: boolean
          make_super_admin?: boolean
          target_email: string
        }
        Returns: undefined
      }
      add_auth_user_id_column: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      ban_user: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      calculate_donation_achievements: {
        Args: { user_uuid: string }
        Returns: undefined
      }
      check_current_user_is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      check_current_user_is_super_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
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
      check_is_admin: {
        Args: { user_id: string }
        Returns: boolean
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
      create_auth_users_for_all_donors: {
        Args: Record<PropertyKey, never>
        Returns: {
          count: number
          details: string
          result_status: string
        }[]
      }
      create_auth_users_for_donors: {
        Args: Record<PropertyKey, never>
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
      enhanced_admin_security_check: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      ensure_profile_usernames: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_username_from_email: {
        Args: { email_input: string }
        Returns: string
      }
      get_admin_analytics: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_admin_profiles: {
        Args: Record<PropertyKey, never>
        Returns: {
          full_name: string
          id: string
          username: string
        }[]
      }
      get_admin_users: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          email: string
          is_content_manager: boolean
          is_super_admin: boolean
          updated_at: string
          user_id: string
        }[]
      }
      get_all_users: {
        Args: Record<PropertyKey, never>
        Returns: Json[]
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
      get_comprehensive_admin_analytics: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
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
        Args: Record<PropertyKey, never>
        Returns: {
          linked_donors: number
          migration_progress: number
          total_donors: number
          unlinked_no_email: number
          unlinked_with_email: number
        }[]
      }
      get_leaderboard: {
        Args: { category_type?: string; limit_count?: number }
        Returns: {
          achievements: number
          avatar_url: string
          donor_id: string
          donor_name: string
          full_name: string
          metric_value: number
          profile_score: number
          rank: number
          recruits: number
          total_donated: number
          years_supporting: number
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
      get_total_raised: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_user_by_username: {
        Args: { lookup_username: string }
        Returns: {
          avatar_url: string
          display_name: string
          email: string
          source_type: string
          user_id: string
        }[]
      }
      get_user_leaderboard_position: {
        Args: { category_type?: string; user_uuid: string }
        Returns: {
          metric_value: number
          percentile: number
          total_contributors: number
          user_rank: number
        }[]
      }
      gtrgm_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      initiate_account_recovery: {
        Args: {
          client_ip?: string
          client_user_agent?: string
          recovery_type: string
          user_email: string
        }
        Returns: {
          expires_at: string
          message: string
          recovery_token: string
          success: boolean
        }[]
      }
      is_admin: {
        Args: { check_user_id: string }
        Returns: boolean
      }
      is_super_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      link_donor_to_auth_user: {
        Args: { donor_email: string }
        Returns: string
      }
      link_donors_to_auth_users: {
        Args: Record<PropertyKey, never>
        Returns: {
          count: number
          result_status: string
        }[]
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
      merge_legacy_donor_data: {
        Args: Record<PropertyKey, never>
        Returns: {
          action: string
          count: number
        }[]
      }
      remove_admin_user: {
        Args: { target_user_id: string }
        Returns: undefined
      }
      sanitize_text_input: {
        Args: { input_text: string }
        Returns: string
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
      }
      unban_user: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      update_admin_user: {
        Args: {
          make_content_manager: boolean
          make_super_admin: boolean
          target_user_id: string
        }
        Returns: undefined
      }
      validate_email_secure: {
        Args: { email_input: string }
        Returns: boolean
      }
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
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
