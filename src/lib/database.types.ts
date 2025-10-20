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