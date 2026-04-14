export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '13.0.5';
  };
  galaxy: {
    CompositeTypes: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    Functions: {
      galaxy_reset: { Args: never; Returns: undefined };
      refresh_system_bounds: { Args: never; Returns: undefined };
      systems_in_view: {
        Args: { max_x: number; max_y: number; min_x: number; min_y: number };
        Returns: {
          sector_symbol: null | string;
          symbol: string;
          type: null | string;
          x: number;
          y: number;
        }[];
        SetofOptions: {
          from: '*';
          isOneToOne: false;
          isSetofReturn: true;
          to: 'systems';
        };
      };
    };
    Tables: {
      sync_state: {
        Insert: {
          done?: boolean;
          id?: boolean;
          last_error?: null | string;
          last_page_synced?: number;
          last_reset_date?: null | string;
          last_success_at?: null | string;
          next_reset_at?: null | string;
          running?: boolean;
          running_started_at?: null | string;
          updated_at?: string;
        };
        Relationships: [];
        Row: {
          done: boolean;
          id: boolean;
          last_error: null | string;
          last_page_synced: number;
          last_reset_date: null | string;
          last_success_at: null | string;
          next_reset_at: null | string;
          running: boolean;
          running_started_at: null | string;
          updated_at: string;
        };
        Update: {
          done?: boolean;
          id?: boolean;
          last_error?: null | string;
          last_page_synced?: number;
          last_reset_date?: null | string;
          last_success_at?: null | string;
          next_reset_at?: null | string;
          running?: boolean;
          running_started_at?: null | string;
          updated_at?: string;
        };
      };
      systems: {
        Insert: {
          sector_symbol?: null | string;
          symbol: string;
          type?: null | string;
          x: number;
          y: number;
        };
        Relationships: [];
        Row: {
          sector_symbol: null | string;
          symbol: string;
          type: null | string;
          x: number;
          y: number;
        };
        Update: {
          sector_symbol?: null | string;
          symbol?: string;
          type?: null | string;
          x?: number;
          y?: number;
        };
      };
      systems_meta: {
        Insert: {
          id?: boolean;
          max_x: number;
          max_y: number;
          min_x: number;
          min_y: number;
          updated_at?: string;
        };
        Relationships: [];
        Row: {
          id: boolean;
          max_x: number;
          max_y: number;
          min_x: number;
          min_y: number;
          updated_at: string;
        };
        Update: {
          id?: boolean;
          max_x?: number;
          max_y?: number;
          min_x?: number;
          min_y?: number;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
  };
  public: {
    CompositeTypes: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
  };
};

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type Json =
  | boolean
  | Json[]
  | null
  | number
  | string
  | { [key: string]: Json | undefined };

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  'public'
>];

export const Constants = {
  galaxy: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const;
