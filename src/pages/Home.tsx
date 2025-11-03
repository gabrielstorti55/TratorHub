import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useProducts } from '../hooks/useProducts';
import SEO from '../components/SEO';

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { products, loading, error } = useProducts({
    // Só buscar produtos se houver busca ou categoria selecionada
    ...(searchTerm || selectedCategory ? {
      ...(selectedCategory && { category: selectedCategory })
    } : {})
  });
  
  // Referência para a seção de resultados
  const resultsRef = useRef<HTMLDivElement>(null);

  // Imagens do carrossel
  const carouselImages = [
    '/maos-que-estao-escolhendo-graos-de-cafe-cafeeiro.jpg',
    '/martin-derksen-PF5tnMB4phE-unsplash.jpg',
    '/projeto-cafe-gato-mourisco-gckFDCVTVy4-unsplash.jpg',
  ];

  // Auto-play do carrossel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === carouselImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // Muda a cada 5 segundos

    return () => clearInterval(interval);
  }, []);

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === carouselImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? carouselImages.length - 1 : prevIndex - 1
    );
  };

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

  return (
    <div>
      {/* SEO Meta Tags */}
      <SEO 
        title="Comprar, Vender e Alugar Máquinas Agrícolas"
        description="TratorHub: A maior plataforma de compra, venda e aluguel de máquinas e implementos agrícolas do Brasil. Encontre tratores, colheitadeiras e equipamentos com os melhores preços."
        keywords="comprar trator, vender máquinas agrícolas, alugar colheitadeira, implementos agrícolas, equipamentos agrícolas usados, tratores novos, máquinas agrícolas Brasil"
        canonical="https://www.tratorhub.com.br/"
      />
      
      {/* Hero Section with Search and Carousel */}
      <div className="relative bg-gray-900 text-white">
        {/* Carrossel de Imagens */}
        <div className="absolute inset-0">
          {carouselImages.map((image, index) => (
            <picture key={index}>
              {/* WebP para navegadores modernos */}
              <source 
                srcSet={`${image.replace(/\.(jpg|jpeg)$/i, '.webp')} 1x, ${image.replace(/\.(jpg|jpeg)$/i, '@2x.webp')} 2x`}
                type="image/webp"
              />
              {/* Fallback JPEG otimizado */}
              <img
                src={image}
                srcSet={`${image} 1x, ${image.replace(/\.jpg$/i, '@2x.jpg')} 2x`}
                alt={`Agricultura brasileira: plantações e maquinário agrícola moderno - ${index + 1}`}
                className={`w-full h-full object-cover absolute inset-0 transition-opacity duration-[2000ms] ease-in-out ${
                  index === currentImageIndex ? 'opacity-60' : 'opacity-0'
                }`}
                width="1920"
                height="1080"
                loading={index === 0 ? 'eager' : 'lazy'}
                decoding={index === 0 ? 'sync' : 'async'}
                fetchPriority={index === 0 ? 'high' : 'low'}
              />
            </picture>
          ))}
        </div>

        {/* Botões de navegação - Áreas de toque maiores (min 48x48px - WCAG) */}
        <button
          onClick={prevImage}
          className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-10 bg-black/30 hover:bg-black/50 text-white p-3 md:p-4 rounded-full transition-colors min-w-[48px] min-h-[48px] flex items-center justify-center"
          aria-label="Imagem anterior do carrossel"
          type="button"
        >
          <ChevronLeft size={32} aria-hidden="true" />
        </button>
        <button
          onClick={nextImage}
          className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-10 bg-black/30 hover:bg-black/50 text-white p-3 md:p-4 rounded-full transition-colors min-w-[48px] min-h-[48px] flex items-center justify-center"
          aria-label="Próxima imagem do carrossel"
          type="button"
        >
          <ChevronRight size={32} aria-hidden="true" />
        </button>

        {/* Indicadores - Áreas de toque maiores */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-3">
          {carouselImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`rounded-full transition-all min-w-[48px] min-h-[48px] flex items-center justify-center p-2 ${
                index === currentImageIndex ? 'bg-white/30' : 'bg-transparent'
              }`}
              aria-label={`Ir para imagem ${index + 1} de ${carouselImages.length}`}
              aria-current={index === currentImageIndex}
              type="button"
            >
              <span 
                className={`block rounded-full transition-all ${
                  index === currentImageIndex ? 'bg-white w-8 h-3' : 'bg-white/50 w-3 h-3'
                }`}
                aria-hidden="true"
              />
            </button>
          ))}
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
                <div>
                  <label htmlFor="search-input" className="sr-only">
                    Buscar máquinas agrícolas
                  </label>
                  <input
                    id="search-input"
                    type="text"
                    placeholder="Buscar máquinas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                    aria-label="Buscar máquinas agrícolas"
                  />
                </div>
                <div>
                  <label htmlFor="category-select" className="sr-only">
                    Selecionar categoria
                  </label>
                  <select 
                    id="category-select"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                    aria-label="Filtrar por categoria"
                  >
                    <option value="">Todas as Categorias</option>
                    <option value="Tratores">Tratores</option>
                    <option value="Colheitadeiras">Colheitadeiras</option>
                    <option value="Implementos">Implementos</option>
                    <option value="Peças e Componentes">Peças e Componentes</option>
                  </select>
                </div>
                <button 
                  type="submit"
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-500 transition flex items-center justify-center gap-2"
                  aria-label="Buscar produtos"
                >
                  <Search size={20} aria-hidden="true" />
                  Buscar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Seção de Patrocinadores/Banners */}
      <div className="bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6">
            <p className="text-sm text-gray-500 uppercase tracking-wide">Patrocinadores</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Banner 1 - Exemplo */}
            <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              <a href="#" target="_blank" rel="noopener noreferrer" className="block">
                <div className="aspect-[16/9] bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center">
                  <div className="text-center p-6">
                    <p className="text-2xl font-bold text-green-600 mb-2">Seu Banner Aqui</p>
                    <p className="text-sm text-gray-600">Anuncie sua marca</p>
                  </div>
                </div>
              </a>
            </div>
            
            {/* Banner 2 - Exemplo */}
            <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              <a href="#" target="_blank" rel="noopener noreferrer" className="block">
                <div className="aspect-[16/9] bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
                  <div className="text-center p-6">
                    <p className="text-2xl font-bold text-blue-600 mb-2">Espaço Disponível</p>
                    <p className="text-sm text-gray-600">Entre em contato</p>
                  </div>
                </div>
              </a>
            </div>
            
            {/* Banner 3 - Exemplo */}
            <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              <a href="#" target="_blank" rel="noopener noreferrer" className="block">
                <div className="aspect-[16/9] bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center">
                  <div className="text-center p-6">
                    <p className="text-2xl font-bold text-orange-600 mb-2">Divulgue Aqui</p>
                    <p className="text-sm text-gray-600">Alcance milhares</p>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Produtos em Destaque / Resultados da Busca */}
      <div ref={resultsRef} className="container mx-auto px-4 py-12">
        <div className="flex items-center gap-4 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mr-4">
            {searchTerm || selectedCategory ? 'Resultados da Busca' : 'Destaques'}
          </h2>
          <div className="flex flex-col w-full max-w-xs gap-3 sm:flex-row sm:w-auto">
            <button
              onClick={() => navigate('/comprar')}
              className="flex items-center justify-center gap-2 bg-green-100 text-green-700 px-5 py-3 rounded-lg font-semibold hover:bg-green-300 transition w-full"
              aria-label="Ir para página de compra"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.35 2.7A2 2 0 007.6 18h8.8a2 2 0 001.95-2.3L17 13M7 13V6h13" /></svg>
              Comprar
            </button>
            <button
              onClick={() => navigate('/alugar')}
              className="flex items-center justify-center gap-2 bg-gray-300 text-gray-700 px-5 py-3 rounded-lg font-semibold hover:bg-gray-400 transition w-full"
              aria-label="Ir para página de aluguel"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7V3a1 1 0 00-1-1H9a1 1 0 00-1 1v4M5 8h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V10a2 2 0 012-2z" /></svg>
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
                brand={product.brand}
                model={product.model}
                category={product.category}
                fullProduct={product}
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