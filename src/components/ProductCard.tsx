import { memo } from 'react';
import { MapPin, Calendar, Scale } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { optimizeImageUrl, generateSrcSet } from '../lib/imageOptimization';
import { useCompare } from '../contexts/CompareContext';
import type { Product } from '../hooks/useProducts';

interface ProductCardProps {
  id: string;
  title: string;
  price: string;
  type: 'Venda' | 'Aluguel';
  period?: string;
  image: string;
  location: string;
  year: string;
  brand?: string;
  model?: string;
  category?: string;
  fullProduct?: Product;
}

const ProductCard = memo(function ProductCard({
  id,
  title,
  price,
  type,
  period,
  image,
  location,
  year,
  fullProduct
}: ProductCardProps) {
  const navigate = useNavigate();
  const { addToCompare, removeFromCompare, isInCompare, compareProducts, maxCompareItems } = useCompare();

  const inCompare = isInCompare(id);
  const canAddMore = compareProducts.length < maxCompareItems;

  // Otimizar URL da imagem
  const optimizedImage = optimizeImageUrl(image, { 
    width: 400, 
    quality: 80,
    format: 'webp' 
  });
  
  const imageSrcSet = generateSrcSet(image);

  const handleCompareToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (inCompare) {
      removeFromCompare(id);
    } else if (canAddMore && fullProduct) {
      addToCompare(fullProduct);
    }
  };

  return (
    <div 
      className="bg-white rounded-lg overflow-hidden hover:shadow-lg transition group cursor-pointer relative"
      onClick={() => navigate(`/produto/${id}`)}
      role="article"
      aria-label={`${title} - ${type} por R$ ${price} em ${location}`}
    >
      {/* Checkbox de Comparação */}
      {fullProduct && type === 'Venda' && (
        <div className="absolute top-3 left-3 z-20">
          <button
            onClick={handleCompareToggle}
            disabled={!canAddMore && !inCompare}
            className={`
              flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold shadow-lg
              transition-all transform hover:scale-105 backdrop-blur-sm
              ${inCompare 
                ? 'bg-green-600 text-white ring-2 ring-green-400' 
                : canAddMore
                  ? 'bg-white/95 text-gray-700 hover:bg-green-50 hover:text-green-700 ring-1 ring-gray-300'
                  : 'bg-gray-300/80 text-gray-500 cursor-not-allowed'
              }
            `}
            aria-label={inCompare ? 'Remover da comparação' : 'Adicionar à comparação'}
            title={
              inCompare 
                ? 'Remover da comparação' 
                : !canAddMore 
                  ? `Máximo de ${maxCompareItems} produtos para comparar`
                  : 'Adicionar à comparação'
            }
          >
            <Scale size={14} className={inCompare ? 'animate-pulse' : ''} />
            {inCompare ? 'Na comparação' : 'Comparar'}
          </button>
        </div>
      )}
      
      <div className="relative aspect-video bg-gray-200">
        <img
          src={optimizedImage}
          srcSet={imageSrcSet}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          alt={`${title} - Máquina agrícola ${type === 'Venda' ? 'à venda' : 'para aluguel'} em ${location}`}
          loading="lazy"
          width="400"
          height="225"
          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
        />
        <div className="absolute top-3 right-3 z-10">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-md ${
            type === 'Venda'
              ? 'bg-green-600 text-white'
              : 'bg-gray-900 text-white'
          }`}>
            {type}
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition">
          {title}
        </h3>
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
          <div className="flex items-center gap-1">
            <MapPin size={16} aria-hidden="true" />
            <span>{location}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar size={16} aria-hidden="true" />
            <span>{year}</span>
          </div>
        </div>
        <div className="flex justify-between items-end">
          <div>
            <span className="text-sm text-gray-500">
              {type === 'Venda' ? 'Valor' : period ? `${period}` : 'Diária'}
            </span>
            <p className="text-xl font-bold text-gray-900">
              R$ {price}
            </p>
          </div>
          <button 
            className="text-green-600 font-semibold text-sm hover:text-green-500 transition"
            aria-label={`Ver detalhes de ${title}`}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/produto/${id}`);
            }}
          >
            Ver detalhes
          </button>
        </div>
      </div>
    </div>
  );
});

export default ProductCard;