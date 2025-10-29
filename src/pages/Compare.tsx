import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, X, MapPin, Calendar, Gauge, Clock, Ruler, Package, CheckCircle2 } from 'lucide-react';
import { useCompare } from '../contexts/CompareContext';
import SEO from '../components/SEO';

export default function Compare() {
  const { compareProducts, removeFromCompare, clearCompare } = useCompare();
  const navigate = useNavigate();

  // Redirecionar se não houver produtos suficientes
  useEffect(() => {
    if (compareProducts.length < 2) {
      navigate('/comprar');
    }
  }, [compareProducts.length, navigate]);

  if (compareProducts.length < 2) {
    return null;
  }

  // Determinar quais campos mostrar baseado nas categorias
  const hasHours = compareProducts.some(p => p.hours !== null && p.hours !== undefined);
  const hasPower = compareProducts.some(p => p.power !== null && p.power !== undefined);
  const hasImplementType = compareProducts.some(p => p.implement_type);
  const hasWorkWidth = compareProducts.some(p => p.work_width !== null && p.work_width !== undefined);
  const hasPartType = compareProducts.some(p => p.part_type);
  const hasPartCondition = compareProducts.some(p => p.part_condition);
  const hasPartNumber = compareProducts.some(p => p.part_number);

  // Encontrar melhor valor para destacar
  const minPrice = Math.min(...compareProducts.map(p => p.price));
  const maxYear = Math.max(...compareProducts.map(p => parseInt(p.year)));
  const minHours = hasHours 
    ? Math.min(...compareProducts.map(p => p.hours || Infinity).filter(h => h !== Infinity))
    : null;
  const maxPower = hasPower
    ? Math.max(...compareProducts.map(p => p.power || 0))
    : null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-8 sm:pb-20">
      <SEO 
        title="Comparar Máquinas Agrícolas"
        description="Compare preços e especificações de máquinas agrícolas lado a lado. Encontre o melhor custo-benefício para sua necessidade."
        canonical="https://www.tratorhub.com.br/comparar"
      />

      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition"
            >
              <ArrowLeft size={20} />
              <span className="hidden sm:inline">Voltar</span>
            </button>
            
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Comparar Produtos ({compareProducts.length})
            </h1>

            <button
              onClick={() => {
                clearCompare();
                navigate('/comprar');
              }}
              className="text-sm text-red-600 hover:text-red-700 font-medium transition"
            >
              Limpar tudo
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Layout Mobile - Cards */}
        <div className="lg:hidden space-y-6">
          {compareProducts.map((product, index) => (
            <div key={product.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Header do Card */}
              <div className="relative bg-gradient-to-r from-green-600 to-green-700 p-4">
                <button
                  onClick={() => removeFromCompare(product.id)}
                  className="absolute top-3 right-3 bg-red-500 text-white rounded-full p-2 shadow-lg hover:bg-red-600 transition"
                  aria-label={`Remover ${product.title}`}
                >
                  <X size={16} />
                </button>
                <div className="flex items-center gap-2 text-white/80 text-sm mb-2">
                  <span>Produto {index + 1} de {compareProducts.length}</span>
                </div>
                <h3 className="text-white font-bold text-lg pr-10">{product.title}</h3>
              </div>

              {/* Imagem */}
              <div className="aspect-video bg-gray-100">
                <img
                  src={product.image_url}
                  alt={product.title}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => navigate(`/produto/${product.id}`)}
                />
              </div>

              {/* Informações */}
              <div className="p-4 space-y-3">
                {/* Preço */}
                <div className={`p-4 rounded-xl ${product.price === minPrice ? 'bg-green-50 border-2 border-green-500' : 'bg-gray-50'}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Preço</span>
                    {product.price === minPrice && (
                      <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded-full">
                        Melhor Preço
                      </span>
                    )}
                  </div>
                  <p className={`text-3xl font-bold ${product.price === minPrice ? 'text-green-600' : 'text-gray-900'}`}>
                    {formatPrice(product.price)}
                  </p>
                </div>

                {/* Grid de Informações */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-xs text-gray-500 block mb-1">Categoria</span>
                    <span className="text-sm font-semibold text-gray-900">{product.category}</span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-xs text-gray-500 block mb-1">Marca</span>
                    <span className="text-sm font-semibold text-gray-900">{product.brand}</span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-xs text-gray-500 block mb-1">Modelo</span>
                    <span className="text-sm font-semibold text-gray-900">{product.model}</span>
                  </div>
                  <div className={`p-3 rounded-lg ${parseInt(product.year) === maxYear ? 'bg-green-50 border border-green-300' : 'bg-gray-50'}`}>
                    <span className="text-xs text-gray-500 block mb-1">Ano</span>
                    <span className={`text-sm font-semibold ${parseInt(product.year) === maxYear ? 'text-green-700' : 'text-gray-900'}`}>
                      {product.year}
                      {parseInt(product.year) === maxYear && ' ✓'}
                    </span>
                  </div>
                </div>

                {/* Especificações Técnicas */}
                {(product.hours !== null || product.power !== null) && (
                  <div className="border-t pt-3 space-y-2">
                    <h4 className="text-sm font-semibold text-gray-700">Especificações</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {product.hours !== null && product.hours !== undefined && (
                        <div className={`p-3 rounded-lg ${product.hours === minHours ? 'bg-green-50 border border-green-300' : 'bg-gray-50'}`}>
                          <span className="text-xs text-gray-500 block mb-1">Horas de Uso</span>
                          <span className={`text-sm font-semibold ${product.hours === minHours ? 'text-green-700' : 'text-gray-900'}`}>
                            {product.hours.toLocaleString('pt-BR')} h
                            {product.hours === minHours && ' ✓'}
                          </span>
                        </div>
                      )}
                      {product.power && (
                        <div className={`p-3 rounded-lg ${product.power === maxPower ? 'bg-green-50 border border-green-300' : 'bg-gray-50'}`}>
                          <span className="text-xs text-gray-500 block mb-1">Potência</span>
                          <span className={`text-sm font-semibold ${product.power === maxPower ? 'text-green-700' : 'text-gray-900'}`}>
                            {product.power} cv
                            {product.power === maxPower && ' ✓'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Implementos/Peças */}
                {(product.implement_type || product.work_width || product.part_type || product.part_condition) && (
                  <div className="border-t pt-3 space-y-2">
                    {product.implement_type && (
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm text-gray-600">Tipo de Implemento</span>
                        <span className="text-sm font-semibold text-gray-900">{product.implement_type}</span>
                      </div>
                    )}
                    {product.work_width && (
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm text-gray-600">Largura de Trabalho</span>
                        <span className="text-sm font-semibold text-gray-900">{product.work_width} m</span>
                      </div>
                    )}
                    {product.part_type && (
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm text-gray-600">Tipo de Peça</span>
                        <span className="text-sm font-semibold text-gray-900">{product.part_type}</span>
                      </div>
                    )}
                    {product.part_condition && (
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm text-gray-600">Condição</span>
                        <span className={`text-sm font-semibold px-2 py-1 rounded ${
                          product.part_condition === 'Nova' 
                            ? 'bg-green-100 text-green-700' 
                            : product.part_condition === 'Recondicionada'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-700'
                        }`}>
                          {product.part_condition}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Localização */}
                <div className="border-t pt-3">
                  <div className="flex items-center gap-2 text-gray-700">
                    <MapPin size={16} className="text-green-600" />
                    <span className="text-sm">{product.location}</span>
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => navigate(`/produto/${product.id}`)}
                    className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
                  >
                    Ver Detalhes
                  </button>
                  <button
                    onClick={() => removeFromCompare(product.id)}
                    className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition"
                  >
                    Remover
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Legenda Mobile */}
          <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <CheckCircle2 size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-gray-700">
                <strong className="text-green-600">Destaque verde (✓)</strong> indica o melhor valor em cada critério
              </p>
            </div>
          </div>
        </div>

        {/* Layout Desktop - Tabela */}
        <div className="hidden lg:block bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="sticky left-0 z-10 bg-gray-50 px-6 py-4 text-left">
                    <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                      Característica
                    </span>
                  </th>
                  {compareProducts.map((product) => (
                    <th key={product.id} className="px-6 py-4 min-w-[280px]">
                      <div className="relative">
                        <button
                          onClick={() => removeFromCompare(product.id)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg hover:bg-red-600 transition"
                          aria-label={`Remover ${product.title}`}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {/* Imagens */}
                <tr className="bg-white">
                  <td className="sticky left-0 z-10 bg-white px-6 py-4 font-medium text-gray-900">
                    Imagem
                  </td>
                  {compareProducts.map((product) => (
                    <td key={product.id} className="px-6 py-4">
                      <img
                        src={product.image_url}
                        alt={product.title}
                        className="w-full h-40 object-cover rounded-lg cursor-pointer hover:scale-105 transition"
                        onClick={() => navigate(`/produto/${product.id}`)}
                      />
                    </td>
                  ))}
                </tr>

                {/* Título */}
                <tr className="bg-gray-50">
                  <td className="sticky left-0 z-10 bg-gray-50 px-6 py-4 font-medium text-gray-900">
                    Título
                  </td>
                  {compareProducts.map((product) => (
                    <td key={product.id} className="px-6 py-4">
                      <button
                        onClick={() => navigate(`/produto/${product.id}`)}
                        className="text-left font-semibold text-gray-900 hover:text-green-600 transition"
                      >
                        {product.title}
                      </button>
                    </td>
                  ))}
                </tr>

                {/* Preço */}
                <tr className="bg-white">
                  <td className="sticky left-0 z-10 bg-white px-6 py-4 font-medium text-gray-900">
                    Preço
                  </td>
                  {compareProducts.map((product) => (
                    <td key={product.id} className="px-6 py-4">
                      <div className={`inline-flex items-center gap-2 ${product.price === minPrice ? 'text-green-600 font-bold' : 'text-gray-900'}`}>
                        <span className="text-2xl">{formatPrice(product.price)}</span>
                        {product.price === minPrice && (
                          <CheckCircle2 size={20} className="text-green-600" />
                        )}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Categoria */}
                <tr className="bg-gray-50">
                  <td className="sticky left-0 z-10 bg-gray-50 px-6 py-4 font-medium text-gray-900">
                    Categoria
                  </td>
                  {compareProducts.map((product) => (
                    <td key={product.id} className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                        <Package size={14} />
                        {product.category}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Marca */}
                <tr className="bg-white">
                  <td className="sticky left-0 z-10 bg-white px-6 py-4 font-medium text-gray-900">
                    Marca
                  </td>
                  {compareProducts.map((product) => (
                    <td key={product.id} className="px-6 py-4 text-gray-700">
                      {product.brand}
                    </td>
                  ))}
                </tr>

                {/* Modelo */}
                <tr className="bg-gray-50">
                  <td className="sticky left-0 z-10 bg-gray-50 px-6 py-4 font-medium text-gray-900">
                    Modelo
                  </td>
                  {compareProducts.map((product) => (
                    <td key={product.id} className="px-6 py-4 text-gray-700">
                      {product.model}
                    </td>
                  ))}
                </tr>

                {/* Ano */}
                <tr className="bg-white">
                  <td className="sticky left-0 z-10 bg-white px-6 py-4 font-medium text-gray-900">
                    Ano
                  </td>
                  {compareProducts.map((product) => (
                    <td key={product.id} className="px-6 py-4">
                      <div className={`inline-flex items-center gap-2 ${parseInt(product.year) === maxYear ? 'text-green-600 font-bold' : 'text-gray-700'}`}>
                        <Calendar size={16} />
                        <span>{product.year}</span>
                        {parseInt(product.year) === maxYear && (
                          <CheckCircle2 size={16} className="text-green-600" />
                        )}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Horas de Uso */}
                {hasHours && (
                  <tr className="bg-gray-50">
                    <td className="sticky left-0 z-10 bg-gray-50 px-6 py-4 font-medium text-gray-900">
                      Horas de Uso
                    </td>
                    {compareProducts.map((product) => (
                      <td key={product.id} className="px-6 py-4">
                        {product.hours !== null && product.hours !== undefined ? (
                          <div className={`inline-flex items-center gap-2 ${product.hours === minHours ? 'text-green-600 font-bold' : 'text-gray-700'}`}>
                            <Clock size={16} />
                            <span>{product.hours.toLocaleString('pt-BR')} h</span>
                            {product.hours === minHours && (
                              <CheckCircle2 size={16} className="text-green-600" />
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">N/A</span>
                        )}
                      </td>
                    ))}
                  </tr>
                )}

                {/* Potência */}
                {hasPower && (
                  <tr className="bg-white">
                    <td className="sticky left-0 z-10 bg-white px-6 py-4 font-medium text-gray-900">
                      Potência
                    </td>
                    {compareProducts.map((product) => (
                      <td key={product.id} className="px-6 py-4">
                        {product.power ? (
                          <div className={`inline-flex items-center gap-2 ${product.power === maxPower ? 'text-green-600 font-bold' : 'text-gray-700'}`}>
                            <Gauge size={16} />
                            <span>{product.power} cv</span>
                            {product.power === maxPower && (
                              <CheckCircle2 size={16} className="text-green-600" />
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">N/A</span>
                        )}
                      </td>
                    ))}
                  </tr>
                )}

                {/* Tipo de Implemento */}
                {hasImplementType && (
                  <tr className="bg-gray-50">
                    <td className="sticky left-0 z-10 bg-gray-50 px-6 py-4 font-medium text-gray-900">
                      Tipo de Implemento
                    </td>
                    {compareProducts.map((product) => (
                      <td key={product.id} className="px-6 py-4 text-gray-700">
                        {product.implement_type || <span className="text-gray-400 text-sm">N/A</span>}
                      </td>
                    ))}
                  </tr>
                )}

                {/* Largura de Trabalho */}
                {hasWorkWidth && (
                  <tr className="bg-white">
                    <td className="sticky left-0 z-10 bg-white px-6 py-4 font-medium text-gray-900">
                      Largura de Trabalho
                    </td>
                    {compareProducts.map((product) => (
                      <td key={product.id} className="px-6 py-4">
                        {product.work_width ? (
                          <div className="inline-flex items-center gap-2 text-gray-700">
                            <Ruler size={16} />
                            <span>{product.work_width} m</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">N/A</span>
                        )}
                      </td>
                    ))}
                  </tr>
                )}

                {/* Tipo de Peça */}
                {hasPartType && (
                  <tr className="bg-gray-50">
                    <td className="sticky left-0 z-10 bg-gray-50 px-6 py-4 font-medium text-gray-900">
                      Tipo de Peça
                    </td>
                    {compareProducts.map((product) => (
                      <td key={product.id} className="px-6 py-4 text-gray-700">
                        {product.part_type || <span className="text-gray-400 text-sm">N/A</span>}
                      </td>
                    ))}
                  </tr>
                )}

                {/* Condição da Peça */}
                {hasPartCondition && (
                  <tr className="bg-white">
                    <td className="sticky left-0 z-10 bg-white px-6 py-4 font-medium text-gray-900">
                      Condição
                    </td>
                    {compareProducts.map((product) => (
                      <td key={product.id} className="px-6 py-4">
                        {product.part_condition ? (
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            product.part_condition === 'Nova' 
                              ? 'bg-green-50 text-green-700' 
                              : product.part_condition === 'Recondicionada'
                                ? 'bg-blue-50 text-blue-700'
                                : 'bg-gray-100 text-gray-700'
                          }`}>
                            {product.part_condition}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">N/A</span>
                        )}
                      </td>
                    ))}
                  </tr>
                )}

                {/* Número da Peça */}
                {hasPartNumber && (
                  <tr className="bg-gray-50">
                    <td className="sticky left-0 z-10 bg-gray-50 px-6 py-4 font-medium text-gray-900">
                      Nº da Peça
                    </td>
                    {compareProducts.map((product) => (
                      <td key={product.id} className="px-6 py-4 text-gray-700 font-mono text-sm">
                        {product.part_number || <span className="text-gray-400 text-sm font-sans">N/A</span>}
                      </td>
                    ))}
                  </tr>
                )}

                {/* Localização */}
                <tr className="bg-white">
                  <td className="sticky left-0 z-10 bg-white px-6 py-4 font-medium text-gray-900">
                    Localização
                  </td>
                  {compareProducts.map((product) => (
                    <td key={product.id} className="px-6 py-4">
                      <div className="inline-flex items-center gap-2 text-gray-700">
                        <MapPin size={16} className="text-green-600" />
                        <span>{product.location}</span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Ações */}
                <tr className="bg-gray-50">
                  <td className="sticky left-0 z-10 bg-gray-50 px-6 py-4 font-medium text-gray-900">
                    Ações
                  </td>
                  {compareProducts.map((product) => (
                    <td key={product.id} className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => navigate(`/produto/${product.id}`)}
                          className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
                        >
                          Ver Detalhes
                        </button>
                        <button
                          onClick={() => removeFromCompare(product.id)}
                          className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition"
                        >
                          Remover
                        </button>
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Legenda Desktop */}
        <div className="hidden lg:block mt-6">
          <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <CheckCircle2 size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-gray-700">
                <strong className="text-green-600">Destaque verde</strong> indica o melhor valor em cada categoria:
              </p>
              <ul className="text-sm text-gray-600 mt-1 ml-4 list-disc">
                <li>Menor preço</li>
                <li>Ano mais recente</li>
                <li>Menos horas de uso</li>
                <li>Maior potência</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
