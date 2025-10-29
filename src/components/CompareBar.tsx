import { X, Scale, ArrowRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCompare } from '../contexts/CompareContext';

export default function CompareBar() {
  const { compareProducts, removeFromCompare, clearCompare } = useCompare();
  const navigate = useNavigate();
  const location = useLocation();

  // Não mostrar se não houver produtos
  if (compareProducts.length === 0) {
    return null;
  }

  // Esconder no mobile quando estiver na página de comparação
  const isComparePage = location.pathname === '/comparar';
  if (isComparePage) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-green-600 shadow-2xl transform transition-transform duration-300 animate-slide-up">
      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
        {/* Mobile Compact Layout */}
        <div className="flex sm:hidden items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Scale className="text-green-600" size={18} />
            <span className="font-semibold text-gray-900 text-sm">
              ({compareProducts.length})
            </span>
          </div>

          <div className="flex gap-1 overflow-x-auto scrollbar-hide flex-1 max-w-[140px]">
            {compareProducts.map((product) => (
              <div key={product.id} className="relative flex-shrink-0">
                <img
                  src={product.image_url}
                  alt={product.title}
                  className="w-10 h-10 object-cover rounded border-2 border-gray-200"
                />
                <button
                  onClick={() => removeFromCompare(product.id)}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 shadow-md"
                  aria-label={`Remover ${product.title}`}
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={clearCompare}
              className="px-2 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900"
            >
              Limpar
            </button>
            <button
              onClick={() => navigate('/comparar')}
              disabled={compareProducts.length < 2}
              className={`
                flex items-center gap-1 px-3 py-1.5 rounded-lg font-semibold text-xs
                transition-all shadow-md
                ${compareProducts.length >= 2
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              Comparar
              <ArrowRight size={12} />
            </button>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden sm:flex items-center justify-between gap-4">
          {/* Produtos selecionados */}
          <div className="flex items-center gap-3 flex-1 overflow-x-auto">
            <div className="flex items-center gap-2 flex-shrink-0">
              <Scale className="text-green-600" size={20} />
              <span className="font-semibold text-gray-900">
                Comparar ({compareProducts.length})
              </span>
            </div>
            
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {compareProducts.map((product) => (
                <div
                  key={product.id}
                  className="relative flex-shrink-0 group"
                >
                  <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 pr-8">
                    <img
                      src={product.image_url}
                      alt={product.title}
                      className="w-10 h-10 object-cover rounded"
                    />
                    <div className="hidden md:block max-w-[150px]">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {product.title}
                      </p>
                      <p className="text-xs text-gray-600">
                        R$ {product.price.toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCompare(product.id)}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition"
                    aria-label={`Remover ${product.title} da comparação`}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Ações */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={clearCompare}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition"
            >
              Limpar
            </button>
            <button
              onClick={() => navigate('/comparar')}
              disabled={compareProducts.length < 2}
              className={`
                flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-sm
                transition-all transform hover:scale-105 shadow-lg
                ${compareProducts.length >= 2
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              Comparar
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Hint */}
        {compareProducts.length === 1 && (
          <p className="text-xs text-gray-500 mt-2 text-center">
            Adicione pelo menos mais um produto para comparar
          </p>
        )}
      </div>
    </div>
  );
}
