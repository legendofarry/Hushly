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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      analytics_events: {
        Row: {
          created_at: string
          event_name: string
          id: string
          properties: Json
          subject_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_name: string
          id?: string
          properties?: Json
          subject_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_name?: string
          id?: string
          properties?: Json
          subject_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      blocks: {
        Row: {
          blocked_id: string
          blocker_id: string
          created_at: string
        }
        Insert: {
          blocked_id: string
          blocker_id: string
          created_at?: string
        }
        Update: {
          blocked_id?: string
          blocker_id?: string
          created_at?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          last_message_at: string
          user_a: string
          user_b: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_at?: string
          user_a: string
          user_b: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message_at?: string
          user_a?: string
          user_b?: string
        }
        Relationships: []
      }
      memberships: {
        Row: {
          amount_kes: number
          created_at: string
          expires_at: string | null
          id: string
          plan_code: string
          starts_at: string | null
          status: Database["public"]["Enums"]["membership_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_kes?: number
          created_at?: string
          expires_at?: string | null
          id?: string
          plan_code?: string
          starts_at?: string | null
          status?: Database["public"]["Enums"]["membership_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_kes?: number
          created_at?: string
          expires_at?: string | null
          id?: string
          plan_code?: string
          starts_at?: string | null
          status?: Database["public"]["Enums"]["membership_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      message_reactions: {
        Row: {
          created_at: string
          emoji: string
          id: string
          message_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          emoji: string
          id?: string
          message_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          emoji?: string
          id?: string
          message_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_reactions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          body: string | null
          conversation_id: string
          created_at: string
          id: string
          image_url: string | null
          read_at: string | null
          sender_id: string
        }
        Insert: {
          body?: string | null
          conversation_id: string
          created_at?: string
          id?: string
          image_url?: string | null
          read_at?: string | null
          sender_id: string
        }
        Update: {
          body?: string | null
          conversation_id?: string
          created_at?: string
          id?: string
          image_url?: string | null
          read_at?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          group_key: string
          icon: string | null
          id: string
          is_archived: boolean
          is_read: boolean
          link: string | null
          title: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          group_key?: string
          icon?: string | null
          id?: string
          is_archived?: boolean
          is_read?: boolean
          link?: string | null
          title: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          group_key?: string
          icon?: string | null
          id?: string
          is_archived?: boolean
          is_read?: boolean
          link?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      payment_submissions: {
        Row: {
          admin_note: string | null
          amount_kes: number
          created_at: string
          id: string
          membership_id: string | null
          method: string
          payer_name: string
          proof_url: string | null
          reference_text: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["membership_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_note?: string | null
          amount_kes?: number
          created_at?: string
          id?: string
          membership_id?: string | null
          method?: string
          payer_name: string
          proof_url?: string | null
          reference_text?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["membership_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_note?: string | null
          amount_kes?: number
          created_at?: string
          id?: string
          membership_id?: string | null
          method?: string
          payer_name?: string
          proof_url?: string | null
          reference_text?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["membership_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_submissions_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "memberships"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_config: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      profile_photos: {
        Row: {
          created_at: string
          id: string
          is_main: boolean
          position: number
          profile_id: string
          storage_path: string | null
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_main?: boolean
          position?: number
          profile_id: string
          storage_path?: string | null
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          is_main?: boolean
          position?: number
          profile_id?: string
          storage_path?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_photos_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_tags: {
        Row: {
          profile_id: string
          tag_id: string
        }
        Insert: {
          profile_id: string
          tag_id: string
        }
        Update: {
          profile_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_tags_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          age: number | null
          approx_latitude: number | null
          approx_longitude: number | null
          bio: string | null
          completion_percent: number
          created_at: string
          display_name: string | null
          gender: string | null
          id: string
          is_featured: boolean
          is_published: boolean
          is_suspended: boolean
          last_active_at: string
          latitude: number | null
          live_beta_optin: boolean
          location_area: string | null
          location_label: string | null
          location_precision: Database["public"]["Enums"]["location_precision"]
          longitude: number | null
          onboarding_complete: boolean
          onboarding_step: number
          phone: string | null
          popularity_score: number
          relationship_goal: string | null
          seeking: string[]
          updated_at: string
          username: string | null
          view_count: number
          visibility: Database["public"]["Enums"]["profile_visibility"]
          whatsapp: string | null
        }
        Insert: {
          age?: number | null
          approx_latitude?: number | null
          approx_longitude?: number | null
          bio?: string | null
          completion_percent?: number
          created_at?: string
          display_name?: string | null
          gender?: string | null
          id: string
          is_featured?: boolean
          is_published?: boolean
          is_suspended?: boolean
          last_active_at?: string
          latitude?: number | null
          live_beta_optin?: boolean
          location_area?: string | null
          location_label?: string | null
          location_precision?: Database["public"]["Enums"]["location_precision"]
          longitude?: number | null
          onboarding_complete?: boolean
          onboarding_step?: number
          phone?: string | null
          popularity_score?: number
          relationship_goal?: string | null
          seeking?: string[]
          updated_at?: string
          username?: string | null
          view_count?: number
          visibility?: Database["public"]["Enums"]["profile_visibility"]
          whatsapp?: string | null
        }
        Update: {
          age?: number | null
          approx_latitude?: number | null
          approx_longitude?: number | null
          bio?: string | null
          completion_percent?: number
          created_at?: string
          display_name?: string | null
          gender?: string | null
          id?: string
          is_featured?: boolean
          is_published?: boolean
          is_suspended?: boolean
          last_active_at?: string
          latitude?: number | null
          live_beta_optin?: boolean
          location_area?: string | null
          location_label?: string | null
          location_precision?: Database["public"]["Enums"]["location_precision"]
          longitude?: number | null
          onboarding_complete?: boolean
          onboarding_step?: number
          phone?: string | null
          popularity_score?: number
          relationship_goal?: string | null
          seeking?: string[]
          updated_at?: string
          username?: string | null
          view_count?: number
          visibility?: Database["public"]["Enums"]["profile_visibility"]
          whatsapp?: string | null
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string
          details: string | null
          id: string
          reason: string
          reporter_id: string
          status: string
          target_message_id: string | null
          target_user_id: string | null
        }
        Insert: {
          created_at?: string
          details?: string | null
          id?: string
          reason: string
          reporter_id: string
          status?: string
          target_message_id?: string | null
          target_user_id?: string | null
        }
        Update: {
          created_at?: string
          details?: string | null
          id?: string
          reason?: string
          reporter_id?: string
          status?: string
          target_message_id?: string | null
          target_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_target_message_id_fkey"
            columns: ["target_message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      security_settings: {
        Row: {
          app_lock_enabled: boolean
          biometric_enabled: boolean
          lock_after_minutes: number
          lock_on_background: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          app_lock_enabled?: boolean
          biometric_enabled?: boolean
          lock_after_minutes?: number
          lock_on_background?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          app_lock_enabled?: boolean
          biometric_enabled?: boolean
          lock_after_minutes?: number
          lock_on_background?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          attachment_url: string | null
          category: string
          created_at: string
          description: string
          email: string
          id: string
          name: string
          status: string
          user_id: string | null
        }
        Insert: {
          attachment_url?: string | null
          category: string
          created_at?: string
          description: string
          email: string
          id?: string
          name: string
          status?: string
          user_id?: string | null
        }
        Update: {
          attachment_url?: string | null
          category?: string
          created_at?: string
          description?: string
          email?: string
          id?: string
          name?: string
          status?: string
          user_id?: string | null
        }
        Relationships: []
      }
      tags: {
        Row: {
          category: string
          emoji: string | null
          id: string
          is_active: boolean
          label: string
          slug: string
        }
        Insert: {
          category?: string
          emoji?: string | null
          id?: string
          is_active?: boolean
          label: string
          slug: string
        }
        Update: {
          category?: string
          emoji?: string | null
          id?: string
          is_active?: boolean
          label?: string
          slug?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          discoverable: boolean
          notify_membership: boolean
          notify_messages: boolean
          notify_promotions: boolean
          notify_system: boolean
          show_activity: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          discoverable?: boolean
          notify_membership?: boolean
          notify_messages?: boolean
          notify_promotions?: boolean
          notify_system?: boolean
          show_activity?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          discoverable?: boolean
          notify_membership?: boolean
          notify_messages?: boolean
          notify_promotions?: boolean
          notify_system?: boolean
          show_activity?: boolean
          updated_at?: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_profile_view: {
        Args: { _username: string }
        Returns: undefined
      }
      is_username_available: { Args: { _username: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      location_precision: "exact" | "approximate"
      membership_status:
        | "draft"
        | "payment_pending"
        | "pending_approval"
        | "approved"
        | "rejected"
        | "expired"
        | "suspended"
      profile_visibility: "public" | "members" | "hidden"
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
      app_role: ["admin", "moderator", "user"],
      location_precision: ["exact", "approximate"],
      membership_status: [
        "draft",
        "payment_pending",
        "pending_approval",
        "approved",
        "rejected",
        "expired",
        "suspended",
      ],
      profile_visibility: ["public", "members", "hidden"],
    },
  },
} as const
