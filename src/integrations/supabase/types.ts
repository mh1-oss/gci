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
      banners: {
        Row: {
          created_at: string | null
          cta_link: string | null
          cta_text: string | null
          id: string
          image: string | null
          media_type: string | null
          order_index: number | null
          slider_height: number | null
          subtitle: string | null
          text_color: string | null
          title: string
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          created_at?: string | null
          cta_link?: string | null
          cta_text?: string | null
          id: string
          image?: string | null
          media_type?: string | null
          order_index?: number | null
          slider_height?: number | null
          subtitle?: string | null
          text_color?: string | null
          title: string
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          created_at?: string | null
          cta_link?: string | null
          cta_text?: string | null
          id?: string
          image?: string | null
          media_type?: string | null
          order_index?: number | null
          slider_height?: number | null
          subtitle?: string | null
          text_color?: string | null
          title?: string
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      company_info: {
        Row: {
          about: string | null
          contact: Json | null
          created_at: string
          features_description: string | null
          features_title: string | null
          id: number
          logo_url: string | null
          name: string
          reviews_description: string | null
          reviews_title: string | null
          slider_timing: number | null
          slogan: string | null
          updated_at: string
        }
        Insert: {
          about?: string | null
          contact?: Json | null
          created_at?: string
          features_description?: string | null
          features_title?: string | null
          id?: number
          logo_url?: string | null
          name: string
          reviews_description?: string | null
          reviews_title?: string | null
          slider_timing?: number | null
          slogan?: string | null
          updated_at?: string
        }
        Update: {
          about?: string | null
          contact?: Json | null
          created_at?: string
          features_description?: string | null
          features_title?: string | null
          id?: number
          logo_url?: string | null
          name?: string
          reviews_description?: string | null
          reviews_title?: string | null
          slider_timing?: number | null
          slogan?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      features: {
        Row: {
          created_at: string
          description: string
          icon: string | null
          id: string
          order_index: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          icon?: string | null
          id?: string
          order_index?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          icon?: string | null
          id?: string
          order_index?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          product_id: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          product_id: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          customer_id: string | null
          id: string
          status: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          id?: string
          status?: string
          total_amount: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          id?: string
          status?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      paint_calculator_settings: {
        Row: {
          coverage_per_liter: number
          created_at: string
          doors_area: number
          id: number
          layers_default: number
          updated_at: string
          windows_area: number
        }
        Insert: {
          coverage_per_liter?: number
          created_at?: string
          doors_area?: number
          id?: number
          layers_default?: number
          updated_at?: string
          windows_area?: number
        }
        Update: {
          coverage_per_liter?: number
          created_at?: string
          doors_area?: number
          id?: number
          layers_default?: number
          updated_at?: string
          windows_area?: number
        }
        Relationships: []
      }
      products: {
        Row: {
          category_id: string | null
          cost_price: number
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          price: number
          stock_quantity: number
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          cost_price: number
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          price: number
          stock_quantity?: number
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          cost_price?: number
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          price?: number
          stock_quantity?: number
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          content: string
          created_at: string
          customer_name: string
          id: string
          image_url: string | null
          is_approved: boolean | null
          position: string | null
          rating: number
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          customer_name: string
          id?: string
          image_url?: string | null
          is_approved?: boolean | null
          position?: string | null
          rating?: number
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          customer_name?: string
          id?: string
          image_url?: string | null
          is_approved?: boolean | null
          position?: string | null
          rating?: number
          updated_at?: string
        }
        Relationships: []
      }
      sale_items: {
        Row: {
          created_at: string
          id: string
          product_id: string
          quantity: number
          sale_id: string
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          quantity: number
          sale_id: string
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          quantity?: number
          sale_id?: string
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "sale_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_items_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          created_at: string
          customer_email: string | null
          customer_name: string
          customer_phone: string | null
          id: string
          total_amount: number
        }
        Insert: {
          created_at?: string
          customer_email?: string | null
          customer_name: string
          customer_phone?: string | null
          id?: string
          total_amount: number
        }
        Update: {
          created_at?: string
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string | null
          id?: string
          total_amount?: number
        }
        Relationships: []
      }
      stock_transactions: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          product_id: string
          quantity: number
          transaction_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          product_id: string
          quantity: number
          transaction_type: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          product_id?: string
          quantity?: number
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_transactions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
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
          role?: Database["public"]["Enums"]["app_role"]
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
      get_all_categories: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }[]
      }
      get_all_products: {
        Args: Record<PropertyKey, never>
        Returns: {
          category_id: string | null
          cost_price: number
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          price: number
          stock_quantity: number
          updated_at: string
        }[]
      }
      get_all_reviews: {
        Args: Record<PropertyKey, never>
        Returns: {
          content: string
          created_at: string
          customer_name: string
          id: string
          image_url: string | null
          is_approved: boolean | null
          position: string | null
          rating: number
          updated_at: string
        }[]
      }
      get_company_info: {
        Args: Record<PropertyKey, never>
        Returns: {
          about: string | null
          contact: Json | null
          created_at: string
          features_description: string | null
          features_title: string | null
          id: number
          logo_url: string | null
          name: string
          reviews_description: string | null
          reviews_title: string | null
          slider_timing: number | null
          slogan: string | null
          updated_at: string
        }[]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
