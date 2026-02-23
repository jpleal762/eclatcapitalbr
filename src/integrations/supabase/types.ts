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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      app_settings: {
        Row: {
          id: string
          key: string
          updated_at: string | null
          updated_by: string | null
          value: string
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value: string
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: string
        }
        Relationships: []
      }
      assessor_tokens: {
        Row: {
          allowed_screens: string[] | null
          assessor_name: string
          created_at: string | null
          id: string
          is_active: boolean | null
          last_production_update_at: string | null
          role: string
          token: string
        }
        Insert: {
          allowed_screens?: string[] | null
          assessor_name: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_production_update_at?: string | null
          role?: string
          token: string
        }
        Update: {
          allowed_screens?: string[] | null
          assessor_name?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_production_update_at?: string | null
          role?: string
          token?: string
        }
        Relationships: []
      }
      kpi_records: {
        Row: {
          assessor: string
          categorias: string
          created_at: string | null
          created_by: string | null
          id: string
          monthly_data: Json
          status: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          assessor: string
          categorias: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          monthly_data: Json
          status: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          assessor?: string
          categorias?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          monthly_data?: Json
          status?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      kpi_snapshots: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          month: string
          record_count: number
          snapshot_data: Json
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          month: string
          record_count?: number
          snapshot_data: Json
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          month?: string
          record_count?: number
          snapshot_data?: Json
        }
        Relationships: []
      }
      sprint_challenges: {
        Row: {
          assessor_name: string
          category: string
          created_at: string
          created_by: string | null
          deadline: string
          id: string
          is_active: boolean
          month: string
          target_value: number
        }
        Insert: {
          assessor_name: string
          category: string
          created_at?: string
          created_by?: string | null
          deadline: string
          id?: string
          is_active?: boolean
          month: string
          target_value: number
        }
        Update: {
          assessor_name?: string
          category?: string
          created_at?: string
          created_by?: string | null
          deadline?: string
          id?: string
          is_active?: boolean
          month?: string
          target_value?: number
        }
        Relationships: []
      }
      sprint_snapshots: {
        Row: {
          created_at: string | null
          id: string
          month: string
          snapshot_data: Json
        }
        Insert: {
          created_at?: string | null
          id?: string
          month: string
          snapshot_data: Json
        }
        Update: {
          created_at?: string | null
          id?: string
          month?: string
          snapshot_data?: Json
        }
        Relationships: []
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
