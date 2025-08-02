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
      category: {
        Row: {
          name: string
          type: Database["public"]["Enums"]["TransactionType"]
        }
        Insert: {
          name: string
          type?: Database["public"]["Enums"]["TransactionType"]
        }
        Update: {
          name?: string
          type?: Database["public"]["Enums"]["TransactionType"]
        }
        Relationships: []
      }
      category_spend_limit: {
        Row: {
          category: string
          id: number
          limit: number
          time_frame: Database["public"]["Enums"]["SpendLimitTimeFrame"]
          user_id: string
        }
        Insert: {
          category: string
          id?: number
          limit?: number
          time_frame?: Database["public"]["Enums"]["SpendLimitTimeFrame"]
          user_id: string
        }
        Update: {
          category?: string
          id?: number
          limit?: number
          time_frame?: Database["public"]["Enums"]["SpendLimitTimeFrame"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "category_spend_limit_category_fkey"
            columns: ["category"]
            isOneToOne: false
            referencedRelation: "category"
            referencedColumns: ["name"]
          },
        ]
      }
      transaction: {
        Row: {
          amount: number
          category: string
          created_at: string
          date: string
          description: string
          id: number
          merchant: string
          notes: string | null
          status: Database["public"]["Enums"]["TransactionStatus"]
          subtotal: number | null
          tax: number | null
          tip: number | null
          type: Database["public"]["Enums"]["TransactionType"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount?: number
          category: string
          created_at?: string
          date: string
          description?: string
          id?: number
          merchant?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["TransactionStatus"]
          subtotal?: number | null
          tax?: number | null
          tip?: number | null
          type: Database["public"]["Enums"]["TransactionType"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          date?: string
          description?: string
          id?: number
          merchant?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["TransactionStatus"]
          subtotal?: number | null
          tax?: number | null
          tip?: number | null
          type?: Database["public"]["Enums"]["TransactionType"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transaction_category_fkey"
            columns: ["category"]
            isOneToOne: false
            referencedRelation: "category"
            referencedColumns: ["name"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_parent_category: {
        Args: { check_category_name: string }
        Returns: boolean
      }
    }
    Enums: {
      SpendLimitTimeFrame: "Yearly" | "Monthly" | "Weekly" | "Daily"
      TransactionStatus: "Complete" | "Pending" | "Canceled"
      TransactionType: "Income" | "Expense"
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
    Enums: {
      SpendLimitTimeFrame: ["Yearly", "Monthly", "Weekly", "Daily"],
      TransactionStatus: ["Complete", "Pending", "Canceled"],
      TransactionType: ["Income", "Expense"],
    },
  },
} as const
