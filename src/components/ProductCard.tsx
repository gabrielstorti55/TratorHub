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

  // Formatar valor do produto
  const formattedPrice = Number(price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div 
      className="bg-white rounded-lg overflow-hidden hover:shadow-lg transition group cursor-pointer relative"
      onClick={() => navigate(`/produto/${id}`)}
      role="article"
      aria-label={`${title} - ${type} por ${formattedPrice} em ${location}`}
    >
      {/* ...existing code... */}
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
              {formattedPrice}
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