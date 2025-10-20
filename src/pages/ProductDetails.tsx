import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Phone, Mail, ArrowLeft, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
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
          .eq('id', id)
          .maybeSingle();

        if (productError) throw productError;
        if (!productData) {
          setError('Produto não encontrado');
          setLoading(false);
          return;
        }

        setProduct(productData);

        // Carregar imagens adicionais
        const { data: imagesData, error: imagesError } = await supabase
          .from('product_images')
          .select('*')
          .eq('product_id', id)
          .order('position');

        if (imagesError) throw imagesError;

        // Combinar imagem principal com imagens adicionais
        const allImages = [
          { id: 'main', product_id: id, image_url: productData.image_url, position: 0 },
          ...(imagesData || [])
        ];
        setProductImages(allImages);

        // Carregar perfil do vendedor
        if (productData.user_id) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', productData.user_id)
            .maybeSingle();

          if (profileError) {
            console.error('Erro ao carregar perfil do vendedor:', profileError);
            setSellerNotFound(true);
          } else if (profileData) {
            setSellerInfo(profileData);
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
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft size={20} />
        Voltar
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Galeria de Imagens */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-md overflow-hidden aspect-video relative group">
            <img
              src={productImages[currentImageIndex]?.image_url}
              alt={`${product.title} - Foto ${currentImageIndex + 1}`}
              className="w-full h-full object-contain"
            />
            
            {productImages.length > 1 && (
              <>
                <button
                  onClick={previousImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 text-gray-900 rounded-full shadow-lg hover:bg-white transition opacity-0 group-hover:opacity-100"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 text-gray-900 rounded-full shadow-lg hover:bg-white transition opacity-0 group-hover:opacity-100"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
          </div>

          {/* Miniaturas */}
          {productImages.length > 1 && (
            <div className="grid grid-cols-6 gap-2">
              {productImages.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => goToImage(index)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition ${
                    currentImageIndex === index
                      ? 'border-green-600'
                      : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <img
                    src={image.image_url}
                    alt={`Miniatura ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Informações do Produto */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.title}</h1>
            <div className="flex items-center gap-4 text-gray-500">
              <div className="flex items-center gap-1">
                <MapPin size={18} />
                <span>{product.location}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar size={18} />
                <span>Ano {product.year}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-4">
              <span className="text-sm text-gray-500">
                {product.type === 'Venda' ? 'Valor' : product.period}
              </span>
              <div className="text-3xl font-bold text-gray-900">
                R$ {Number(product.price).toLocaleString('pt-BR')}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Marca</h3>
                <p className="text-gray-900">{product.brand}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Modelo</h3>
                <p className="text-gray-900">{product.model}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Categoria</h3>
                <p className="text-gray-900">{product.category}</p>
              </div>

              {/* Campos específicos por categoria */}
              {(product.category === 'Tratores' || product.category === 'Colheitadeiras') && (
                <>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Horas de Uso</h3>
                    <p className="text-gray-900">{product.hours} horas</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Potência</h3>
                    <p className="text-gray-900">{product.power} cv</p>
                  </div>
                </>
              )}

              {product.category === 'Implementos' && (
                <>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Tipo de Implemento</h3>
                    <p className="text-gray-900">{product.implement_type}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Largura de Trabalho</h3>
                    <p className="text-gray-900">{product.work_width} metros</p>
                  </div>
                </>
              )}

              {product.category === 'Peças e Componentes' && (
                <>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Tipo de Peça</h3>
                    <p className="text-gray-900">{product.part_type}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Estado</h3>
                    <p className="text-gray-900">{product.part_condition}</p>
                  </div>
                  {product.part_number && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Número da Peça</h3>
                      <p className="text-gray-900">{product.part_number}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Descrição */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Descrição</h2>
            <p className="text-gray-600 whitespace-pre-line">{product.description}</p>
          </div>

          {/* Informações do Vendedor */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Informações do Vendedor</h2>
            
            {sellerNotFound ? (
              <div className="flex items-center gap-3 text-yellow-600 bg-yellow-50 p-4 rounded-lg">
                <AlertTriangle size={20} />
                <p>Informações do vendedor não disponíveis no momento.</p>
              </div>
            ) : sellerInfo ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                    {sellerInfo.avatar_url ? (
                      <img
                        src={sellerInfo.avatar_url}
                        alt={sellerInfo.full_name}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-xl font-semibold text-gray-600">
                        {sellerInfo.full_name[0]}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{sellerInfo.full_name}</h3>
                    {sellerInfo.company_name && (
                      <p className="text-sm text-gray-500">{sellerInfo.company_name}</p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <a
                    href={`tel:${sellerInfo.phone}`}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                  >
                    <Phone size={18} />
                    {sellerInfo.phone}
                  </a>
                </div>
              </div>
            ) : (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}