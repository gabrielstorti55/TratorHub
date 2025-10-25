import { useEffect, useState, useCallback, useMemo } from 'react';
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

// Cache simples para evitar requisições duplicadas
const productCache = new Map<string, { data: Product[], timestamp: number }>();
const CACHE_DURATION = 30000; // 30 segundos

export function useProducts(options: UseProductsOptions = {}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoizar a chave do cache baseada nas opções
  const cacheKey = useMemo(() => {
    return JSON.stringify(options);
  }, [options.type, options.brand, options.category, options.location, options.maxPrice, options.userId]);

  const fetchProducts = useCallback(async (retryCount = 0, skipCache = false) => {
    const maxRetries = 3;
    const baseDelay = 1000;

    // Verificar cache primeiro
    if (!skipCache) {
      const cached = productCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log('📦 Usando produtos do cache');
        setProducts(cached.data);
        setLoading(false);
        return;
      }
    }

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
        // @ts-expect-error - Supabase type issue
        query = query.eq('user_id', options.userId);
      }

      const { data, error: queryError } = await query;

      if (queryError) throw queryError;

      const productsData = (data as any) || [];
      
      // Salvar no cache
      productCache.set(cacheKey, {
        data: productsData,
        timestamp: Date.now()
      });

      setProducts(productsData);
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
        return fetchProducts(retryCount + 1, skipCache);
      }

      setError(handleSupabaseError(err));
      setLoading(false);
    }
  }, [cacheKey, options.type, options.brand, options.category, options.location, options.maxPrice, options.userId]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Função para forçar atualização (sem cache)
  const refetch = useCallback(() => {
    return fetchProducts(0, true);
  }, [fetchProducts]);

  return { products, loading, error, refetch };
}