import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
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
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import imageCompression from 'browser-image-compression';
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
  const [showProfileIncompleteModal, setShowProfileIncompleteModal] = useState(false);
  const [useProfileLocation, setUseProfileLocation] = useState(true);
  const [profileLocation, setProfileLocation] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [states, setStates] = useState<Array<{ sigla: string; nome: string }>>([]);
  const [cities, setCities] = useState<Array<{ nome: string }>>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [yearError, setYearError] = useState(false);
  const yearInputRef = useRef<HTMLInputElement>(null);
  const [compressing, setCompressing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState('');
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
        return;
      }

      // Verificar se o usuário tem cidade e estado cadastrados
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('city, state')
        // @ts-expect-error - Supabase type issue
        .eq('user_id', session.user.id)
        .single();

      if (profileError || !profile || !(profile as any).city || !(profile as any).state) {
        setShowProfileIncompleteModal(true);
        return;
      }

      // Salvar localização do perfil
      const locationFormatted = `${(profile as any).city} - ${(profile as any).state}`;
      setProfileLocation(locationFormatted);
      setFormData(prev => ({ ...prev, location: locationFormatted }));
    };
    
    checkAuth();
  }, [navigate]);

  // Carregar estados da API do IBGE
  useEffect(() => {
    const fetchStates = async () => {
      try {
        const response = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome');
        const data = await response.json();
        setStates(data);
      } catch (err) {
        console.error('Erro ao carregar estados:', err);
      }
    };

    fetchStates();
  }, []);

  // Carregar cidades quando o estado for selecionado
  useEffect(() => {
    if (selectedState && !useProfileLocation) {
      const fetchCities = async () => {
        setLoadingCities(true);
        try {
          const response = await fetch(
            `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedState}/municipios?orderBy=nome`
          );
          const data = await response.json();
          setCities(data);
        } catch (err) {
          console.error('Erro ao carregar cidades:', err);
        } finally {
          setLoadingCities(false);
        }
      };

      fetchCities();
    }
  }, [selectedState, useProfileLocation]);

  // Atualizar localização quando mudar a opção
  useEffect(() => {
    if (useProfileLocation && profileLocation) {
      setFormData(prev => ({ ...prev, location: profileLocation }));
      setSelectedState('');
      setSelectedCity('');
    } else if (!useProfileLocation) {
      setFormData(prev => ({ ...prev, location: '' }));
    }
  }, [useProfileLocation, profileLocation]);

  // Atualizar localização quando cidade for selecionada
  useEffect(() => {
    if (selectedCity && selectedState && !useProfileLocation) {
      const locationFormatted = `${selectedCity} - ${selectedState}`;
      setFormData(prev => ({ ...prev, location: locationFormatted }));
    }
  }, [selectedCity, selectedState, useProfileLocation]);


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

    // Validar ano em tempo real
    if (name === 'year') {
      const currentYear = new Date().getFullYear();
      const yearValue = parseInt(value);
      if (value && yearValue > currentYear) {
        setYearError(true);
      } else {
        setYearError(false);
      }
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length === 0) {
      console.log('⚠️ Nenhum arquivo selecionado');
      return;
    }

    console.log('=== INÍCIO DO UPLOAD ===');
    console.log(`📸 ${files.length} arquivo(s) selecionado(s)`);
    console.log(`📊 Fotos já adicionadas: ${images.length}/10`);
    
    setCompressing(true);
    setCompressionProgress(`Processando ${files.length} foto(s)...`);
    
    // Calcular quantas fotos ainda cabem
    const remainingSlots = 10 - images.length;
    console.log(`🎯 Slots disponíveis: ${remainingSlots}`);
    
    if (remainingSlots === 0) {
      setError('Você já atingiu o limite de 10 fotos.');
      setCompressing(false);
      setCompressionProgress('');
      e.target.value = '';
      return;
    }

    const validFiles: File[] = [];
    const errors: string[] = [];
    
    console.log('🔍 Verificando e comprimindo cada arquivo:');
    
    for (let index = 0; index < files.length; index++) {
      const file = files[index];
      const fileSizeMB = file.size / 1024 / 1024;
      
      setCompressionProgress(`Comprimindo foto ${index + 1} de ${files.length}...`);
      
      console.log(`\n  Arquivo ${index + 1}/${files.length}:`, {
        nome: file.name,
        tipo: file.type,
        tamanhoOriginal: `${fileSizeMB.toFixed(2)} MB`,
        tamanhoByte: file.size
      });

      // Aceitar qualquer tipo de imagem
      if (!file.type.startsWith('image/')) {
        console.error(`  ❌ REJEITADO: ${file.name} - não é uma imagem (tipo: ${file.type})`);
        errors.push(`"${file.name}" não é uma imagem válida`);
        continue;
      }

      try {
        // Comprimir imagem automaticamente
        console.log(`  🗜️ Comprimindo ${file.name}...`);
        
        const options = {
          maxSizeMB: 2, // Tamanho máximo de 2MB após compressão
          maxWidthOrHeight: 1920, // Máximo 1920px (Full HD)
          useWebWorker: true,
          fileType: 'image/jpeg' // Converter tudo para JPEG (melhor compressão)
        };
        
        const compressedFile = await imageCompression(file, options);
        const compressedSizeMB = compressedFile.size / 1024 / 1024;
        
        console.log(`  ✅ Comprimido: ${fileSizeMB.toFixed(2)} MB → ${compressedSizeMB.toFixed(2)} MB (${((1 - compressedSizeMB / fileSizeMB) * 100).toFixed(0)}% menor)`);
        
        validFiles.push(compressedFile);
      } catch (compressionError) {
        console.error(`  ❌ Erro ao comprimir ${file.name}:`, compressionError);
        errors.push(`Erro ao processar "${file.name}"`);
      }
    }
    
    console.log(`\n📋 Resumo da validação:`);
    console.log(`  - Total selecionado: ${files.length}`);
    console.log(`  - Arquivos válidos: ${validFiles.length}`);
    console.log(`  - Arquivos com erro: ${errors.length}`);

    // Mostrar erros se houver
    if (errors.length > 0 && validFiles.length === 0) {
      console.log('❌ TODOS os arquivos foram rejeitados');
      setError(`Erro: ${errors.join(', ')}`);
      e.target.value = '';
      return;
    }

    if (validFiles.length > 0) {
      // Limitar ao número de slots disponíveis
      const filesToAdd = validFiles.slice(0, remainingSlots);
      const filesRejected = validFiles.length - filesToAdd.length;
      
      console.log(`\n🎯 Processamento final:`);
      console.log(`  - Arquivos válidos: ${validFiles.length}`);
      console.log(`  - Slots disponíveis: ${remainingSlots}`);
      console.log(`  - Serão adicionados: ${filesToAdd.length}`);
      console.log(`  - Rejeitados por limite: ${filesRejected}`);
      
      if (filesRejected > 0) {
        console.log(`⚠️ ${filesRejected} arquivo(s) não adicionado(s) (limite de 10 fotos)`);
      }
      
      // Criar previews para todos os arquivos válidos
      console.log(`\n🖼️ Criando previews...`);
      const newImages: ImageFile[] = filesToAdd.map((file, idx) => {
        const preview = URL.createObjectURL(file);
        console.log(`  ${idx + 1}. Preview criado para: ${file.name}`);
        return {
          file,
          preview,
          uploading: false
        };
      });
      
      console.log(`✅ ${newImages.length} previews criados com sucesso`);
      console.log(`📦 Adicionando ao estado...`);
      
      // Adicionar todas as imagens de uma vez
      setImages(prev => {
        const updated = [...prev, ...newImages];
        console.log(`📊 Estado atualizado: ${prev.length} → ${updated.length} fotos`);
        return updated;
      });
      
      console.log('=== FIM DO UPLOAD ===\n');
      
      // Mostrar avisos se necessário
      const warnings: string[] = [];
      
      if (filesRejected > 0) {
        warnings.push(`${filesRejected} foto(s) não adicionada(s) - limite de 10 fotos atingido`);
      }
      
      if (errors.length > 0) {
        warnings.push(`Ignoradas: ${errors.join(', ')}`);
      }
      
      if (warnings.length > 0) {
        setError(`${filesToAdd.length} foto(s) adicionada(s). ${warnings.join('. ')}`);
        setTimeout(() => setError(null), 6000); // Limpar erro após 6s
      } else {
        setError(null);
      }
    }

    setCompressing(false);
    setCompressionProgress('');
    
    // Limpar o input para permitir selecionar o mesmo arquivo novamente
    e.target.value = '';
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

      // Validar se localização foi selecionada
      if (!formData.location || formData.location.trim() === '') {
        setError('Por favor, selecione a localização do produto.');
        setLoading(false);
        return;
      }

      // Validar se o ano não é no futuro
      const currentYear = new Date().getFullYear();
      const productYear = parseInt(formData.year);
      if (productYear > currentYear) {
        setError(`O ano de fabricação não pode ser no futuro. O ano máximo é ${currentYear}.`);
        setYearError(true);
        setLoading(false);
        // Scroll para o campo de ano
        if (yearInputRef.current) {
          yearInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
          yearInputRef.current.focus();
        }
        return;
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
        // @ts-expect-error - Supabase type issue
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
          part_condition: (formData.partCondition as 'Nova' | 'Usada' | 'Recondicionada') || null,
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

      console.log('✅ Produto criado com sucesso:', (insertedProduct as any).id);

      if (imageUrls.length > 1) {
        console.log(`📸 Salvando ${imageUrls.length - 1} imagens adicionais...`);
        const { error: imagesError } = await supabase
          .from('product_images')
          .insert(
            imageUrls.slice(1).map((url, index) => ({
              product_id: (insertedProduct as any).id,
              image_url: url,
              position: index + 1
            })) as any
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
                {/* Indicador de compressão */}
                {compressing && (
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Loader2 className="animate-spin text-blue-600" size={24} />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-blue-900">
                          {compressionProgress}
                        </p>
                        <p className="text-xs text-blue-700 mt-1">
                          Aguarde, otimizando suas fotos...
                        </p>
                      </div>
                    </div>
                  </div>
                )}

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
                        accept="image/*"
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
                        ref={yearInputRef}
                        type="number"
                        name="year"
                        value={formData.year}
                        onChange={handleInputChange}
                        onWheel={(e) => e.currentTarget.blur()}
                        min="1900"
                        className={`w-full pl-10 pr-4 py-2.5 border ${yearError ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none`}
                        placeholder="Ex: 2020"
                        required
                      />
                      <Calendar className={`absolute left-3 top-2.5 ${yearError ? 'text-red-500' : 'text-gray-400'}`} size={20} />
                      {yearError && (
                        <AlertCircle className="absolute right-3 top-2.5 text-red-500" size={20} />
                      )}
                    </div>
                    {yearError && (
                      <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                        ❌ O ano de fabricação não pode ser no futuro. O ano máximo é {new Date().getFullYear()}.
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Localização*
                  </label>
                  
                  {/* Opções de localização */}
                  <div className="flex gap-4 mb-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={useProfileLocation}
                        onChange={() => setUseProfileLocation(true)}
                        className="w-4 h-4 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm">Usar localização do meu perfil</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={!useProfileLocation}
                        onChange={() => setUseProfileLocation(false)}
                        className="w-4 h-4 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm">Outra localização</span>
                    </label>
                  </div>

                  {useProfileLocation ? (
                    // Mostrar localização do perfil
                    <div>
                      <div className="relative">
                        <input
                          type="text"
                          value={profileLocation}
                          readOnly
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed outline-none"
                          placeholder="Carregando localização..."
                        />
                        <MapPin className="absolute left-3 top-2.5 text-gray-400" size={20} />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        📍 Usando localização do perfil: <span className="font-medium">{profileLocation}</span>
                      </p>
                    </div>
                  ) : (
                    // Selects de Estado e Cidade
                    <div className="space-y-3">
                      {/* Select de Estado */}
                      <div className="relative">
                        <select
                          value={selectedState}
                          onChange={(e) => {
                            setSelectedState(e.target.value);
                            setSelectedCity('');
                            setCities([]);
                          }}
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none appearance-none bg-white"
                          required
                        >
                          <option value="">Selecione o estado</option>
                          {states.map((state) => (
                            <option key={state.sigla} value={state.sigla}>
                              {state.nome} ({state.sigla})
                            </option>
                          ))}
                        </select>
                        <MapPin className="absolute left-3 top-2.5 text-gray-400 pointer-events-none" size={20} />
                        <ChevronRight className="absolute right-3 top-2.5 text-gray-400 pointer-events-none rotate-90" size={20} />
                      </div>

                      {/* Select de Cidade */}
                      {selectedState && (
                        <div className="relative">
                          <select
                            value={selectedCity}
                            onChange={(e) => setSelectedCity(e.target.value)}
                            disabled={loadingCities || cities.length === 0}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none appearance-none bg-white disabled:bg-gray-50 disabled:cursor-not-allowed"
                            required
                          >
                            <option value="">
                              {loadingCities ? 'Carregando cidades...' : 'Selecione a cidade'}
                            </option>
                            {cities.map((city) => (
                              <option key={city.nome} value={city.nome}>
                                {city.nome}
                              </option>
                            ))}
                          </select>
                          <Building2 className="absolute left-3 top-2.5 text-gray-400 pointer-events-none" size={20} />
                          <ChevronRight className="absolute right-3 top-2.5 text-gray-400 pointer-events-none rotate-90" size={20} />
                        </div>
                      )}

                      {/* Campo oculto para enviar no formulário */}
                      <input type="hidden" name="location" value={formData.location} required />

                      {formData.location && (
                        <p className="text-xs text-green-600 mt-1">
                          ✅ Localização selecionada: <span className="font-medium">{formData.location}</span>
                        </p>
                      )}
                    </div>
                  )}
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

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900">
                  Descrição do Produto
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Descreva detalhadamente seu produto para atrair mais compradores
                </p>
              </div>

              <div className="p-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição Completa*
                  </label>
                  <div className="relative">
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={6}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-none"
                      placeholder="Descreva detalhadamente o produto, condições gerais, histórico de manutenções, acessórios inclusos, motivo da venda, etc."
                      required
                    />
                  </div>
                  <div className="mt-3 bg-blue-50 rounded-lg p-4">
                    <div className="flex gap-3">
                      <Info className="text-blue-600 shrink-0" size={20} />
                      <div>
                        <h4 className="text-sm font-medium text-blue-900 mb-2">
                          💡 Dicas para uma boa descrição
                        </h4>
                        <ul className="text-sm text-blue-700 space-y-1">
                          <li className="flex items-start gap-2">
                            <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
                            <span>Informe o estado geral e conservação do equipamento</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
                            <span>Mencione histórico de manutenções e revisões</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
                            <span>Liste acessórios e implementos inclusos</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
                            <span>Descreva detalhes importantes que não foram mencionados acima</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
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

      {/* Modal de Perfil Incompleto */}
      {showProfileIncompleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-fadeIn">
            <div className="flex flex-col items-center text-center">
              {/* Ícone */}
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                <Info className="text-amber-600" size={32} />
              </div>

              {/* Título */}
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Complete seu Perfil
              </h3>

              {/* Mensagem */}
              <p className="text-gray-600 mb-4 leading-relaxed">
                Para criar anúncios, você precisa informar sua <span className="font-semibold text-gray-900">cidade</span> e <span className="font-semibold text-gray-900">estado</span> no seu perfil. 
                Isso ajuda os compradores a encontrarem produtos perto deles!
              </p>

              {/* Dica */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 w-full">
                <p className="text-sm text-green-800">
                  <strong>💡 Dica:</strong> Se você mora na zona rural, selecione a opção "Zona Rural" e informe a cidade de referência mais próxima.
                </p>
              </div>

              {/* Botões */}
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <button
                  onClick={() => navigate('/')}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  Voltar
                </button>
                <button
                  onClick={() => navigate('/perfil', { 
                    state: { 
                      message: 'Por favor, preencha sua localização para poder criar anúncios.',
                      from: '/vender' 
                    } 
                  })}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium shadow-lg shadow-green-600/30"
                >
                  Completar Perfil
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}