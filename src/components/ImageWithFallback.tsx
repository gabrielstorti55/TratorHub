import { useState, ImgHTMLAttributes } from 'react';
import { ImageOff } from 'lucide-react';

interface ImageWithFallbackProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  width?: number;
  height?: number;
}

/**
 * Componente de imagem otimizado com:
 * - Suporte a WebP/AVIF com fallback
 * - Lazy loading nativo
 * - Loading placeholder
 * - Tratamento de erros
 * - Dimensões explícitas (evita CLS)
 */
export default function ImageWithFallback({ 
  src, 
  alt, 
  fallbackSrc,
  className = '',
  width,
  height,
  loading = 'lazy',
  decoding = 'async',
  ...props 
}: ImageWithFallbackProps) {
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = () => {
    setError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  // Gera srcset para diferentes densidades de pixel
  const generateSrcSet = (baseSrc: string) => {
    // Verifica se a imagem suporta transformação (ex: Supabase Storage)
    if (baseSrc.includes('supabase.co')) {
      return `${baseSrc}?width=${width}&quality=80 1x, ${baseSrc}?width=${(width || 800) * 2}&quality=80 2x`;
    }
    return undefined;
  };

  if (error && !fallbackSrc) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-200 ${className}`}
        style={{ width, height }}
        role="img"
        aria-label={alt}
      >
        <div className="text-center text-gray-400">
          <ImageOff size={48} className="mx-auto mb-2" aria-hidden="true" />
          <p className="text-xs">Imagem indisponível</p>
        </div>
      </div>
    );
  }

  const imageSrc = error && fallbackSrc ? fallbackSrc : src;
  const webpSrc = imageSrc.replace(/\.(jpg|jpeg|png)$/i, '.webp');

  return (
    <div className="relative" style={{ width, height }}>
      {isLoading && (
        <div 
          className={`absolute inset-0 bg-gray-200 animate-pulse ${className}`}
          aria-hidden="true"
        />
      )}
      <picture>
        {/* Tenta carregar WebP primeiro (melhor compressão) */}
        <source 
          srcSet={webpSrc} 
          type="image/webp"
        />
        {/* Fallback para formato original */}
        <img
          src={imageSrc}
          srcSet={generateSrcSet(imageSrc)}
          alt={alt}
          width={width}
          height={height}
          loading={loading}
          decoding={decoding}
          onError={handleError}
          onLoad={handleLoad}
          className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          {...props}
        />
      </picture>
    </div>
  );
}
