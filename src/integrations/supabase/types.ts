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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      airdrop_claims: {
        Row: {
          airdrop_id: string
          amount: number
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          airdrop_id: string
          amount: number
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          airdrop_id?: string
          amount?: number
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "airdrop_claims_airdrop_id_fkey"
            columns: ["airdrop_id"]
            isOneToOne: false
            referencedRelation: "airdrops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "airdrop_claims_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      airdrops: {
        Row: {
          amount: number
          claims_count: number
          created_at: string
          created_by: string | null
          description: string | null
          description_ar: string | null
          ends_at: string | null
          id: string
          is_active: boolean
          max_claims: number | null
          starts_at: string
          title: string
          title_ar: string | null
        }
        Insert: {
          amount: number
          claims_count?: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          description_ar?: string | null
          ends_at?: string | null
          id?: string
          is_active?: boolean
          max_claims?: number | null
          starts_at?: string
          title: string
          title_ar?: string | null
        }
        Update: {
          amount?: number
          claims_count?: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          description_ar?: string | null
          ends_at?: string | null
          id?: string
          is_active?: boolean
          max_claims?: number | null
          starts_at?: string
          title?: string
          title_ar?: string | null
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          claim_interval_minutes: number
          distribution_mode: string
          id: number
          max_referrals_per_user: number
          min_withdrawal: number
          mining_enabled: boolean
          rate_limit_per_minute: number
          referral_commission_pct: number
          referral_enabled: boolean
          referral_signup_bonus: number
          reward_per_claim: number
          updated_at: string
          updated_by: string | null
          withdrawals_enabled: boolean
        }
        Insert: {
          claim_interval_minutes?: number
          distribution_mode?: string
          id?: number
          max_referrals_per_user?: number
          min_withdrawal?: number
          mining_enabled?: boolean
          rate_limit_per_minute?: number
          referral_commission_pct?: number
          referral_enabled?: boolean
          referral_signup_bonus?: number
          reward_per_claim?: number
          updated_at?: string
          updated_by?: string | null
          withdrawals_enabled?: boolean
        }
        Update: {
          claim_interval_minutes?: number
          distribution_mode?: string
          id?: number
          max_referrals_per_user?: number
          min_withdrawal?: number
          mining_enabled?: boolean
          rate_limit_per_minute?: number
          referral_commission_pct?: number
          referral_enabled?: boolean
          referral_signup_bonus?: number
          reward_per_claim?: number
          updated_at?: string
          updated_by?: string | null
          withdrawals_enabled?: boolean
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          details: Json
          id: number
          target_id: string | null
          target_type: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          details?: Json
          id?: never
          target_id?: string | null
          target_type?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          details?: Json
          id?: never
          target_id?: string | null
          target_type?: string | null
        }
        Relationships: []
      }
      mining_sessions: {
        Row: {
          claimed_at: string | null
          created_at: string
          ends_at: string
          id: string
          reward: number | null
          started_at: string
          status: Database["public"]["Enums"]["session_status"]
          user_id: string
        }
        Insert: {
          claimed_at?: string | null
          created_at?: string
          ends_at: string
          id?: string
          reward?: number | null
          started_at?: string
          status?: Database["public"]["Enums"]["session_status"]
          user_id: string
        }
        Update: {
          claimed_at?: string | null
          created_at?: string
          ends_at?: string
          id?: string
          reward?: number | null
          started_at?: string
          status?: Database["public"]["Enums"]["session_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mining_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string
          id: string
          locale: string
          referral_code: string
          referred_by: string | null
          status: Database["public"]["Enums"]["account_status"]
          suspended_reason: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string
          id: string
          locale?: string
          referral_code: string
          referred_by?: string | null
          status?: Database["public"]["Enums"]["account_status"]
          suspended_reason?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string
          id?: string
          locale?: string
          referral_code?: string
          referred_by?: string | null
          status?: Database["public"]["Enums"]["account_status"]
          suspended_reason?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limit_events: {
        Row: {
          action: string
          created_at: string
          id: number
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: never
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: never
          user_id?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          bonus_paid: boolean
          created_at: string
          id: string
          referee_id: string
          referrer_id: string
          total_commission: number
        }
        Insert: {
          bonus_paid?: boolean
          created_at?: string
          id?: string
          referee_id: string
          referrer_id: string
          total_commission?: number
        }
        Update: {
          bonus_paid?: boolean
          created_at?: string
          id?: string
          referee_id?: string
          referrer_id?: string
          total_commission?: number
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referee_id_fkey"
            columns: ["referee_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reward_ledger: {
        Row: {
          amount: number
          balance_after: number
          created_at: string
          description: string | null
          entry_type: Database["public"]["Enums"]["ledger_entry_type"]
          id: string
          idempotency_key: string
          reference_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          balance_after: number
          created_at?: string
          description?: string | null
          entry_type: Database["public"]["Enums"]["ledger_entry_type"]
          id?: string
          idempotency_key: string
          reference_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          balance_after?: number
          created_at?: string
          description?: string | null
          entry_type?: Database["public"]["Enums"]["ledger_entry_type"]
          id?: string
          idempotency_key?: string
          reference_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wallets: {
        Row: {
          balance: number
          locked: number
          total_airdrop: number
          total_earned: number | null
          total_mined: number
          total_referral: number
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          locked?: number
          total_airdrop?: number
          total_earned?: number | null
          total_mined?: number
          total_referral?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          locked?: number
          total_airdrop?: number
          total_earned?: number | null
          total_mined?: number
          total_referral?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      withdrawal_requests: {
        Row: {
          admin_note: string | null
          amount: number
          chain_id: number | null
          created_at: string
          id: string
          network: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["withdrawal_status"]
          tx_hash: string | null
          user_id: string
          wallet_address: string
        }
        Insert: {
          admin_note?: string | null
          amount: number
          chain_id?: number | null
          created_at?: string
          id?: string
          network?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["withdrawal_status"]
          tx_hash?: string | null
          user_id: string
          wallet_address: string
        }
        Update: {
          admin_note?: string | null
          amount?: number
          chain_id?: number | null
          created_at?: string
          id?: string
          network?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["withdrawal_status"]
          tx_hash?: string | null
          user_id?: string
          wallet_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "withdrawal_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      _apply_ledger: {
        Args: {
          p_amount: number
          p_desc: string
          p_key: string
          p_ref: string
          p_type: Database["public"]["Enums"]["ledger_entry_type"]
          p_user: string
        }
        Returns: number
      }
      _audit: {
        Args: {
          p_action: string
          p_details: Json
          p_target_id: string
          p_target_type: string
        }
        Returns: undefined
      }
      _is_suspended: { Args: { p_user: string }; Returns: boolean }
      _rate_limit: { Args: { p_action: string }; Returns: boolean }
      _require_admin: { Args: never; Returns: undefined }
      admin_list_users: {
        Args: { p_limit?: number; p_offset?: number; p_search?: string }
        Returns: {
          balance: number
          created_at: string
          display_name: string
          email: string
          id: string
          is_admin: boolean
          last_claim_at: string
          referral_count: number
          status: Database["public"]["Enums"]["account_status"]
          suspended_reason: string
          total_earned: number
        }[]
      }
      admin_review_withdrawal: {
        Args: { p_approve: boolean; p_id: string; p_note?: string }
        Returns: undefined
      }
      admin_save_airdrop: {
        Args: {
          p_amount: number
          p_description: string
          p_description_ar: string
          p_ends_at: string
          p_id: string
          p_is_active: boolean
          p_max_claims: number
          p_starts_at: string
          p_title: string
          p_title_ar: string
        }
        Returns: string
      }
      admin_set_admin: {
        Args: { p_grant: boolean; p_user: string }
        Returns: undefined
      }
      admin_set_user_status: {
        Args: {
          p_reason?: string
          p_status: Database["public"]["Enums"]["account_status"]
          p_user: string
        }
        Returns: undefined
      }
      admin_stats: { Args: never; Returns: Json }
      admin_update_settings: { Args: { p: Json }; Returns: undefined }
      cancel_withdrawal: { Args: { p_id: string }; Returns: Json }
      claim_airdrop: { Args: { p_airdrop_id: string }; Returns: Json }
      claim_mining_reward: {
        Args: { p_idempotency_key: string }
        Returns: Json
      }
      get_leaderboard: {
        Args: { p_limit?: number }
        Returns: {
          display_name: string
          is_me: boolean
          rank: number
          total_earned: number
          total_mined: number
        }[]
      }
      get_my_rank: { Args: never; Returns: Json }
      get_my_referrals: {
        Args: never
        Returns: {
          activated: boolean
          commission: number
          display_name: string
          joined_at: string
        }[]
      }
      get_public_stats: { Args: never; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      request_withdrawal: {
        Args: { p_amount: number; p_network: string; p_wallet_address: string }
        Returns: Json
      }
      start_mining: { Args: never; Returns: Json }
    }
    Enums: {
      account_status: "active" | "suspended"
      app_role: "admin" | "moderator" | "user"
      ledger_entry_type:
        | "mining"
        | "referral_bonus"
        | "referral_commission"
        | "airdrop"
        | "withdrawal_hold"
        | "withdrawal_refund"
      session_status: "active" | "claimed"
      withdrawal_status: "pending" | "approved" | "rejected" | "cancelled"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      account_status: ["active", "suspended"],
      app_role: ["admin", "moderator", "user"],
      ledger_entry_type: [
        "mining",
        "referral_bonus",
        "referral_commission",
        "airdrop",
        "withdrawal_hold",
        "withdrawal_refund",
      ],
      session_status: ["active", "claimed"],
      withdrawal_status: ["pending", "approved", "rejected", "cancelled"],
    },
  },
} as const
