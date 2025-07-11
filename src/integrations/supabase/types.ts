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
            referencedRelation: "donor_auth_relationships"
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
            referencedRelation: "vw_donor_pledge_summary"
            referencedColumns: ["donor_id"]
          },
          {
            foreignKeyName: "addresses_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "vw_donors_pending_auth_activation"
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
            referencedRelation: "donor_auth_relationships"
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
            referencedRelation: "vw_donor_pledge_summary"
            referencedColumns: ["donor_id"]
          },
          {
            foreignKeyName: "alerts_seen_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "vw_donors_pending_auth_activation"
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
            referencedRelation: "donor_auth_relationships"
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
            referencedRelation: "vw_donor_pledge_summary"
            referencedColumns: ["donor_id"]
          },
          {
            foreignKeyName: "audit_trail_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "vw_donors_pending_auth_activation"
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
            referencedRelation: "campaign_statistics"
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
            foreignKeyName: "donor_campaign_packages_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "vw_campaign_performance"
            referencedColumns: ["campaign_id"]
          },
          {
            foreignKeyName: "donor_campaign_packages_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "vw_donor_pledge_summary"
            referencedColumns: ["campaign_id"]
          },
          {
            foreignKeyName: "donor_campaign_packages_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "vw_reward_distribution"
            referencedColumns: ["campaign_id"]
          },
          {
            foreignKeyName: "donor_campaign_packages_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "donor_auth_relationships"
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
            referencedRelation: "vw_donor_pledge_summary"
            referencedColumns: ["donor_id"]
          },
          {
            foreignKeyName: "donor_campaign_packages_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "vw_donors_pending_auth_activation"
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
            referencedRelation: "donor_auth_relationships"
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
            referencedRelation: "vw_donor_pledge_summary"
            referencedColumns: ["donor_id"]
          },
          {
            foreignKeyName: "donor_sku_items_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "vw_donors_pending_auth_activation"
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
          created_at: string | null
          deleted: boolean | null
          donor_name: string | null
          email: string
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
          temp_id: number | null
          updated_at: string | null
        }
        Insert: {
          admin?: boolean | null
          auth_user_id?: string | null
          created_at?: string | null
          deleted?: boolean | null
          donor_name?: string | null
          email: string
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
          temp_id?: number | null
          updated_at?: string | null
        }
        Update: {
          admin?: boolean | null
          auth_user_id?: string | null
          created_at?: string | null
          deleted?: boolean | null
          donor_name?: string | null
          email?: string
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
          temp_id?: number | null
          updated_at?: string | null
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
            referencedRelation: "donor_auth_relationships"
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
            referencedRelation: "vw_donor_pledge_summary"
            referencedColumns: ["donor_id"]
          },
          {
            foreignKeyName: "notifications_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "vw_donors_pending_auth_activation"
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
            referencedRelation: "campaign_statistics"
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
            foreignKeyName: "pledges_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "vw_campaign_performance"
            referencedColumns: ["campaign_id"]
          },
          {
            foreignKeyName: "pledges_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "vw_donor_pledge_summary"
            referencedColumns: ["campaign_id"]
          },
          {
            foreignKeyName: "pledges_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "vw_reward_distribution"
            referencedColumns: ["campaign_id"]
          },
          {
            foreignKeyName: "pledges_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "donor_auth_relationships"
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
            referencedRelation: "vw_donor_pledge_summary"
            referencedColumns: ["donor_id"]
          },
          {
            foreignKeyName: "pledges_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "vw_donors_pending_auth_activation"
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
          {
            foreignKeyName: "pledges_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "vw_donor_pledge_summary"
            referencedColumns: ["reward_id"]
          },
          {
            foreignKeyName: "pledges_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "vw_reward_distribution"
            referencedColumns: ["reward_id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
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
            referencedRelation: "campaign_statistics"
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
          {
            foreignKeyName: "rewards_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "vw_campaign_performance"
            referencedColumns: ["campaign_id"]
          },
          {
            foreignKeyName: "rewards_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "vw_donor_pledge_summary"
            referencedColumns: ["campaign_id"]
          },
          {
            foreignKeyName: "rewards_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "vw_reward_distribution"
            referencedColumns: ["campaign_id"]
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
            referencedRelation: "donor_auth_relationships"
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
            referencedRelation: "vw_donor_pledge_summary"
            referencedColumns: ["donor_id"]
          },
          {
            foreignKeyName: "src_indiegogo_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "vw_donors_pending_auth_activation"
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
            referencedRelation: "donor_auth_relationships"
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
            referencedRelation: "vw_donor_pledge_summary"
            referencedColumns: ["donor_id"]
          },
          {
            foreignKeyName: "src_kickstarter_axanar_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "vw_donors_pending_auth_activation"
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
            referencedRelation: "donor_auth_relationships"
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
            referencedRelation: "vw_donor_pledge_summary"
            referencedColumns: ["donor_id"]
          },
          {
            foreignKeyName: "src_kickstarter_prelude_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "vw_donors_pending_auth_activation"
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
            referencedRelation: "donor_auth_relationships"
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
            referencedRelation: "vw_donor_pledge_summary"
            referencedColumns: ["donor_id"]
          },
          {
            foreignKeyName: "src_paypal_axanar_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "vw_donors_pending_auth_activation"
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
            referencedRelation: "donor_auth_relationships"
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
            referencedRelation: "vw_donor_pledge_summary"
            referencedColumns: ["donor_id"]
          },
          {
            foreignKeyName: "src_paypal_prelude_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "vw_donors_pending_auth_activation"
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
            referencedRelation: "donor_auth_relationships"
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
            referencedRelation: "vw_donor_pledge_summary"
            referencedColumns: ["donor_id"]
          },
          {
            foreignKeyName: "src_secret_perks_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "vw_donors_pending_auth_activation"
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
    }
    Views: {
      admin_users_view: {
        Row: {
          created_at: string | null
          is_content_manager: boolean | null
          is_super_admin: boolean | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          is_content_manager?: boolean | null
          is_super_admin?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          is_content_manager?: boolean | null
          is_super_admin?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      campaign_statistics: {
        Row: {
          campaign_id: string | null
          campaign_name: string | null
          end_date: string | null
          pledge_count: number | null
          provider: string | null
          start_date: string | null
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
      donor_auth_relationships: {
        Row: {
          auth_created_at: string | null
          auth_user_id: string | null
          donor_id: string | null
          email: string | null
          email_confirmed_at: string | null
          first_name: string | null
          has_auth_account: boolean | null
          last_login: string | null
          last_name: string | null
        }
        Relationships: []
      }
      donor_pledge_totals: {
        Row: {
          donor_id: string | null
          donor_name: string | null
          email: string | null
          first_donation_date: string | null
          full_name: string | null
          last_donation_date: string | null
          pledge_count: number | null
          total_donated: number | null
        }
        Relationships: []
      }
      pledge_count_by_donor: {
        Row: {
          count: number | null
          donor_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pledges_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "donor_auth_relationships"
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
            referencedRelation: "vw_donor_pledge_summary"
            referencedColumns: ["donor_id"]
          },
          {
            foreignKeyName: "pledges_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "vw_donors_pending_auth_activation"
            referencedColumns: ["donor_id"]
          },
          {
            foreignKeyName: "pledges_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "vw_donors_with_addresses"
            referencedColumns: ["donor_id"]
          },
        ]
      }
      pledges_by_donor: {
        Row: {
          donor_id: string | null
          total_donated: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pledges_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "donor_auth_relationships"
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
            referencedRelation: "vw_donor_pledge_summary"
            referencedColumns: ["donor_id"]
          },
          {
            foreignKeyName: "pledges_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "vw_donors_pending_auth_activation"
            referencedColumns: ["donor_id"]
          },
          {
            foreignKeyName: "pledges_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "vw_donors_with_addresses"
            referencedColumns: ["donor_id"]
          },
        ]
      }
      vw_campaign_performance: {
        Row: {
          average_pledge_amount: number | null
          campaign_id: string | null
          campaign_image_url: string | null
          campaign_is_active: boolean | null
          campaign_name: string | null
          campaign_provider: string | null
          campaign_status: string | null
          campaign_web_url: string | null
          end_date: string | null
          start_date: string | null
          total_pledged_amount: number | null
          total_pledges: number | null
          total_unique_donors: number | null
        }
        Relationships: []
      }
      vw_donor_details: {
        Row: {
          auth_account_created_at: string | null
          auth_account_updated_at: string | null
          auth_email: string | null
          auth_user_id: string | null
          donor_created_at: string | null
          donor_email: string | null
          donor_id: string | null
          donor_name: string | null
          donor_updated_at: string | null
          email_confirmed_at: string | null
          first_name: string | null
          full_name: string | null
          last_name: string | null
          last_sign_in_at: string | null
          legacy_id: number | null
        }
        Relationships: []
      }
      vw_donor_pledge_summary: {
        Row: {
          campaign_end_date: string | null
          campaign_id: string | null
          campaign_name: string | null
          campaign_start_date: string | null
          donor_email: string | null
          donor_full_name: string | null
          donor_id: string | null
          pledge_amount: number | null
          pledge_date: string | null
          pledge_id: string | null
          pledge_status: string | null
          reward_description: string | null
          reward_id: string | null
          reward_name: string | null
          reward_price: number | null
        }
        Relationships: []
      }
      vw_donors_pending_auth_activation: {
        Row: {
          donor_created_at: string | null
          donor_email: string | null
          donor_full_name: string | null
          donor_id: string | null
          first_name: string | null
          last_name: string | null
        }
        Insert: {
          donor_created_at?: string | null
          donor_email?: string | null
          donor_full_name?: never
          donor_id?: string | null
          first_name?: string | null
          last_name?: string | null
        }
        Update: {
          donor_created_at?: string | null
          donor_email?: string | null
          donor_full_name?: never
          donor_id?: string | null
          first_name?: string | null
          last_name?: string | null
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
      vw_reward_distribution: {
        Row: {
          campaign_id: string | null
          campaign_name: string | null
          reward_description: string | null
          reward_id: string | null
          reward_name: string | null
          reward_price: number | null
          times_claimed_in_pledges: number | null
          total_pledged_for_reward_via_pledges: number | null
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
      remove_admin_user: {
        Args: { target_user_id: string }
        Returns: undefined
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
      validate_recovery_token: {
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
