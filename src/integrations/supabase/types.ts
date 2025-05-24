export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_settings: {
        Row: {
          admin_user_id: string
          contact_email: string | null
          created_at: string | null
          id: string
          logo_url: string | null
          primary_color: string | null
          site_description: string | null
          site_title: string
          updated_at: string | null
        }
        Insert: {
          admin_user_id: string
          contact_email?: string | null
          created_at?: string | null
          id: string
          logo_url?: string | null
          primary_color?: string | null
          site_description?: string | null
          site_title?: string
          updated_at?: string | null
        }
        Update: {
          admin_user_id?: string
          contact_email?: string | null
          created_at?: string | null
          id?: string
          logo_url?: string | null
          primary_color?: string | null
          site_description?: string | null
          site_title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_admin_user"
            columns: ["admin_user_id"]
            isOneToOne: false
            referencedRelation: "donor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          backers_count: number
          category: string
          created_at: string
          creator_id: string
          current_amount: number
          description: string | null
          end_date: string
          featured: boolean
          goal_amount: number
          id: string
          image_url: string | null
          legacy_campaign_id: number | null
          platform: string | null
          start_date: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          backers_count?: number
          category: string
          created_at?: string
          creator_id: string
          current_amount?: number
          description?: string | null
          end_date: string
          featured?: boolean
          goal_amount: number
          id?: string
          image_url?: string | null
          legacy_campaign_id?: number | null
          platform?: string | null
          start_date?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          backers_count?: number
          category?: string
          created_at?: string
          creator_id?: string
          current_amount?: number
          description?: string | null
          end_date?: string
          featured?: boolean
          goal_amount?: number
          id?: string
          image_url?: string | null
          legacy_campaign_id?: number | null
          platform?: string | null
          start_date?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      donor_profiles: {
        Row: {
          address_line_1: string | null
          address_line_2: string | null
          alt_name: string | null
          avatar_url: string | null
          bio: string | null
          city: string | null
          country: string | null
          created_at: string | null
          donor_name: string | null
          email: string | null
          first_name: string | null
          full_name: string | null
          gender: string | null
          id: string
          is_admin: boolean | null
          is_deleted: boolean | null
          last_login: string | null
          last_name: string | null
          legacy_user_id: number | null
          needs_update: boolean | null
          postal_code: string | null
          shirt_size: string | null
          state: string | null
          updated_at: string | null
          username: string | null
          website: string | null
        }
        Insert: {
          address_line_1?: string | null
          address_line_2?: string | null
          alt_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          donor_name?: string | null
          email?: string | null
          first_name?: string | null
          full_name?: string | null
          gender?: string | null
          id: string
          is_admin?: boolean | null
          is_deleted?: boolean | null
          last_login?: string | null
          last_name?: string | null
          legacy_user_id?: number | null
          needs_update?: boolean | null
          postal_code?: string | null
          shirt_size?: string | null
          state?: string | null
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Update: {
          address_line_1?: string | null
          address_line_2?: string | null
          alt_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          donor_name?: string | null
          email?: string | null
          first_name?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          is_admin?: boolean | null
          is_deleted?: boolean | null
          last_login?: string | null
          last_name?: string | null
          legacy_user_id?: number | null
          needs_update?: boolean | null
          postal_code?: string | null
          shirt_size?: string | null
          state?: string | null
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Relationships: []
      }
      perks: {
        Row: {
          amount: number
          campaign_id: string
          claimed_count: number
          cost: number | null
          created_at: string
          delivery_date: string | null
          description: string | null
          id: string
          legacy_package_id: number | null
          limited_quantity: number | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          campaign_id: string
          claimed_count?: number
          cost?: number | null
          created_at?: string
          delivery_date?: string | null
          description?: string | null
          id?: string
          legacy_package_id?: number | null
          limited_quantity?: number | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          campaign_id?: string
          claimed_count?: number
          cost?: number | null
          created_at?: string
          delivery_date?: string | null
          description?: string | null
          id?: string
          legacy_package_id?: number | null
          limited_quantity?: number | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "perks_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      pledges: {
        Row: {
          amount: number
          anonymous: boolean
          backer_id: string
          campaign_id: string
          created_at: string
          id: string
          legacy_donation_id: number | null
          message: string | null
          perk_id: string | null
          shipped: boolean | null
          shipped_date: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          anonymous?: boolean
          backer_id: string
          campaign_id: string
          created_at?: string
          id?: string
          legacy_donation_id?: number | null
          message?: string | null
          perk_id?: string | null
          shipped?: boolean | null
          shipped_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          anonymous?: boolean
          backer_id?: string
          campaign_id?: string
          created_at?: string
          id?: string
          legacy_donation_id?: number | null
          message?: string | null
          perk_id?: string | null
          shipped?: boolean | null
          shipped_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pledges_backer_id_fkey"
            columns: ["backer_id"]
            isOneToOne: false
            referencedRelation: "donor_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pledges_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pledges_perk_id_fkey"
            columns: ["perk_id"]
            isOneToOne: false
            referencedRelation: "perks"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          donor_profile_id: string | null
          full_name: string | null
          id: string
          is_admin: boolean | null
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          donor_profile_id?: string | null
          full_name?: string | null
          id: string
          is_admin?: boolean | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          donor_profile_id?: string | null
          full_name?: string | null
          id?: string
          is_admin?: boolean | null
          updated_at?: string
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_donor_profile_id_fkey"
            columns: ["donor_profile_id"]
            isOneToOne: false
            referencedRelation: "donor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
