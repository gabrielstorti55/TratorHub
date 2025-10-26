import { useState, useEffect, useRef } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { useProducts } from '../hooks/useProducts';

interface State {
  id: number;
  sigla: string;
  nome: string;
}

interface City {
  id: number;
  nome: string;
}

export default function Buy() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('recent');
  const [filters, setFilters] = useState({
    category: '',
    brand: '',
    minPrice: 0,
    maxPrice: 0,
    minYear: 0,
    maxYear: new Date().getFullYear(),
    maxHours: 0,
    location: '',
  });

  // Estados e cidades para filtro de localização
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  // Referência para a seção de resultados
  const resultsRef = useRef<HTMLDivElement>(null);

  // Pegar parâmetros da URL quando a página carrega
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchParam = params.get('busca');
    const categoryParam = params.get('categoria');
    
    if (searchParam) setSearchTerm(searchParam);
    if (categoryParam) {
      setFilters(prev => ({
        ...prev,
        category: categoryParam
      }));
    }

    // Rolar até os resultados se houver busca
    if ((searchParam || categoryParam) && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [location]);

  // Limpar outros filtros quando a categoria mudar
  useEffect(() => {
    setFilters(prev => ({
      category: prev.category,
      brand: '',
      minPrice: 0,
      maxPrice: 0,
      minYear: 0,
      maxYear: new Date().getFullYear(),
      maxHours: 0,
      location: '',
    }));
  }, [filters.category]);

  // Carregar estados do IBGE
  useEffect(() => {
    const fetchStates = async () => {
      setLoadingStates(true);
      try {
        const response = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome');
        const data = await response.json();
        setStates(data);
      } catch (error) {
        console.error('Erro ao carregar estados:', error);
      } finally {
        setLoadingStates(false);
      }
    };

    fetchStates();
  }, []);

  // Carregar cidades quando o estado for selecionado
  useEffect(() => {
    if (!selectedState) {
      setCities([]);
      setSelectedCity('');
      return;
    }

    const fetchCities = async () => {
      setLoadingCities(true);
      try {
        const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedState}/municipios?orderBy=nome`);
        const data = await response.json();
        setCities(data);
      } catch (error) {
        console.error('Erro ao carregar cidades:', error);
      } finally {
        setLoadingCities(false);
      }
    };

    fetchCities();
  }, [selectedState]);

  // Atualizar filtro de localização quando estado ou cidade mudarem
  useEffect(() => {
    if (selectedCity && selectedState) {
      const state = states.find(s => s.sigla === selectedState);
      setFilters(prev => ({ ...prev, location: `${selectedCity} - ${state?.sigla}` }));
    } else if (selectedState) {
      setFilters(prev => ({ ...prev, location: selectedState }));
    } else {
      setFilters(prev => ({ ...prev, location: '' }));
    }
  }, [selectedState, selectedCity, states]);

  // Usar o filtro de tipo 'Venda' junto com outros filtros
  const { products, loading, error } = useProducts({ 
    type: 'Venda',
    category: filters.category 
  });

  // Filtrar produtos com base na busca
  const filteredProducts = products.filter(product => {
    // Filtro de busca por texto
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = (
        product.title.toLowerCase().includes(searchLower) ||
        product.brand.toLowerCase().includes(searchLower) ||
        product.model.toLowerCase().includes(searchLower)
      );
      if (!matchesSearch) return false;
    }

    // Filtro por marca
    if (filters.brand && product.brand !== filters.brand) return false;

    // Filtro por faixa de preço
    if (filters.minPrice > 0 && product.price < filters.minPrice) return false;
    if (filters.maxPrice > 0 && product.price > filters.maxPrice) return false;

    // Filtro por ano
    const productYear = parseInt(product.year);
    if (filters.minYear > 0 && productYear < filters.minYear) return false;
    if (filters.maxYear > 0 && productYear > filters.maxYear) return false;

    // Filtro por horas de uso
    if (filters.maxHours > 0 && product.hours && product.hours > filters.maxHours) return false;

    // Filtro por localização
    if (filters.location && !product.location.toLowerCase().includes(filters.location.toLowerCase())) return false;

    return true;
  });

  // Ordenar produtos
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'year-new':
        return parseInt(b.year) - parseInt(a.year);
      case 'year-old':
        return parseInt(a.year) - parseInt(b.year);
      case 'hours-low':
        return (a.hours || 0) - (b.hours || 0);
      default: // recent
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  // Extrair marcas únicas dos produtos
  const uniqueBrands = Array.from(new Set(products.map(p => p.brand))).sort();

  // Categorias fixas
  const categories = ['Tratores', 'Colheitadeiras', 'Implementos', 'Peças e Componentes'];

  // Limpar todos os filtros
  const clearFilters = () => {
    setFilters({
      category: '',
      brand: '',
      minPrice: 0,
      maxPrice: 0,
      minYear: 0,
      maxYear: new Date().getFullYear(),
      maxHours: 0,
      location: '',
    });
    setSearchTerm('');
    setSelectedState('');
    setSelectedCity('');
    setSortBy('recent');
    navigate('/comprar', { replace: true });
  };

  // Contar filtros ativos
  const activeFiltersCount = Object.values(filters).filter(v => v && v !== 0 && v !== new Date().getFullYear()).length + (searchTerm ? 1 : 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-4xl font-bold text-gray-900">
          {filters.category ? `${filters.category} à Venda` : 'Equipamentos à Venda'}
        </h1>
      </div>

      {/* Overlay para mobile */}
      {showFilters && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setShowFilters(false)}
        />
      )}

      <div className="flex gap-6">
        {/* Sidebar Filters - Desktop sempre visível, Mobile drawer lateral */}
        <div className={`
          ${showFilters ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0
          fixed md:static
          inset-y-0 left-0
          z-50 md:z-0
          w-80 md:w-64
          bg-white
          shadow-2xl md:shadow-md
          transform transition-transform duration-300 ease-in-out
          overflow-y-auto
          md:flex-shrink-0
        `}>
          <div className="p-6 md:sticky md:top-4 md:rounded-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Filtros</h2>
              <div className="flex items-center gap-2">
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
                  >
                    <X size={16} />
                    Limpar
                  </button>
                )}
                <button
                  onClick={() => setShowFilters(false)}
                  className="md:hidden text-gray-500 hover:text-gray-700 p-1"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar
              </label>
              <input
                type="text"
                placeholder="Nome, marca, modelo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              />
            </div>

            {/* Category */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoria
              </label>
              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              >
                <option value="">Todas</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Brand */}
            {uniqueBrands.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Marca
                </label>
                <select
                  value={filters.brand}
                  onChange={(e) => setFilters(prev => ({ ...prev, brand: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                >
                  <option value="">Todas as marcas</option>
                  {uniqueBrands.map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Price Range */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Faixa de Preço
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Mín."
                  value={filters.minPrice || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, minPrice: Number(e.target.value) || 0 }))}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                />
                <input
                  type="number"
                  placeholder="Máx."
                  value={filters.maxPrice || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: Number(e.target.value) || 0 }))}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                />
              </div>
            </div>

            {/* Year Range */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ano de Fabricação
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="De"
                  value={filters.minYear || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, minYear: Number(e.target.value) || 0 }))}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                />
                <input
                  type="number"
                  placeholder="Até"
                  value={filters.maxYear || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, maxYear: Number(e.target.value) || new Date().getFullYear() }))}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                />
              </div>
            </div>

            {/* Hours (for Tractors/Harvesters) */}
            {(filters.category === 'Tratores' || filters.category === 'Colheitadeiras' || filters.category === '') && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Horas de Uso (máx.)
                </label>
                <input
                  type="number"
                  placeholder="Ex: 5000"
                  value={filters.maxHours || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, maxHours: Number(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                />
              </div>
            )}

            {/* Location */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Localização
              </label>
              
              {/* Estado */}
              <div className="mb-2">
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  disabled={loadingStates}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none disabled:bg-gray-100"
                >
                  <option value="">Todos os estados</option>
                  {states.map((state) => (
                    <option key={state.id} value={state.sigla}>
                      {state.nome}
                    </option>
                  ))}
                </select>
              </div>

              {/* Cidade */}
              {selectedState && (
                <div>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    disabled={loadingCities}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none disabled:bg-gray-100"
                  >
                    <option value="">Todas as cidades</option>
                    {cities.map((city) => (
                      <option key={city.id} value={city.nome}>
                        {city.nome}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1" ref={resultsRef}>
          {/* Sort and Results Count */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            {/* Mobile Layout */}
            <div className="flex flex-col gap-3 md:hidden">
              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-md hover:bg-green-700 transition whitespace-nowrap"
                >
                  <SlidersHorizontal size={18} />
                  Filtros {activeFiltersCount > 0 && `(${activeFiltersCount})`}
                </button>
                <div className="text-sm text-gray-600 text-right">
                  {sortedProducts.length} {sortedProducts.length === 1 ? 'resultado' : 'resultados'}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-700 whitespace-nowrap">Ordenar:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                >
                  <option value="recent">Mais recentes</option>
                  <option value="price-low">Menor preço</option>
                  <option value="price-high">Maior preço</option>
                  <option value="year-new">Mais novos</option>
                  <option value="year-old">Mais antigos</option>
                  <option value="hours-low">Menos horas de uso</option>
                </select>
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden md:flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {sortedProducts.length} {sortedProducts.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-700">Ordenar por:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                >
                  <option value="recent">Mais recentes</option>
                  <option value="price-low">Menor preço</option>
                  <option value="price-high">Maior preço</option>
                  <option value="year-new">Mais novos</option>
                  <option value="year-old">Mais antigos</option>
                  <option value="hours-low">Menos horas de uso</option>
                </select>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {[...Array(6)].map((_, index) => (
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
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-8">
              <p>Erro ao carregar os produtos: {error}</p>
            </div>
          )}

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedProducts.map((product) => (
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

            {!loading && sortedProducts.length === 0 && (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-600 text-lg mb-2">Nenhum produto encontrado</p>
                <p className="text-gray-500 text-sm">Tente ajustar seus filtros para ver mais resultados</p>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="mt-4 text-green-600 hover:text-green-700 font-medium"
                  >
                    Limpar todos os filtros
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}