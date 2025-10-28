import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  AlertCircle, 
  Loader2, 
  User, 
  FileText, 
  Phone, 
  MapPin, 
  Building2, 
  FileEdit, 
  ShoppingBag,
  Settings,
  LogOut,
  ChevronRight,
  Star,
  Camera,
  Plus,
  Pencil,
  Trash2,
  Tractor,
  Home
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';
import type { Product } from '../hooks/useProducts';

type Profile = Database['public']['Tables']['profiles']['Row'];

type TabType = 'personal' | 'listings' | 'favorites' | 'settings';

export default function Profile() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('personal');
  const [userProducts, setUserProducts] = useState<Product[]>([]);

  // Verificar se há mensagem vinda da navegação
  useEffect(() => {
    if (location.state?.message) {
      setError(location.state.message);
      // Limpar o state
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  useEffect(() => {
    async function loadProfile() {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;
        if (!session) {
          navigate('/entrar', { state: { from: '/perfil' } });
          return;
        }

        // Carregar perfil do usuário
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          // @ts-expect-error - Supabase type issue
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (profileError && profileError.code !== 'PGRST116') {
          throw profileError;
        }

        if (profile) {
          setProfile(profile as any);
          setFormData({
            full_name: (profile as any).full_name || '',
            cpf_cnpj: (profile as any).cpf_cnpj || '',
            phone: (profile as any).phone || '',
            address: (profile as any).address || '',
            neighborhood: (profile as any).neighborhood || '',
            city: (profile as any).city || '',
            state: (profile as any).state || '',
            postal_code: (profile as any).postal_code || '',
            company_name: (profile as any).company_name || '',
            bio: (profile as any).bio || '',
            location_type: (profile as any).location_type || 'urban',
          });
        }

        // Carregar produtos do usuário
        const { data: products, error: productsError } = await supabase
          .from('products')
          .select('*')
          // @ts-expect-error - Supabase type issue
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });

        if (productsError) throw productsError;
        setUserProducts((products as any) || []);

      } catch (err) {
        console.error('Erro ao carregar perfil:', err);
        setError('Erro ao carregar perfil. Por favor, tente novamente.');
      }
    }

    loadProfile();
  }, [navigate]);

  const [formData, setFormData] = useState({
    full_name: '',
    cpf_cnpj: '',
    phone: '',
    address: '',
    neighborhood: '',
    city: '',
    state: '',
    postal_code: '',
    company_name: '',
    bio: '',
    location_type: 'urban',
  });

  const [loadingCep, setLoadingCep] = useState(false);
  const [cepError, setCepError] = useState(false);
  const [cities, setCities] = useState<Array<{ nome: string }>>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [manuallyEditedAddress, setManuallyEditedAddress] = useState(false);
  const [cepData, setCepData] = useState<{ city: string; state: string } | null>(null);

  // Carregar cidades quando o estado for selecionado
  useEffect(() => {
    if (formData.state && formData.state.length === 2) {
      const fetchCities = async () => {
        setLoadingCities(true);
        try {
          const response = await fetch(
            `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${formData.state}/municipios?orderBy=nome`
          );
          const data = await response.json();
          setCities(data);
        } catch (err) {
          console.error('Erro ao carregar cidades:', err);
          setCities([]);
        } finally {
          setLoadingCities(false);
        }
      };

      fetchCities();
    } else {
      setCities([]);
    }
  }, [formData.state]);

  // Buscar CEP na API ViaCEP (só para zona urbana)
  const fetchAddressByCep = async (cep: string) => {
    // Só busca CEP se for zona urbana
    if (formData.location_type === 'rural') {
      return;
    }

    const cleanCep = cep.replace(/\D/g, '');
    
    if (cleanCep.length !== 8) return;

    setLoadingCep(true);
    setError(null);
    setCepError(false);

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      
      if (!response.ok) {
        throw new Error('Erro ao consultar CEP');
      }

      const data = await response.json();

      if (data.erro) {
        setCepError(true);
        setError('❌ CEP não encontrado. Verifique o número digitado e tente novamente.');
        
        // Limpar campos que foram preenchidos automaticamente
        setFormData(prev => ({
          ...prev,
          address: '',
          neighborhood: '',
          city: '',
          state: '',
        }));

        // Mostrar toast de erro
        const errorToast = document.createElement('div');
        errorToast.className = 'fixed top-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fadeIn flex items-center gap-3';
        errorToast.innerHTML = `
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
          <span>CEP não encontrado. Verifique o número digitado.</span>
        `;
        document.body.appendChild(errorToast);
        
        setTimeout(() => {
          errorToast.remove();
        }, 4000);

        return;
      }

      // Validar se retornou dados válidos
      if (!data.localidade || !data.uf) {
        setCepError(true);
        setError('CEP válido, mas sem dados de endereço. Preencha manualmente.');
        return;
      }

      // Preencher automaticamente os campos
      setFormData(prev => ({
        ...prev,
        address: data.logradouro || prev.address,
        neighborhood: data.bairro || prev.neighborhood,
        city: data.localidade || prev.city,
        state: data.uf || prev.state,
      }));

      // Armazenar dados do CEP para validação posterior
      setCepData({
        city: data.localidade,
        state: data.uf
      });

      // Resetar flag de edição manual ao preencher via CEP
      setManuallyEditedAddress(false);

      // Mostrar toast de sucesso
      const successToast = document.createElement('div');
      successToast.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fadeIn flex items-center gap-3';
      successToast.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <span>✅ Endereço encontrado: ${data.localidade} - ${data.uf}</span>
      `;
      document.body.appendChild(successToast);
      
      setTimeout(() => {
        successToast.remove();
      }, 3000);

      console.log('✅ Endereço encontrado:', data);
    } catch (err) {
      console.error('Erro ao buscar CEP:', err);
      setCepError(true);
      setError('Erro ao consultar CEP. Verifique sua conexão e tente novamente.');
      
      // Mostrar toast de erro de conexão
      const errorToast = document.createElement('div');
      errorToast.className = 'fixed top-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fadeIn flex items-center gap-3';
      errorToast.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <span>Erro ao consultar CEP. Tente novamente.</span>
      `;
      document.body.appendChild(errorToast);
      
      setTimeout(() => {
        errorToast.remove();
      }, 4000);
    } finally {
      setLoadingCep(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    // Limpar campos específicos ao mudar tipo de localização
    if (name === 'location_type') {
      if (value === 'rural') {
        // Ao mudar para rural, limpar CEP e bairro
        setFormData(prev => ({ 
          ...prev, 
          [name]: value,
          postal_code: '',
          neighborhood: ''
        }));
      } else if (value === 'urban') {
        // Ao mudar para urbana, limpar endereço (que era nome da fazenda)
        setFormData(prev => ({ 
          ...prev, 
          [name]: value,
          address: ''
        }));
      }
      setCepError(false);
      return;
    }
    
    // Formatar CPF/CNPJ
    if (name === 'cpf_cnpj') {
      const numbers = value.replace(/\D/g, '');
      let formatted = numbers;
      if (numbers.length <= 11) {
        formatted = numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/g, '$1.$2.$3-$4');
      } else {
        formatted = numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/g, '$1.$2.$3/$4-$5');
      }
      setFormData(prev => ({ ...prev, [name]: formatted }));
      return;
    }

    // Formatar telefone
    if (name === 'phone') {
      const numbers = value.replace(/\D/g, '');
      const formatted = numbers.replace(/(\d{2})(\d{5})(\d{4})/g, '($1) $2-$3');
      setFormData(prev => ({ ...prev, [name]: formatted }));
      return;
    }

    // Formatar CEP
    if (name === 'postal_code') {
      const numbers = value.replace(/\D/g, '');
      const formatted = numbers.replace(/(\d{5})(\d{3})/g, '$1-$2');
      setFormData(prev => ({ ...prev, [name]: formatted }));
      
      // Buscar endereço automaticamente quando CEP estiver completo
      if (numbers.length === 8) {
        fetchAddressByCep(numbers);
      } else {
        // Se o usuário está mudando o CEP, resetar a flag de edição manual e dados do CEP
        setManuallyEditedAddress(false);
        setCepData(null);
      }
      return;
    }

    // Estado sempre em maiúsculo
    if (name === 'state') {
      setManuallyEditedAddress(true); // Marca que o usuário editou manualmente
      setFormData(prev => ({ ...prev, [name]: value.toUpperCase(), city: '' }));
      return;
    }

    // Se o usuário mudar a cidade manualmente
    if (name === 'city') {
      setManuallyEditedAddress(true); // Marca que o usuário editou manualmente
      setFormData(prev => ({ ...prev, [name]: value }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session) {
        navigate('/entrar');
        return;
      }

      // Validar campos obrigatórios
      if (!formData.full_name || !formData.cpf_cnpj || !formData.phone) {
        setError('Por favor, preencha todos os campos obrigatórios.');
        setLoading(false);
        return;
      }

      // Validar telefone
      const phoneNumbers = formData.phone.replace(/\D/g, '');
      if (phoneNumbers.length !== 11) {
        setError('Telefone inválido. Use o formato (00) 00000-0000 com 11 dígitos.');
        setLoading(false);
        return;
      }

      // Validar se zona urbana tem CEP preenchido e se os dados batem
      if (formData.location_type === 'urban' && formData.postal_code && cepData) {
        const cleanCep = formData.postal_code.replace(/\D/g, '');
        
        if (cleanCep.length === 8) {
          // Verificar se cidade ou estado foi alterado manualmente
          if (formData.city !== cepData.city || formData.state !== cepData.state) {
            setError(`Os dados não correspondem ao CEP informado. CEP ${formData.postal_code} pertence a ${cepData.city} - ${cepData.state}. Por favor, corrija o CEP ou mantenha os dados preenchidos automaticamente.`);
            setLoading(false);
            return;
          }
        }
      }

      // Remover formatação dos campos antes de enviar
      const cleanData = {
        ...formData,
        cpf_cnpj: formData.cpf_cnpj.replace(/\D/g, ''),
        phone: formData.phone.replace(/\D/g, ''),
        postal_code: formData.postal_code.replace(/\D/g, '')
      };

      const { error: updateError } = await supabase
        .from('profiles')
        // @ts-expect-error - Supabase type issue
        .update({
          ...cleanData,
          updated_at: new Date().toISOString(),
        })
        // @ts-expect-error - Supabase type issue
        .eq('user_id', session.user.id);

      if (updateError) {
        if (updateError.message.includes('CPF/CNPJ inválido')) {
          setError('CPF/CNPJ inválido. Verifique se os números estão corretos.');
        } else if (updateError.message.includes('Telefone inválido')) {
          setError('Telefone inválido. Use o formato (00) 00000-0000 com 11 dígitos.');
        } else if (updateError.message.includes('CEP inválido')) {
          setError('CEP inválido. Use o formato 00000-000.');
        } else if (updateError.message.includes('Estado inválido')) {
          setError('Estado inválido. Use a sigla do estado (ex: SP, RJ).');
        } else if (updateError.message.includes('Cidade inválida')) {
          setError('Cidade inválida. Insira o nome completo da cidade.');
        } else if (updateError.message.includes('Endereço inválido')) {
          setError('Endereço inválido. Insira o endereço completo.');
        } else if (updateError.message.includes('Nome inválido')) {
          setError('Nome inválido. Insira seu nome completo.');
        } else if (updateError.code === '23505') {
          if (updateError.message.includes('cpf_cnpj')) {
            setError('Este CPF/CNPJ já está cadastrado.');
          } else {
            setError('Erro de duplicidade. Algum dos dados informados já está em uso.');
          }
        } else {
          console.error('Erro ao atualizar perfil:', updateError);
          setError('Erro ao atualizar perfil. Por favor, tente novamente.');
        }
        return;
      }

      // Atualizar o perfil local
      setProfile(prev => prev ? { ...prev, ...cleanData } : null);
      
      // Mostrar mensagem de sucesso
      const successMessage = document.createElement('div');
      successMessage.className = 'fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg';
      successMessage.textContent = 'Perfil atualizado com sucesso!';
      document.body.appendChild(successMessage);
      
      setTimeout(() => {
        successMessage.remove();
      }, 3000);

    } catch (err) {
      console.error('Erro ao atualizar perfil:', err);
      setError('Erro ao atualizar perfil. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este anúncio?')) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        // @ts-expect-error - Supabase type issue
        .eq('id', productId);

      if (error) throw error;

      // Atualizar a lista de produtos
      setUserProducts(prev => prev.filter(p => p.id !== productId));
    } catch (err) {
      console.error('Erro ao excluir anúncio:', err);
      setError('Erro ao excluir anúncio. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/entrar');
    } catch (err) {
      console.error('Erro ao fazer logout:', err);
      setError('Erro ao fazer logout. Por favor, tente novamente.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {error && (
            <div className="mb-6 p-4 bg-red-50 rounded-lg flex items-start gap-3">
              <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Profile Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center">
                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profile.full_name}
                        className="h-20 w-20 rounded-full object-cover"
                      />
                    ) : (
                      <User className="text-gray-600" size={32} />
                    )}
                  </div>
                  <button 
                    className="absolute bottom-0 right-0 bg-gray-900 text-white p-2 rounded-full hover:bg-gray-800 transition"
                    title="Alterar foto"
                  >
                    <Camera size={16} />
                  </button>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {profile?.full_name || 'Complete seu perfil'}
                  </h1>
                  {profile?.company_name && (
                    <p className="text-gray-600">{profile.company_name}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="border-b border-gray-200">
              <nav className="flex">
                <button
                  onClick={() => setActiveTab('personal')}
                  className={`px-6 py-3 text-sm font-medium border-b-2 ${
                    activeTab === 'personal'
                      ? 'border-green-600 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Dados Pessoais
                </button>
                <button
                  onClick={() => setActiveTab('listings')}
                  className={`px-6 py-3 text-sm font-medium border-b-2 ${
                    activeTab === 'listings'
                      ? 'border-green-600 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Meus Anúncios
                </button>
                <button
                  onClick={() => setActiveTab('favorites')}
                  className={`px-6 py-3 text-sm font-medium border-b-2 ${
                    activeTab === 'favorites'
                      ? 'border-green-600 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Favoritos
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`px-6 py-3 text-sm font-medium border-b-2 ${
                    activeTab === 'settings'
                      ? 'border-green-600 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Configurações
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'personal' && (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Nome Completo */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nome Completo*
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="full_name"
                          value={formData.full_name}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                          placeholder="Seu nome completo"
                        />
                        <User className="absolute left-3 top-2.5 text-gray-600" size={20} />
                      </div>
                    </div>

                    {/* CPF/CNPJ */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CPF/CNPJ*
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="cpf_cnpj"
                          value={formData.cpf_cnpj}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                          placeholder="000.000.000-00"
                          maxLength={18}
                        />
                        <FileText className="absolute left-3 top-2.5 text-gray-600" size={20} />
                      </div>
                    </div>

                    {/* Telefone */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Telefone*
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                          placeholder="(00) 00000-0000"
                          maxLength={15}
                        />
                        <Phone className="absolute left-3 top-2.5 text-gray-600" size={20} />
                      </div>
                    </div>

                    {/* Tipo de Localização */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo de Localização*
                      </label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer px-4 py-3 border-2 rounded-lg transition hover:bg-gray-50"
                          style={{
                            borderColor: formData.location_type === 'urban' ? '#16a34a' : '#e5e7eb',
                            backgroundColor: formData.location_type === 'urban' ? '#f0fdf4' : 'white'
                          }}>
                          <input
                            type="radio"
                            name="location_type"
                            value="urban"
                            checked={formData.location_type === 'urban'}
                            onChange={handleInputChange}
                            className="w-4 h-4 text-green-600 focus:ring-green-500"
                          />
                          <Building2 className="text-gray-600" size={20} />
                          <span className="text-sm font-medium">Zona Urbana (Cidade)</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer px-4 py-3 border-2 rounded-lg transition hover:bg-gray-50"
                          style={{
                            borderColor: formData.location_type === 'rural' ? '#16a34a' : '#e5e7eb',
                            backgroundColor: formData.location_type === 'rural' ? '#f0fdf4' : 'white'
                          }}>
                          <input
                            type="radio"
                            name="location_type"
                            value="rural"
                            checked={formData.location_type === 'rural'}
                            onChange={handleInputChange}
                            className="w-4 h-4 text-green-600 focus:ring-green-500"
                          />
                          <Tractor className="text-green-600" size={20} />
                          <span className="text-sm font-medium">Zona Rural (Fazenda/Sítio)</span>
                        </label>
                      </div>
                    </div>

                    {/* CEP - Apenas para zona urbana */}
                    {formData.location_type === 'urban' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          CEP
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            name="postal_code"
                            value={formData.postal_code}
                            onChange={handleInputChange}
                            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none ${
                              cepError 
                                ? 'border-red-300 focus:border-red-500 bg-red-50' 
                                : 'border-gray-200 focus:border-green-500'
                            }`}
                            placeholder="00000-000"
                            maxLength={9}
                          />
                          {loadingCep ? (
                            <Loader2 className="absolute left-3 top-2.5 text-green-600 animate-spin" size={20} />
                          ) : cepError ? (
                            <AlertCircle className="absolute left-3 top-2.5 text-red-500" size={20} />
                          ) : (
                            <MapPin className="absolute left-3 top-2.5 text-gray-600" size={20} />
                          )}
                        </div>
                        {cepError && (
                          <p className="text-xs text-red-600 mt-1">
                            CEP inválido ou não encontrado
                          </p>
                        )}
                      </div>
                    )}

                    {/* Endereço/Propriedade */}
                    <div className={formData.location_type === 'urban' ? '' : 'md:col-span-2'}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {formData.location_type === 'rural' 
                          ? 'Nome da Fazenda/Propriedade' 
                          : 'Endereço'
                        }
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                          placeholder={
                            formData.location_type === 'rural' 
                              ? 'Ex: Fazenda Santa Rita' 
                              : 'Rua, número, complemento'
                          }
                          disabled={formData.location_type === 'urban' && loadingCep}
                        />
                        <Home className="absolute left-3 top-2.5 text-gray-600" size={20} />
                      </div>
                    </div>

                    {/* Bairro - Apenas para zona urbana */}
                    {formData.location_type === 'urban' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Bairro
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            name="neighborhood"
                            value={formData.neighborhood}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                            placeholder="Seu bairro"
                            disabled={loadingCep}
                          />
                          <MapPin className="absolute left-3 top-2.5 text-gray-600" size={20} />
                        </div>
                      </div>
                    )}

                    {/* Cidade */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cidade*
                      </label>
                      <div className="relative">
                        <select
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          required
                          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none appearance-none bg-white disabled:bg-gray-50 disabled:cursor-not-allowed"
                          disabled={(formData.location_type === 'urban' && loadingCep) || !formData.state || loadingCities}
                        >
                          <option value="">
                            {!formData.state 
                              ? 'Selecione o estado primeiro' 
                              : loadingCities 
                                ? 'Carregando cidades...' 
                                : 'Selecione a cidade'}
                          </option>
                          {cities.map((city) => (
                            <option key={city.nome} value={city.nome}>
                              {city.nome}
                            </option>
                          ))}
                        </select>
                        <MapPin className="absolute left-3 top-2.5 text-gray-600 pointer-events-none" size={20} />
                        <ChevronRight className="absolute right-3 top-2.5 text-gray-600 pointer-events-none rotate-90" size={20} />
                      </div>
                      {formData.location_type === 'rural' && (
                        <p className="text-xs text-gray-500 mt-1">
                          Informe a cidade de referência mais próxima
                        </p>
                      )}
                    </div>

                    {/* Estado */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Estado*
                      </label>
                      <div className="relative">
                        <select
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          required
                          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none appearance-none bg-white"
                          disabled={formData.location_type === 'urban' && loadingCep}
                        >
                          <option value="">Selecione o estado</option>
                          <option value="AC">Acre</option>
                          <option value="AL">Alagoas</option>
                          <option value="AP">Amapá</option>
                          <option value="AM">Amazonas</option>
                          <option value="BA">Bahia</option>
                          <option value="CE">Ceará</option>
                          <option value="DF">Distrito Federal</option>
                          <option value="ES">Espírito Santo</option>
                          <option value="GO">Goiás</option>
                          <option value="MA">Maranhão</option>
                          <option value="MT">Mato Grosso</option>
                          <option value="MS">Mato Grosso do Sul</option>
                          <option value="MG">Minas Gerais</option>
                          <option value="PA">Pará</option>
                          <option value="PB">Paraíba</option>
                          <option value="PR">Paraná</option>
                          <option value="PE">Pernambuco</option>
                          <option value="PI">Piauí</option>
                          <option value="RJ">Rio de Janeiro</option>
                          <option value="RN">Rio Grande do Norte</option>
                          <option value="RS">Rio Grande do Sul</option>
                          <option value="RO">Rondônia</option>
                          <option value="RR">Roraima</option>
                          <option value="SC">Santa Catarina</option>
                          <option value="SP">São Paulo</option>
                          <option value="SE">Sergipe</option>
                          <option value="TO">Tocantins</option>
                        </select>
                        <MapPin className="absolute left-3 top-2.5 text-gray-600 pointer-events-none" size={20} />
                      </div>
                      {manuallyEditedAddress && formData.location_type === 'urban' && (
                        <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                          ⚠️ Você alterou manualmente. O CEP não será mais usado para preencher estes campos.
                        </p>
                      )}
                    </div>

                    {/* Nome da Empresa (Opcional) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nome da Empresa (Opcional)
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="company_name"
                          value={formData.company_name}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                          placeholder="Nome da sua empresa"
                        />
                        <Building2 className="absolute left-3 top-2.5 text-gray-600" size={20} />
                      </div>
                    </div>

                    {/* Bio (Opcional) */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bio (Opcional)
                      </label>
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                        placeholder="Conte um pouco sobre você ou sua empresa..."
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-500 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="animate-spin" size={20} />
                          <span>Salvando...</span>
                        </>
                      ) : (
                        <>
                          <FileEdit size={20} />
                          <span>Salvar Alterações</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {activeTab === 'listings' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Meus Anúncios
                    </h2>
                    <button
                      onClick={() => navigate('/vender')}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-500 transition flex items-center gap-2"
                    >
                      <ShoppingBag size={20} />
                      <span>Novo Anúncio</span>
                    </button>
                  </div>

                  {/* Lista de anúncios */}
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                      <p className="text-gray-600 mt-4">Carregando anúncios...</p>
                    </div>
                  ) : userProducts.length > 0 ? (
                    <div className="space-y-4">
                      {userProducts.map(product => (
                        <div
                          key={product.id}
                          className="bg-gray-50 rounded-lg p-4 flex items-center justify-between hover:bg-gray-100 transition cursor-pointer"
                          onClick={() => navigate(`/produto/${product.id}`)}
                        >
                          <div className="flex items-center gap-4">
                            <img
                              src={product.image_url}
                              alt={product.title}
                              className="h-16 w-16 rounded-lg object-cover"
                            />
                            <div>
                              <h3 className="font-medium text-gray-900">
                                {product.title}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {product.type === 'Venda' ? 'À venda' : `Para ${product.type}`}
                                {' • '}
                                R$ {product.price.toLocaleString('pt-BR')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/editar-anuncio/${product.id}`);
                              }}
                              className="p-2 text-gray-600 hover:text-gray-900 transition"
                              title="Editar"
                            >
                              <Pencil size={18} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(product.id);
                              }}
                              className="p-2 text-red-600 hover:text-red-900 transition"
                              title="Excluir"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <ShoppingBag className="mx-auto text-gray-600 mb-2" size={32} />
                      <p className="text-gray-600">
                        Você ainda não tem nenhum anúncio
                      </p>
                      <button
                        onClick={() => navigate('/vender')}
                        className="mt-4 inline-flex items-center gap-2 text-green-600 hover:text-green-500 font-medium"
                      >
                        <Plus size={20} />
                        Criar Primeiro Anúncio
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'favorites' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Meus Favoritos
                  </h2>

                  <div className="text-center py-8">
                    <Star className="mx-auto text-gray-600 mb-2" size={32} />
                    <p className="text-gray-600">
                      Você ainda não tem nenhum favorito
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Configurações
                  </h2>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <Settings className="text-gray-600" size={24} />
                        <div>
                          <h3 className="font-medium text-gray-900">
                            Notificações
                          </h3>
                          <p className="text-sm text-gray-500">
                            Gerenciar preferências de notificação
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="text-gray-600" size={20} />
                    </div>

                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-4 w-full p-4 bg-red-50 rounded-lg text-left hover:bg-red-100 transition"
                    >
                      <LogOut className="text-red-500" size={24} />
                      <div>
                        <h3 className="font-medium text-red-600">
                          Sair da Conta
                        </h3>
                        <p className="text-sm text-red-500">
                          Encerrar sessão atual
                        </p>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}