import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Phone, ArrowLeft, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Product } from '../hooks/useProducts';
import type { Database } from '../lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface SellerInfo extends Profile {
  email?: string;
}

interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  position: number;
}

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sellerInfo, setSellerInfo] = useState<SellerInfo | null>(null);
  const [sellerNotFound, setSellerNotFound] = useState(false);
  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  React.useEffect(() => {
    async function loadProduct() {
      if (!id) {
        setError('ID do produto não fornecido');
        setLoading(false);
        return;
      }

      try {
        // Carregar dados do produto
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('*')
          // @ts-expect-error - Supabase type issue
          .eq('id', id)
          .single();

        if (productError) throw productError;
        if (!productData) {
          setError('Produto não encontrado');
          setLoading(false);
          return;
        }

        setProduct(productData as any);

        // Carregar imagens adicionais
        const { data: imagesData, error: imagesError } = await supabase
          .from('product_images')
          .select('*')
          // @ts-expect-error - Supabase type issue
          .eq('product_id', id)
          .order('position');

        if (imagesError) throw imagesError;

        // Combinar imagem principal com imagens adicionais
        const allImages: ProductImage[] = [
          { id: 'main', product_id: id, image_url: (productData as any).image_url, position: 0 },
          ...((imagesData as any) || []).map((img: any) => ({
            id: img.id,
            product_id: img.product_id,
            image_url: img.image_url,
            position: img.position
          }))
        ];
        setProductImages(allImages);

        // Carregar perfil do vendedor
        if ((productData as any).user_id) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', (productData as any).user_id)
            .single();

          if (profileError) {
            console.error('Erro ao carregar perfil do vendedor:', profileError);
            setSellerNotFound(true);
          } else if (profileData) {
            setSellerInfo(profileData as any);
          } else {
            setSellerNotFound(true);
          }
        }
      } catch (err) {
        console.error('Erro ao carregar produto:', err);
        setError(err instanceof Error ? err.message : 'Erro ao carregar produto');
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [id]);

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === productImages.length - 1 ? 0 : prev + 1
    );
  };

  const previousImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? productImages.length - 1 : prev - 1
    );
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft size={20} />
          Voltar
        </button>
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {error || 'Produto não encontrado'}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Breadcrumb Navigation */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-green-600 transition-all hover:gap-3"
          >
            <ArrowLeft size={18} />
            <span>Voltar</span>
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna Principal - Conteúdo */}
          <div className="lg:col-span-2 space-y-6">
            {/* Galeria de Imagens */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden group">
              <div className="aspect-[4/3] relative bg-gradient-to-br from-gray-100 to-gray-50">
                <img
                  src={productImages[currentImageIndex]?.image_url}
                  alt={`${product.title} - Foto ${currentImageIndex + 1}`}
                  className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                />
                
                {/* Controles de Navegação */}
                {productImages.length > 1 && (
                  <>
                    <button
                      onClick={previousImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/95 backdrop-blur-md text-gray-900 rounded-full shadow-xl hover:bg-white hover:scale-110 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                      aria-label="Imagem anterior"
                    >
                      <ChevronLeft size={22} strokeWidth={2.5} />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/95 backdrop-blur-md text-gray-900 rounded-full shadow-xl hover:bg-white hover:scale-110 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                      aria-label="Próxima imagem"
                    >
                      <ChevronRight size={22} strokeWidth={2.5} />
                    </button>
                    {/* Indicador de Posição */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/80 backdrop-blur-md text-white text-sm font-semibold rounded-full shadow-lg">
                      {currentImageIndex + 1} / {productImages.length}
                    </div>
                  </>
                )}
              </div>

              {/* Miniaturas */}
              {productImages.length > 1 && (
                <div className="p-5 bg-gray-50/50">
                  <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
                    {productImages.map((image, index) => (
                      <button
                        key={image.id}
                        onClick={() => goToImage(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden transition-all transform ${
                          currentImageIndex === index
                            ? 'ring-3 ring-green-500 scale-105 shadow-lg'
                            : 'ring-2 ring-gray-200 hover:ring-gray-300 hover:scale-105'
                        }`}
                        aria-label={`Ver imagem ${index + 1}`}
                      >
                        <img
                          src={image.image_url}
                          alt={`Miniatura ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Card de Informações Mobile */}
            <div className="lg:hidden bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${
                  product.type === 'Venda' 
                    ? 'bg-green-50 text-green-700 ring-1 ring-green-200' 
                    : 'bg-blue-50 text-blue-700 ring-1 ring-blue-200'
                }`}>
                  {product.type}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-6 leading-tight">{product.title}</h1>
              
              {/* Preço Mobile */}
              <div className="border-t border-b border-gray-200 py-6 mb-6">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  {product.type === 'Venda' ? 'Valor' : product.period}
                </p>
                <p className="text-4xl font-bold text-gray-900">
                  R$ {Number(product.price).toLocaleString('pt-BR')}
                </p>
                {product.type !== 'Venda' && (
                  <p className="text-sm text-gray-600 mt-1">por {product.period?.toLowerCase()}</p>
                )}
              </div>

              {/* Meta Info */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <MapPin size={18} className="text-green-600 flex-shrink-0" />
                  <span className="text-sm text-gray-700 font-medium truncate">{product.location}</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Calendar size={18} className="text-green-600 flex-shrink-0" />
                  <span className="text-sm text-gray-700 font-medium">Ano {product.year}</span>
                </div>
              </div>
            </div>

            {/* Descrição */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-green-600 rounded-full"></span>
                Descrição
              </h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{product.description}</p>
              </div>
            </div>

            {/* Especificações Técnicas */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="w-1 h-6 bg-green-600 rounded-full"></span>
                Especificações Técnicas
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="group relative p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 hover:border-green-300 transition-all">
                  <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Marca</dt>
                  <dd className="text-lg font-bold text-gray-900">{product.brand}</dd>
                  <div className="absolute bottom-0 left-0 h-1 w-0 bg-green-500 rounded-full group-hover:w-full transition-all duration-300"></div>
                </div>
                <div className="group relative p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 hover:border-green-300 transition-all">
                  <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Modelo</dt>
                  <dd className="text-lg font-bold text-gray-900">{product.model}</dd>
                  <div className="absolute bottom-0 left-0 h-1 w-0 bg-green-500 rounded-full group-hover:w-full transition-all duration-300"></div>
                </div>
                <div className="group relative p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 hover:border-green-300 transition-all">
                  <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Ano</dt>
                  <dd className="text-lg font-bold text-gray-900">{product.year}</dd>
                  <div className="absolute bottom-0 left-0 h-1 w-0 bg-green-500 rounded-full group-hover:w-full transition-all duration-300"></div>
                </div>
                <div className="group relative p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 hover:border-green-300 transition-all">
                  <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Categoria</dt>
                  <dd className="text-lg font-bold text-gray-900">{product.category}</dd>
                  <div className="absolute bottom-0 left-0 h-1 w-0 bg-green-500 rounded-full group-hover:w-full transition-all duration-300"></div>
                </div>

                {/* Campos específicos */}
                {(product.category === 'Tratores' || product.category === 'Colheitadeiras') && (
                  <>
                    <div className="group relative p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 hover:border-green-300 transition-all">
                      <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Horas de Uso</dt>
                      <dd className="text-lg font-bold text-gray-900">{product.hours} horas</dd>
                      <div className="absolute bottom-0 left-0 h-1 w-0 bg-green-500 rounded-full group-hover:w-full transition-all duration-300"></div>
                    </div>
                    <div className="group relative p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 hover:border-green-300 transition-all">
                      <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Potência</dt>
                      <dd className="text-lg font-bold text-gray-900">{product.power} cv</dd>
                      <div className="absolute bottom-0 left-0 h-1 w-0 bg-green-500 rounded-full group-hover:w-full transition-all duration-300"></div>
                    </div>
                  </>
                )}

                {product.category === 'Implementos' && (
                  <>
                    <div className="group relative p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 hover:border-green-300 transition-all">
                      <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Tipo</dt>
                      <dd className="text-lg font-bold text-gray-900">{product.implement_type}</dd>
                      <div className="absolute bottom-0 left-0 h-1 w-0 bg-green-500 rounded-full group-hover:w-full transition-all duration-300"></div>
                    </div>
                    <div className="group relative p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 hover:border-green-300 transition-all">
                      <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Largura</dt>
                      <dd className="text-lg font-bold text-gray-900">{product.work_width} metros</dd>
                      <div className="absolute bottom-0 left-0 h-1 w-0 bg-green-500 rounded-full group-hover:w-full transition-all duration-300"></div>
                    </div>
                  </>
                )}

                {product.category === 'Peças e Componentes' && (
                  <>
                    <div className="group relative p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 hover:border-green-300 transition-all">
                      <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Tipo de Peça</dt>
                      <dd className="text-lg font-bold text-gray-900">{product.part_type}</dd>
                      <div className="absolute bottom-0 left-0 h-1 w-0 bg-green-500 rounded-full group-hover:w-full transition-all duration-300"></div>
                    </div>
                    <div className="group relative p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 hover:border-green-300 transition-all">
                      <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Condição</dt>
                      <dd className="text-lg font-bold text-gray-900">{product.part_condition}</dd>
                      <div className="absolute bottom-0 left-0 h-1 w-0 bg-green-500 rounded-full group-hover:w-full transition-all duration-300"></div>
                    </div>
                    {product.part_number && (
                      <div className="group relative p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 hover:border-green-300 transition-all">
                        <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Nº da Peça</dt>
                        <dd className="text-lg font-bold text-gray-900">{product.part_number}</dd>
                        <div className="absolute bottom-0 left-0 h-1 w-0 bg-green-500 rounded-full group-hover:w-full transition-all duration-300"></div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Ações e Informações */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 space-y-6">
              {/* Card Principal Desktop */}
              <div className="hidden lg:block bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="mb-4">
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide ${
                    product.type === 'Venda' 
                      ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20' 
                      : 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20'
                  }`}>
                    {product.type}
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-6 leading-tight">{product.title}</h1>
                
                {/* Meta Info */}
                <div className="space-y-3 mb-6 pb-6 border-b border-gray-100">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg transition-colors hover:bg-gray-100">
                    <MapPin size={18} className="text-green-600 flex-shrink-0" />
                    <span className="text-sm text-gray-700 font-medium">{product.location}</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg transition-colors hover:bg-gray-100">
                    <Calendar size={18} className="text-green-600 flex-shrink-0" />
                    <span className="text-sm text-gray-700 font-medium">Ano {product.year}</span>
                  </div>
                </div>

                {/* Card de Preço */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-6">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    {product.type === 'Venda' ? 'Valor' : product.period}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mb-1">
                    R$ {Number(product.price).toLocaleString('pt-BR')}
                  </p>
                  {product.type !== 'Venda' && (
                    <p className="text-sm text-gray-600">por {product.period?.toLowerCase()}</p>
                  )}
                </div>
              </div>

              {/* Card do Vendedor */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                  <span className="w-1 h-5 bg-green-600 rounded-full"></span>
                  Vendedor
                </h2>
                
                {sellerNotFound ? (
                  <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                    <AlertTriangle size={18} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-yellow-800">Informações não disponíveis.</p>
                  </div>
                ) : sellerInfo ? (
                  <div className="space-y-5">
                    {/* Perfil */}
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="relative h-14 w-14 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center flex-shrink-0 shadow-md">
                        {sellerInfo.avatar_url ? (
                          <img
                            src={sellerInfo.avatar_url}
                            alt={sellerInfo.full_name}
                            className="h-14 w-14 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-xl font-bold text-white">
                            {sellerInfo.full_name[0]}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 truncate">{sellerInfo.full_name}</h3>
                        {sellerInfo.company_name && (
                          <p className="text-sm text-gray-600 truncate mt-0.5">{sellerInfo.company_name}</p>
                        )}
                      </div>
                    </div>

                    {/* CTA Principal */}
                    <a
                      href={`tel:${sellerInfo.phone}`}
                      className="group relative flex items-center justify-center gap-2 w-full py-3.5 px-5 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-green-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <Phone size={20} className="relative z-10" />
                      <span className="relative z-10">Ligar Agora</span>
                    </a>

                    {/* Telefone */}
                    <div className="pt-4 border-t border-gray-100">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Telefone</p>
                      <p className="text-base font-semibold text-gray-900">{sellerInfo.phone}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-3 border-gray-200 border-t-green-600"></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}