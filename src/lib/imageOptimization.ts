/**
 * Helper para otimização automática de imagens
 * Usa transformações do Supabase Storage ou fallback para parâmetros de URL
 */

interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
}

/**
 * Otimiza URL de imagem do Supabase Storage
 * Adiciona parâmetros de transformação para melhor performance
 */
export function optimizeImageUrl(
  url: string, 
  options: ImageOptimizationOptions = {}
): string {
  if (!url) return url;

  // Configurações padrão
  const {
    width,
    height,
    quality = 80,
    format = 'webp'
  } = options;

  // Se for imagem do Supabase, usar transformações
  if (url.includes('supabase')) {
    const urlObj = new URL(url);
    
    // Adicionar parâmetros de transformação
    if (width) urlObj.searchParams.set('width', width.toString());
    if (height) urlObj.searchParams.set('height', height.toString());
    urlObj.searchParams.set('quality', quality.toString());
    urlObj.searchParams.set('format', format);
    
    return urlObj.toString();
  }

  // Para outras imagens, retornar sem modificação
  return url;
}

/**
 * Gera srcset para imagens responsivas
 */
export function generateSrcSet(url: string): string {
  if (!url || !url.includes('supabase')) return '';

  const sizes = [320, 640, 768, 1024, 1280, 1920];
  
  return sizes
    .map(size => `${optimizeImageUrl(url, { width: size })} ${size}w`)
    .join(', ');
}

/**
 * Pré-carregar imagem crítica
 */
export function preloadImage(url: string, options: ImageOptimizationOptions = {}): void {
  const optimizedUrl = optimizeImageUrl(url, options);
  
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = optimizedUrl;
  
  document.head.appendChild(link);
}

/**
 * Lazy load de imagem com Intersection Observer
 */
export function lazyLoadImage(
  imgElement: HTMLImageElement, 
  src: string,
  options: ImageOptimizationOptions = {}
): void {
  const optimizedSrc = optimizeImageUrl(src, options);
  
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          imgElement.src = optimizedSrc;
          imgElement.classList.add('loaded');
          observer.unobserve(imgElement);
        }
      });
    }, {
      rootMargin: '50px' // Começar a carregar 50px antes de aparecer
    });
    
    observer.observe(imgElement);
  } else {
    // Fallback para navegadores antigos
    imgElement.src = optimizedSrc;
  }
}
