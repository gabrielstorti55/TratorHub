export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          price: number;
          type: 'Venda' | 'Aluguel';
          period: 'Diário' | 'Semanal' | 'Mensal' | null;
          brand: string;
          model: string;
          year: string;
          location: string;
          category: string;
          image_url: string;
          user_id: string;
          created_at: string;
          updated_at: string;
          status: 'available' | 'sold' | 'rented';
          hours: number | null;
          power: number | null;
          implement_type: string | null;
          work_width: number | null;
          part_type: string | null;
          part_condition: 'Nova' | 'Usada' | 'Recondicionada' | null;
          part_number: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          price: number;
          type: 'Venda' | 'Aluguel';
          period?: 'Diário' | 'Semanal' | 'Mensal' | null;
          brand: string;
          model: string;
          year: string;
          location: string;
          category: string;
          image_url: string;
          user_id: string;
          created_at?: string;
          updated_at?: string;
          status?: 'available' | 'sold' | 'rented';
          hours?: number | null;
          power?: number | null;
          implement_type?: string | null;
          work_width?: number | null;
          part_type?: string | null;
          part_condition?: 'Nova' | 'Usada' | 'Recondicionada' | null;
          part_number?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          price?: number;
          type?: 'Venda' | 'Aluguel';
          period?: 'Diário' | 'Semanal' | 'Mensal' | null;
          brand?: string;
          model?: string;
          year?: string;
          location?: string;
          category?: string;
          image_url?: string;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
          status?: 'available' | 'sold' | 'rented';
          hours?: number | null;
          power?: number | null;
          implement_type?: string | null;
          work_width?: number | null;
          part_type?: string | null;
          part_condition?: 'Nova' | 'Usada' | 'Recondicionada' | null;
          part_number?: string | null;
        };
      };
      product_images: {
        Row: {
          id: string;
          product_id: string;
          image_url: string;
          position: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          image_url: string;
          position: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          image_url?: string;
          position?: number;
          created_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          user_id: string;
          full_name: string;
          cpf_cnpj: string;
          phone: string;
          address: string;
          city: string;
          state: string;
          postal_code: string;
          company_name: string | null;
          bio: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          full_name: string;
          cpf_cnpj: string;
          phone: string;
          address: string;
          city: string;
          state: string;
          postal_code: string;
          company_name?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          full_name?: string;
          cpf_cnpj?: string;
          phone?: string;
          address?: string;
          city?: string;
          state?: string;
          postal_code?: string;
          company_name?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

// Helper types para facilitar o uso
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];