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
      change_logs: {
        Row: {
          action: string
          changes: Json | null
          created_at: string
          details: string | null
          id: string
          product_id: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          changes?: Json | null
          created_at?: string
          details?: string | null
          id?: string
          product_id?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          changes?: Json | null
          created_at?: string
          details?: string | null
          id?: string
          product_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "change_logs_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "ups_products"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          company: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
        }
        Relationships: []
      }
      sources: {
        Row: {
          created_at: string
          datasheet_date: string | null
          id: string
          product_id: string
          retrieved_date: string | null
          source_type: string | null
          title: string
          url: string | null
        }
        Insert: {
          created_at?: string
          datasheet_date?: string | null
          id?: string
          product_id: string
          retrieved_date?: string | null
          source_type?: string | null
          title: string
          url?: string | null
        }
        Update: {
          created_at?: string
          datasheet_date?: string | null
          id?: string
          product_id?: string
          retrieved_date?: string | null
          source_type?: string | null
          title?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sources_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "ups_products"
            referencedColumns: ["id"]
          },
        ]
      }
      ups_products: {
        Row: {
          access_requirement: string | null
          battery_type: string | null
          created_at: string
          double_conversion_efficiency: number | null
          eco_mode_efficiency: number | null
          footprint_area_m2: number | null
          id: string
          last_verified_by: string | null
          last_verified_date: string | null
          max_capacity_kw: number | null
          max_parallel_kw: number | null
          min_capacity_kw: number | null
          modular_type: string | null
          monitoring_protocol: string | null
          power_density_kw_per_m2: number | null
          product_series: string
          region_availability: string | null
          region_availability_detail: string | null
          topology: string | null
          updated_at: string
          vendor_id: string
          verification_notes: string | null
          verification_status: Database["public"]["Enums"]["verification_status"]
        }
        Insert: {
          access_requirement?: string | null
          battery_type?: string | null
          created_at?: string
          double_conversion_efficiency?: number | null
          eco_mode_efficiency?: number | null
          footprint_area_m2?: number | null
          id?: string
          last_verified_by?: string | null
          last_verified_date?: string | null
          max_capacity_kw?: number | null
          max_parallel_kw?: number | null
          min_capacity_kw?: number | null
          modular_type?: string | null
          monitoring_protocol?: string | null
          power_density_kw_per_m2?: number | null
          product_series: string
          region_availability?: string | null
          region_availability_detail?: string | null
          topology?: string | null
          updated_at?: string
          vendor_id: string
          verification_notes?: string | null
          verification_status?: Database["public"]["Enums"]["verification_status"]
        }
        Update: {
          access_requirement?: string | null
          battery_type?: string | null
          created_at?: string
          double_conversion_efficiency?: number | null
          eco_mode_efficiency?: number | null
          footprint_area_m2?: number | null
          id?: string
          last_verified_by?: string | null
          last_verified_date?: string | null
          max_capacity_kw?: number | null
          max_parallel_kw?: number | null
          min_capacity_kw?: number | null
          modular_type?: string | null
          monitoring_protocol?: string | null
          power_density_kw_per_m2?: number | null
          product_series?: string
          region_availability?: string | null
          region_availability_detail?: string | null
          topology?: string | null
          updated_at?: string
          vendor_id?: string
          verification_notes?: string | null
          verification_status?: Database["public"]["Enums"]["verification_status"]
        }
        Relationships: [
          {
            foreignKeyName: "ups_products_last_verified_by_fkey"
            columns: ["last_verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ups_products_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      ups_specs: {
        Row: {
          created_at: string
          id: string
          product_id: string
          spec_group: string | null
          spec_key: string
          spec_value: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          spec_group?: string | null
          spec_key: string
          spec_value?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          spec_group?: string | null
          spec_key?: string
          spec_value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ups_specs_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "ups_products"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_saved_comparisons: {
        Row: {
          created_at: string
          id: string
          name: string
          notes: string | null
          product_ids: string[]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          product_ids: string[]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          product_ids?: string[]
          user_id?: string
        }
        Relationships: []
      }
      vendors: {
        Row: {
          country: string | null
          created_at: string
          id: string
          name: string
          notes: string | null
          website: string | null
        }
        Insert: {
          country?: string | null
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          website?: string | null
        }
        Update: {
          country?: string | null
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          website?: string | null
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
    }
    Enums: {
      app_role: "admin" | "user"
      verification_status:
        | "Draft"
        | "Verified"
        | "Pending Review"
        | "Vendor Submitted"
        | "Outdated Risk"
        | "Discontinued"
        | "Region Check Required"
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
      app_role: ["admin", "user"],
      verification_status: [
        "Draft",
        "Verified",
        "Pending Review",
        "Vendor Submitted",
        "Outdated Risk",
        "Discontinued",
        "Region Check Required",
      ],
    },
  },
} as const
