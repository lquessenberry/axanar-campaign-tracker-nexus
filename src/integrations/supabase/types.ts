export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
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
          email: string
          email_lists: string | null
          email_permission_status: string | null
          email_status: string | null
          email_verified_at: string | null
          first_name: string | null
          full_name: string | null
          id: string
          last_login: string | null
          last_name: string | null
          legacy_id: number | null
          need_update: boolean | null
          password: string | null
          remember_token: string | null
          reset_pass: string | null
          source_name: string | null
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
          email: string
          email_lists?: string | null
          email_permission_status?: string | null
          email_status?: string | null
          email_verified_at?: string | null
          first_name?: string | null
          full_name?: string | null
          id?: string
          last_login?: string | null
          last_name?: string | null
          legacy_id?: number | null
          need_update?: boolean | null
          password?: string | null
          remember_token?: string | null
          reset_pass?: string | null
          source_name?: string | null
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
          email?: string
          email_lists?: string | null
          email_permission_status?: string | null
          email_status?: string | null
          email_verified_at?: string | null
          first_name?: string | null
          full_name?: string | null
          id?: string
          last_login?: string | null
          last_name?: string | null
          legacy_id?: number | null
          need_update?: boolean | null
          password?: string | null
          remember_token?: string | null
          reset_pass?: string | null
          source_name?: string | null
          temp_id?: number | null
          updated_at?: string | null
          username?: string | null
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
          target_email: string
          make_super_admin?: boolean
          make_content_manager?: boolean
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
          exists_in_donors: boolean
          exists_in_auth: boolean
          donor_id: string
          auth_id: string
          is_linked: boolean
        }[]
      }
      check_email_in_system: {
        Args: { check_email: string }
        Returns: {
          exists_in_auth: boolean
          exists_in_donors: boolean
          has_auth_link: boolean
          auth_user_id: string
          donor_id: string
          suggested_providers: string[]
        }[]
      }
      check_is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      check_password_reset_rate_limit: {
        Args: { user_email: string; client_ip?: string }
        Returns: {
          allowed: boolean
          remaining_attempts: number
          reset_time: string
        }[]
      }
      check_recovery_token_validity: {
        Args: { token: string; user_email: string }
        Returns: {
          is_valid: boolean
          attempt_type: string
          message: string
        }[]
      }
      create_auth_users_for_donors: {
        Args: Record<PropertyKey, never>
        Returns: {
          result_status: string
          count: number
        }[]
      }
      create_legacy_user: {
        Args: {
          user_id: string
          email: string
          password_hash: string
          email_confirmed: boolean
          created_at: string
          last_sign_in_at: string
          raw_user_meta_data: Json
          raw_app_meta_data: Json
        }
        Returns: undefined
      }
      enhanced_admin_security_check: {
        Args: Record<PropertyKey, never>
        Returns: boolean
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
          id: string
          username: string
          full_name: string
        }[]
      }
      get_admin_users: {
        Args: Record<PropertyKey, never>
        Returns: {
          user_id: string
          email: string
          is_super_admin: boolean
          is_content_manager: boolean
          created_at: string
          updated_at: string
        }[]
      }
      get_all_users: {
        Args: Record<PropertyKey, never>
        Returns: Json[]
      }
      get_campaign_analytics_paginated: {
        Args: {
          page_size?: number
          page_offset?: number
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
          page_size?: number
          page_offset?: number
          search_term?: string
          sort_column?: string
          sort_direction?: string
        }
        Returns: Json
      }
      get_leaderboard: {
        Args: { category_type?: string; limit_count?: number }
        Returns: {
          rank: number
          donor_id: string
          full_name: string
          donor_name: string
          avatar_url: string
          metric_value: number
          total_donated: number
          years_supporting: number
          achievements: number
          recruits: number
          profile_score: number
        }[]
      }
      get_total_raised: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_user_leaderboard_position: {
        Args: { user_uuid: string; category_type?: string }
        Returns: {
          user_rank: number
          total_contributors: number
          metric_value: number
          percentile: number
        }[]
      }
      initiate_account_recovery: {
        Args: {
          user_email: string
          recovery_type: string
          client_ip?: string
          client_user_agent?: string
        }
        Returns: {
          recovery_token: string
          expires_at: string
          success: boolean
          message: string
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
          result_status: string
          count: number
        }[]
      }
      log_admin_action: {
        Args: { action_type: string; target_user_id: string; details?: Json }
        Returns: undefined
      }
      log_admin_action_enhanced: {
        Args: {
          action_type: string
          target_table?: string
          target_id?: string
          old_values?: Json
          new_values?: Json
          client_ip?: string
          client_user_agent?: string
        }
        Returns: undefined
      }
      remove_admin_user: {
        Args: { target_user_id: string }
        Returns: undefined
      }
      sanitize_text_input: {
        Args: { input_text: string }
        Returns: string
      }
      unban_user: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      update_admin_user: {
        Args: {
          target_user_id: string
          make_super_admin: boolean
          make_content_manager: boolean
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
          is_valid: boolean
          attempt_type: string
          message: string
        }[]
      }
      validate_recovery_token_secure: {
        Args: { token: string; user_email: string }
        Returns: {
          is_valid: boolean
          attempt_type: string
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
