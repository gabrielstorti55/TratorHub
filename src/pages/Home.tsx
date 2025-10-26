import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useProducts } from '../hooks/useProducts';

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const { products, loading, error } = useProducts({
    // Só buscar produtos se houver busca ou categoria selecionada
    ...(searchTerm || selectedCategory ? {
      ...(selectedCategory && { category: selectedCategory })
    } : {})
  });
  
  // Referência para a seção de resultados
  const resultsRef = useRef<HTMLDivElement>(null);

  // Get search params from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchParam = params.get('busca');
    const categoryParam = params.get('categoria');
    
    if (searchParam) setSearchTerm(searchParam);
    if (categoryParam) setSelectedCategory(categoryParam);

    // Se houver busca ou categoria selecionada, rolar até os resultados
    if ((searchParam || categoryParam) && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [location.search]);

  // Filter products based on search term and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = searchTerm === '' || 
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.model.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === '' || product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Handle search submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    
    if (searchTerm) params.append('busca', searchTerm);
    if (selectedCategory) params.append('categoria', selectedCategory);
    
    // Update URL without navigating away from home page
    const newUrl = `/${params.toString() ? `?${params.toString()}` : ''}`;
    window.history.pushState({}, '', newUrl);

    // Rolar até os resultados
    if (resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Navigate to category with filter
  const navigateToCategory = (category: string) => {
    setSelectedCategory(category);
    const params = new URLSearchParams();
    params.append('categoria', category);
    window.history.pushState({}, '', `/?${params.toString()}`);

    // Rolar até os resultados
    if (resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div>
      {/* Hero Section with Search */}
      <div className="relative bg-gray-900 text-white">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=2070&q=80"
            alt="Agricultura"
            className="w-full h-full object-cover opacity-40"
          />
        </div>
        <div className="relative container mx-auto px-4 py-24 flex items-center justify-center">
          <div className="max-w-3xl text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-100">
              Encontre as Melhores Máquinas Agrícolas
            </h1>
            <p className="text-xl mb-8">
              Compre, venda ou alugue equipamentos agrícolas de forma simples e segura
            </p>

            <form onSubmit={handleSearch} className="bg-white rounded-lg p-4 shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Buscar máquinas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                />
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                >
                  <option value="">Todas as Categorias</option>
                  <option value="Tratores">Tratores</option>
                  <option value="Colheitadeiras">Colheitadeiras</option>
                  <option value="Implementos">Implementos</option>
                  <option value="Peças e Componentes">Peças e Componentes</option>
                </select>
                <button 
                  type="submit"
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-500 transition flex items-center justify-center gap-2"
                >
                  <Search size={20} />
                  Buscar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Produtos em Destaque / Resultados da Busca */}
      <div ref={resultsRef} className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            {searchTerm || selectedCategory ? 'Resultados da Busca' : 'Destaques'}
          </h2>
          <div className="flex gap-4">
            <button 
              onClick={() => navigate('/comprar')}
              className="text-green-600 hover:text-green-500 font-semibold"
            >
              Comprar
            </button>
            <button 
              onClick={() => navigate('/alugar')}
              className="text-green-600 hover:text-green-500 font-semibold"
            >
              Alugar
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg overflow-hidden animate-pulse">
                <div className="aspect-video bg-gray-200"></div>
                <div className="p-4 space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="flex justify-between items-end">
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                      <div className="h-6 bg-gray-200 rounded w-24"></div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-8">
            <p>{error}</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.slice(0, 8).map((product) => (
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
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600">Nenhum produto encontrado com os filtros selecionados.</p>
          </div>
        )}
      </div>
    </div>
  );
}