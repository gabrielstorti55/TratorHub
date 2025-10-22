import { useEffect, useState, useCallback } from 'react';
import { supabase, handleSupabaseError } from '../lib/supabase';

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  type: 'Venda' | 'Aluguel';
  period?: string;
  brand: string;
  model: string;
  year: string;
  location: string;
  category: string;
  image_url: string;
  user_id: string;
  created_at: string;
  hours?: number | null;
  power?: number | null;
  implement_type?: string | null;
  work_width?: number | null;
  part_type?: string | null;
  part_condition?: 'Nova' | 'Usada' | 'Recondicionada' | null;
  part_number?: string | null;
}

interface UseProductsOptions {
  type?: 'Venda' | 'Aluguel';
  brand?: string;
  category?: string;
  location?: string;
  maxPrice?: number;
  userId?: string;
}

export function useProducts(options: UseProductsOptions = {}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async (retryCount = 0) => {
    const maxRetries = 3;
    const baseDelay = 1000; // 1 segundo

    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      // Aplicar filtros apenas se estiverem definidos
      if (options.type) {
        // @ts-expect-error - Supabase type issue
        query = query.eq('type', options.type);
      }
      if (options.brand) {
        // @ts-expect-error - Supabase type issue
        query = query.eq('brand', options.brand);
      }
      if (options.category) {
        // @ts-expect-error - Supabase type issue
        query = query.eq('category', options.category);
      }
      if (options.location) {
        // @ts-expect-error - Supabase type issue
        query = query.eq('location', options.location);
      }
      if (options.maxPrice) {
        query = query.lte('price', options.maxPrice);
      }
      if (options.userId) {
        console.log('🔍 Filtrando produtos por userId:', options.userId);
        // @ts-expect-error - Supabase type issue
        query = query.eq('user_id', options.userId);
      }

      const { data, error: queryError } = await query;

      if (queryError) throw queryError;

      console.log('📦 Produtos encontrados:', data?.length || 0);
      if (options.userId) {
        console.log('✅ Produtos do usuário:', (data as any)?.map((p: any) => ({ title: p.title, user_id: p.user_id })));
      }

      setProducts((data as any) || []);
      setLoading(false);
      setError(null);
    } catch (err) {
      console.error('Erro ao buscar produtos:', err);
      
      const isConnectionError = err instanceof Error && (
        err.message.includes('Failed to fetch') ||
        err.message.includes('NetworkError') ||
        err.message.includes('network timeout') ||
        err.message.includes('Network request failed') ||
        err.message.includes('timeout')
      );

      if (isConnectionError && retryCount < maxRetries) {
        const delay = baseDelay * Math.pow(2, retryCount);
        setError(
          `Erro de conexão. Tentando reconectar... ` +
          `(tentativa ${retryCount + 1} de ${maxRetries} em ${Math.round(delay / 1000)}s)`
        );
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchProducts(retryCount + 1);
      }

      setError(handleSupabaseError(err));
      setLoading(false);
    }
  }, [options.type, options.brand, options.category, options.location, options.maxPrice, options.userId]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, loading, error, refetch: fetchProducts };
}