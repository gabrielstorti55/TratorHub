import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { useProducts } from '../hooks/useProducts';

export default function Rent() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    period: '',
    location: '',
  });

  // Referência para a seção de resultados
  const resultsRef = useRef<HTMLDivElement>(null);

  // Pegar parâmetros da URL quando a página carrega
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchParam = params.get('busca');
    const categoryParam = params.get('categoria');
    const periodParam = params.get('periodo');
    
    if (searchParam) setSearchTerm(searchParam);
    if (categoryParam || periodParam) {
      setFilters(prev => ({
        ...prev,
        category: categoryParam || '',
        period: periodParam || ''
      }));
    }

    // Rolar até os resultados se houver busca
    if ((searchParam || categoryParam || periodParam) && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [location]);

  const { products, loading, error } = useProducts({ 
    type: 'Aluguel',
    ...filters 
  });

  // Filtrar produtos com base na busca
  const filteredProducts = products.filter(product => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      product.title.toLowerCase().includes(searchLower) ||
      product.brand.toLowerCase().includes(searchLower) ||
      product.model.toLowerCase().includes(searchLower)
    );
  });

  // Categorias disponíveis para aluguel (excluindo Peças e Componentes)
  const categories = ['Tratores', 'Colheitadeiras', 'Implementos'];

  // Handle search submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    
    if (searchTerm) params.append('busca', searchTerm);
    if (filters.category) params.append('categoria', filters.category);
    if (filters.period) params.append('periodo', filters.period);
    
    // Atualizar URL
    navigate(`/alugar?${params.toString()}`, { replace: true });

    // Rolar até os resultados
    if (resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-gray-900">Alugar Equipamentos</h1>
      
      {/* Search Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Buscar por nome ou modelo"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
          />
          <select 
            value={filters.category}
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
            className="px-4 py-2 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
          >
            <option value="">Todas as Categorias</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <select 
            value={filters.period}
            onChange={(e) => setFilters(prev => ({ ...prev, period: e.target.value }))}
            className="px-4 py-2 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
          >
            <option value="">Período</option>
            <option value="Diário">Diário</option>
            <option value="Semanal">Semanal</option>
            <option value="Mensal">Mensal</option>
          </select>
          <button 
            type="submit"
            className="bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition flex items-center justify-center gap-2"
          >
            <Search size={20} />
            Buscar
          </button>
        </form>
      </div>

      {/* Results Section */}
      <div ref={resultsRef}>
        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Carregando produtos...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-8">
            <p>Erro ao carregar os produtos: {error}</p>
          </div>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              title={product.title}
              price={product.price.toString()}
              type={product.type}
              period={product.period}
              image={product.image_url}
              location={product.location}
              year={product.year}
            />
          ))}

          {!loading && filteredProducts.length === 0 && (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-600">Nenhum produto encontrado com os filtros selecionados.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}