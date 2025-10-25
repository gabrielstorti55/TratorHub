/**
 * Hook para prefetch de rotas/páginas
 * Carrega páginas em segundo plano para navegação mais rápida
 */

import { useEffect } from 'react';

// Lista de rotas para prefetch
const PREFETCH_ROUTES = [
  '/comprar',
  '/alugar',
  '/vender',
  '/como-funciona',
];

/**
 * Hook para fazer prefetch de rotas comuns
 * Usa requestIdleCallback para não impactar performance
 */
export function usePrefetchRoutes() {
  useEffect(() => {
    // Verificar se o navegador suporta requestIdleCallback
    const requestIdleCallback = 
      window.requestIdleCallback || 
      ((cb) => setTimeout(cb, 1));

    // Fazer prefetch quando o navegador estiver ocioso
    requestIdleCallback(() => {
      PREFETCH_ROUTES.forEach((route) => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = route;
        link.as = 'document';
        document.head.appendChild(link);
      });
    });
  }, []);
}

/**
 * Hook para fazer prefetch de dados de uma rota específica
 */
export function usePrefetchData(fetchFn: () => Promise<any>, delay = 2000) {
  useEffect(() => {
    const requestIdleCallback = 
      window.requestIdleCallback || 
      ((cb) => setTimeout(cb, 1));

    const timeoutId = setTimeout(() => {
      requestIdleCallback(() => {
        fetchFn().catch((error) => {
          console.log('Prefetch falhou (não é crítico):', error);
        });
      });
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [fetchFn, delay]);
}

/**
 * Componente Link com prefetch automático no hover
 */
import { Link, LinkProps } from 'react-router-dom';
import { useState, useCallback } from 'react';

interface PrefetchLinkProps extends LinkProps {
  prefetchDelay?: number;
}

export function PrefetchLink({ 
  to, 
  prefetchDelay = 100,
  onMouseEnter,
  ...props 
}: PrefetchLinkProps) {
  const [prefetched, setPrefetched] = useState(false);

  const handleMouseEnter = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!prefetched) {
      setTimeout(() => {
        // Criar link de prefetch
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = typeof to === 'string' ? to : to.pathname || '';
        link.as = 'document';
        document.head.appendChild(link);
        
        setPrefetched(true);
      }, prefetchDelay);
    }
    
    onMouseEnter?.(e);
  }, [prefetched, to, prefetchDelay, onMouseEnter]);

  return <Link to={to} onMouseEnter={handleMouseEnter} {...props} />;
}
