import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Camera, 
  AlertCircle, 
  Loader2, 
  Upload, 
  X, 
  FileText, 
  MapPin, 
  Tag, 
  Calendar, 
  Building2, 
  Ruler, 
  Settings, 
  PenTool as Tool, 
  Clock, 
  Gauge,
  ImagePlus,
  GripHorizontal,
  DollarSign,
  Info,
  CheckCircle2
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface FormData {
  title: string;
  description: string;
  price: string;
  type: 'Venda' | 'Aluguel';
  period?: 'Diário' | 'Semanal' | 'Mensal';
  brand: string;
  model: string;
  year: string;
  category: string;
  location: string;
  hours?: string;
  power?: string;
  implementType?: string;
  workWidth?: string;
  partType?: string;
  partCondition?: string;
  partNumber?: string;
}

interface ImageFile {
  file: File;
  preview: string;
  uploading: boolean;
}

export default function Sell() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<ImageFile[]>([]);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    price: '',
    type: 'Venda',
    brand: '',
    model: '',
    year: new Date().getFullYear().toString(),
    category: '',
    location: ''
  });

  useEffect(() => {
    return () => {
      images.forEach(image => {
        URL.revokeObjectURL(image.preview);
      });
    };
  }, [images]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/entrar', { state: { from: '/vender' } });
      }
    };
    checkAuth();
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'price') {
      const numbers = value.replace(/\D/g, '');
      const formatted = new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(Number(numbers) / 100);
      
      setFormData(prev => ({ ...prev, [name]: formatted }));
      return;
    }

    if (name === 'category') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        hours: '',
        power: '',
        implementType: '',
        workWidth: '',
        partType: '',
        partCondition: '',
        partNumber: ''
      }));
      return;
    }

    if (name === 'type' && value === 'Venda') {
      setFormData(prev => ({ ...prev, [name]: value, period: undefined }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (images.length + files.length > 10) {
      setError('Você pode adicionar no máximo 10 fotos.');
      return;
    }

    files.forEach(file => {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        setError('Por favor, selecione apenas imagens nos formatos JPG, PNG ou WebP.');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError('Cada imagem deve ter no máximo 5MB.');
        return;
      }

      const preview = URL.createObjectURL(file);
      setImages(prev => [...prev, { file, preview, uploading: false }]);
    });

    setError(null);
  };

  const removeImage = (index: number) => {
    setImages(prev => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].preview);
      newImages.splice(index, 1);
      return newImages;
    });
  };

  const reorderImages = (fromIndex: number, toIndex: number) => {
    setImages(prev => {
      const newImages = [...prev];
      const [movedImage] = newImages.splice(fromIndex, 1);
      newImages.splice(toIndex, 0, movedImage);
      return newImages;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log('🚀 Iniciando criação de anúncio...');
      
      if (images.length === 0) {
        throw new Error('Por favor, adicione pelo menos uma foto do produto.');
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error('❌ Usuário não autenticado');
        navigate('/entrar');
        return;
      }

      console.log('✅ Usuário autenticado:', session.user.id);

      console.log('✅ Usuário autenticado:', session.user.id);

      console.log('📸 Fazendo upload de', images.length, 'imagens...');
      const imageUrls: string[] = [];
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        console.log(`📤 Uploading imagem ${i + 1}/${images.length}...`);
        
        setImages(prev => {
          const newImages = [...prev];
          newImages[i].uploading = true;
          return newImages;
        });

        const fileExt = image.file.name.split('.').pop()?.toLowerCase();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `products/${fileName}`;

        console.log(`📁 Caminho do arquivo: ${filePath}`);

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, image.file);

        if (uploadError) {
          console.error('❌ Erro no upload:', uploadError);
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        console.log(`✅ Imagem ${i + 1} uploaded:`, publicUrl);
        imageUrls.push(publicUrl);

        setImages(prev => {
          const newImages = [...prev];
          newImages[i].uploading = false;
          return newImages;
        });
      }

      console.log('💾 Salvando produto no banco de dados...');
      console.log('Dados do produto:', {
        title: formData.title.trim(),
        price: Number(formData.price.replace(/\D/g, '')) / 100,
        category: formData.category,
        user_id: session.user.id
      });

      const { data: insertedProduct, error: insertError } = await supabase
        .from('products')
        .insert({
          title: formData.title.trim(),
          description: formData.description.trim(),
          price: Number(formData.price.replace(/\D/g, '')) / 100,
          type: formData.type,
          period: formData.type === 'Aluguel' ? formData.period : null,
          brand: formData.brand.trim(),
          model: formData.model.trim(),
          year: formData.year,
          category: formData.category,
          location: formData.location.trim(),
          image_url: imageUrls[0],
          user_id: session.user.id,
          hours: formData.hours ? parseInt(formData.hours) : null,
          power: formData.power ? parseInt(formData.power) : null,
          implement_type: formData.implementType || null,
          work_width: formData.workWidth ? parseFloat(formData.workWidth) : null,
          part_type: formData.partType || null,
          part_condition: formData.partCondition || null,
          part_number: formData.partNumber || null
        })
        .select()
        .single();

      if (insertError) {
        console.error('❌ Erro ao inserir produto:', insertError);
        throw insertError;
      }
      if (!insertedProduct) {
        console.error('❌ Produto não foi criado');
        throw new Error('Erro ao criar produto');
      }

      console.log('✅ Produto criado com sucesso:', insertedProduct.id);

      if (imageUrls.length > 1) {
        console.log(`📸 Salvando ${imageUrls.length - 1} imagens adicionais...`);
        const { error: imagesError } = await supabase
          .from('product_images')
          .insert(
            imageUrls.slice(1).map((url, index) => ({
              product_id: insertedProduct.id,
              image_url: url,
              position: index + 1
            }))
          );

        if (imagesError) {
          console.error('❌ Erro ao salvar imagens adicionais:', imagesError);
          throw imagesError;
        }
        console.log('✅ Imagens adicionais salvas com sucesso');
      }

      console.log('🎉 Anúncio criado com sucesso! Redirecionando...');
      navigate('/meus-anuncios');
    } catch (err: any) {
      console.error('❌ Erro geral ao criar anúncio:', err);
      console.error('Detalhes do erro:', {
        message: err?.message,
        details: err?.details,
        hint: err?.hint,
        code: err?.code
      });
      
      let errorMessage = 'Erro ao criar anúncio';
      
      if (err?.message) {
        errorMessage = err.message;
      }
      
      if (err?.details) {
        errorMessage += ` - ${err.details}`;
      }
      
      if (err?.hint) {
        errorMessage += ` (Dica: ${err.hint})`;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Criar Anúncio</h1>
            <p className="mt-2 text-gray-600">
              Preencha os detalhes do seu anúncio para alcançar mais compradores
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 rounded-lg flex items-start gap-3">
              <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Fotos do Produto
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Adicione até 10 fotos do seu produto
                    </p>
                  </div>
                  <span className="text-sm font-medium text-gray-500">
                    {images.length}/10 fotos
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                  {images.map((image, index) => (
                    <div 
                      key={image.preview} 
                      className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden"
                    >
                      <img
                        src={image.preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover transition duration-200 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-200">
                        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                          {index === 0 ? (
                            <span className="px-2 py-1 bg-green-600 text-white text-xs font-medium rounded-full">
                              Principal
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => reorderImages(index, index - 1)}
                              className="p-1.5 bg-white text-gray-900 rounded-full hover:bg-gray-100 transition"
                            >
                              <GripHorizontal size={14} />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                      {image.uploading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                          <Loader2 className="animate-spin text-white" size={24} />
                        </div>
                      )}
                    </div>
                  ))}

                  {images.length < 10 && (
                    <label className="aspect-square bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-green-500 hover:bg-green-50 transition group">
                      <ImagePlus className="text-gray-400 group-hover:text-green-500 transition" size={32} />
                      <span className="mt-2 text-sm text-gray-500 group-hover:text-green-600 transition">
                        {images.length === 0 ? 'Adicionar fotos' : 'Mais fotos'}
                      </span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleImageChange}
                        multiple
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex gap-3">
                    <Info className="text-blue-600 shrink-0" size={20} />
                    <div>
                      <h4 className="text-sm font-medium text-blue-900">
                        Dicas para fotos melhores
                      </h4>
                      <ul className="mt-2 text-sm text-blue-700 space-y-1">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 size={14} />
                          Use boa iluminação
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 size={14} />
                          Mostre o produto de vários ângulos
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 size={14} />
                          Destaque detalhes importantes
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900">
                  Informações Básicas
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Preencha os dados principais do seu anúncio
                </p>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Título do Anúncio*
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                        placeholder="Ex: Trator John Deere 5075E"
                        required
                      />
                      <Tag className="absolute left-3 top-2.5 text-gray-400" size={20} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preço*
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                        placeholder="0,00"
                        required
                      />
                      <DollarSign className="absolute left-3 top-2.5 text-gray-400" size={20} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Anúncio*
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                      required
                    >
                      <option value="Venda">Venda</option>
                      <option value="Aluguel">Aluguel</option>
                    </select>
                  </div>

                  {formData.type === 'Aluguel' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Período de Aluguel*
                      </label>
                      <select
                        name="period"
                        value={formData.period}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                        required
                      >
                        <option value="">Selecione o período</option>
                        <option value="Diário">Diário</option>
                        <option value="Semanal">Semanal</option>
                        <option value="Mensal">Mensal</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Categoria*
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                      required
                    >
                      <option value="">Selecione uma categoria</option>
                      <option value="Tratores">Tratores</option>
                      <option value="Colheitadeiras">Colheitadeiras</option>
                      <option value="Implementos">Implementos</option>
                      <option value="Peças e Componentes">Peças e Componentes</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Marca*
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="brand"
                        value={formData.brand}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                        placeholder="Ex: John Deere"
                        required
                      />
                      <Building2 className="absolute left-3 top-2.5 text-gray-400" size={20} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Modelo*
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="model"
                        value={formData.model}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                        placeholder="Ex: 5075E"
                        required
                      />
                      <Tag className="absolute left-3 top-2.5 text-gray-400" size={20} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ano*
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="year"
                        value={formData.year}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                        placeholder="Ex: 2020"
                        maxLength={4}
                        required
                      />
                      <Calendar className="absolute left-3 top-2.5 text-gray-400" size={20} />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Localização*
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                      placeholder="Ex: São Paulo, SP"
                      required
                    />
                    <MapPin className="absolute left-3 top-2.5 text-gray-400" size={20} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição*
                  </label>
                  <div className="relative">
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={5}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-none"
                      placeholder="Descreva detalhadamente o produto, condições, acessórios inclusos, etc."
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900">
                  Informações Específicas
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Preencha os detalhes específicos do seu equipamento
                </p>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(formData.category === 'Tratores' || formData.category === 'Colheitadeiras') && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Horas de Uso*
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            name="hours"
                            value={formData.hours}
                            onChange={handleInputChange}
                            min="0"
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                            placeholder="Ex: 1500"
                            required
                          />
                          <Clock className="absolute left-3 top-2.5 text-gray-400" size={20} />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Potência (cv)*
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            name="power"
                            value={formData.power}
                            onChange={handleInputChange}
                            min="0"
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                            placeholder="Ex: 75"
                            required
                          />
                          <Gauge className="absolute left-3 top-2.5 text-gray-400" size={20} />
                        </div>
                      </div>
                    </>
                  )}

                  {formData.category === 'Implementos' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tipo de Implemento*
                        </label>
                        <div className="relative">
                          <select
                            name="implementType"
                            value={formData.implementType}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                            required
                          >
                            <option value="">Selecione o tipo</option>
                            <option value="Arado">Arado</option>
                            <option value="Grade">Grade</option>
                            <option value="Plantadeira">Plantadeira</option>
                            <option value="Pulverizador">Pulverizador</option>
                            <option value="Colhedora">Colhedora</option>
                            <option value="Semeadora">Semeadora</option>
                            <option value="Distribuidor">Distribuidor</option>
                            <option value="Carreta">Carreta</option>
                            <option value="Plataforma">Plataforma</option>
                            <option value="Subsolador">Subsolador</option>
                            <option value="Cultivador">Cultivador</option>
                            <option value="Roçadeira">Roçadeira</option>
                            <option value="Enleirador">Enleirador</option>
                            <option value="Enfardadeira">Enfardadeira</option>
                            <option value="Outro">Outro</option>
                          </select>
                          <Tool className="absolute left-3 top-2.5 text-gray-400" size={20} />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Largura de Trabalho (metros)*
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            name="workWidth"
                            value={formData.workWidth}
                            onChange={handleInputChange}
                            step="0.1"
                            min="0"
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                            placeholder="Ex: 3.5"
                            required
                          />
                          <Ruler className="absolute left-3 top-2.5 text-gray-400" size={20} />
                        </div>
                      </div>
                    </>
                  )}

                  {formData.category === 'Peças e Componentes' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tipo de Peça*
                        </label>
                        <div className="relative">
                          <select
                            name="partType"
                            value={formData.partType}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                            required
                          >
                            <option value="">Selecione o tipo</option>
                            <option value="Motor">Motor</option>
                            <option value="Transmissão">Transmissão</option>
                            <option value="Hidráulico">Sistema Hidráulico</option>
                            <option value="Elétrico">Sistema Elétrico</option>
                            <option value="Chassi">Chassi e Carroceria</option>
                            <option value="Suspensão">Suspensão</option>
                            <option value="Direção">Direção</option>
                            <option value="Freios">Freios</option>
                            <option value="Embreagem">Embreagem</option>
                            <option value="Filtros">Filtros</option>
                            <option value="Rolamentos">Rolamentos</option>
                            <option value="Correias">Correias</option>
                            <option value="Outro">Outro</option>
                          </select>
                          <Settings className="absolute left-3 top-2.5 text-gray-400" size={20} />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Estado da Peça*
                        </label>
                        <div className="relative">
                          <select
                            name="partCondition"
                            value={formData.partCondition}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                            required
                          >
                            <option value="">Selecione o estado</option>
                            <option value="Nova">Nova</option>
                            <option value="Usada">Usada</option>
                            <option value="Recondicionada">Recondicionada</option>
                          </select>
                          <Tag className="absolute left-3 top-2.5 text-gray-400" size={20} />
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Número da Peça (se disponível)
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            name="partNumber"
                            value={formData.partNumber}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                            placeholder="Ex: ABC123XYZ"
                          />
                          <FileText className="absolute left-3 top-2.5 text-gray-400" size={20} />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-500 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span>Criando anúncio...</span>
                  </>
                ) : (
                  <>
                    <Upload size={20} />
                    <span>Publicar Anúncio</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}