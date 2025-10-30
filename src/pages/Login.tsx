import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Lock, AlertCircle, Phone, FileText, Mail, Loader2, ArrowRight, UserPlus, Tractor, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isRegistering, setIsRegistering] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: boolean}>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    cpf_cnpj: '',
    phone: '',
  });
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    // Verificar se acabou de vir do link de recuperação
    const hasPasswordRecovery = localStorage.getItem('password_recovery_sent');
    
    // Listener para eventos de autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      // Se tiver marcação de recovery e houver sessão, mostrar tela de redefinição
      if (hasPasswordRecovery && session && (event === 'INITIAL_SESSION' || event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN')) {
        localStorage.removeItem('password_recovery_sent');
        setIsResettingPassword(true);
        setIsForgotPassword(false);
        setIsRegistering(false);
      }
    });

    // Verificar URL parameters
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const searchParams = new URLSearchParams(window.location.search);
    const type = hashParams.get('type') || searchParams.get('type');
    const accessToken = hashParams.get('access_token');
    
    // Se tiver type=recovery na URL
    if (type === 'recovery' || (accessToken && window.location.hash.includes('type=recovery'))) {
      localStorage.removeItem('password_recovery_sent');
      setIsResettingPassword(true);
      setIsForgotPassword(false);
      setIsRegistering(false);
      return;
    }

    // Apenas redireciona se NÃO for recovery e NÃO estiver redefinindo senha
    if (!isResettingPassword && !hasPasswordRecovery) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setHasSession(true);
          navigate((location.state as any)?.from || '/');
        } else {
          setHasSession(false);
        }
      });
    }

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate, location, isResettingPassword]);

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('Por favor, preencha todos os campos obrigatórios');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Por favor, insira um email válido');
      return false;
    }

    if (isRegistering) {
      if (!formData.full_name || !formData.cpf_cnpj || !formData.phone) {
        setError('Por favor, preencha todos os campos obrigatórios');
        return false;
      }

      if (formData.password !== formData.confirmPassword) {
        setError('As senhas não coincidem');
        return false;
      }

      if (formData.password.length < 8) {
        setError('A senha deve ter pelo menos 8 caracteres');
        return false;
      }

      const cpfCnpjNumbers = formData.cpf_cnpj.replace(/\D/g, '');
      if (cpfCnpjNumbers.length !== 11 && cpfCnpjNumbers.length !== 14) {
        setError('CPF/CNPJ inválido');
        return false;
      }

      const phoneNumbers = formData.phone.replace(/\D/g, '');
      if (phoneNumbers.length !== 11) {
        setError('Telefone inválido. Use o formato (00) 00000-0000 com 11 dígitos.');
        return false;
      }

      if (formData.full_name.trim().split(' ').length < 2) {
        setError('Por favor, insira seu nome completo');
        return false;
      }
    }

    return true;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
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

    if (name === 'phone') {
      const numbers = value.replace(/\D/g, '');
      const formatted = numbers.replace(/(\d{2})(\d{5})(\d{4})/g, '($1) $2-$3');
      setFormData(prev => ({ ...prev, [name]: formatted }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
    setSuccess(null);
    // Limpar erro do campo quando usuário digitar
    setFieldErrors(prev => ({ ...prev, [name]: false }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Se for redefinir senha (veio do link do email)
    if (isResettingPassword) {
      if (!formData.password || !formData.confirmPassword) {
        setError('Por favor, preencha a nova senha e confirme');
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError('As senhas não coincidem');
        return;
      }

      if (formData.password.length < 8) {
        setError('A senha deve ter pelo menos 8 caracteres');
        return;
      }

      setLoading(true);
      setError(null);
      setSuccess(null);

      try {
        const { error: updateError } = await supabase.auth.updateUser({
          password: formData.password
        });

        if (updateError) {
          console.error('Erro ao atualizar senha:', updateError);
          setError(`Erro ao redefinir senha: ${updateError.message}`);
          return;
        }

        setSuccess('Senha redefinida com sucesso! Faça login com sua nova senha.');
        
        // Fazer logout da sessão de recuperação
        await supabase.auth.signOut();
        
        // Limpar URL hash
        window.location.hash = '';
        
        setTimeout(() => {
          setIsResettingPassword(false);
          setFormData({
            email: '',
            password: '',
            confirmPassword: '',
            full_name: '',
            cpf_cnpj: '',
            phone: '',
          });
        }, 2000);
      } catch (err) {
        console.error('Erro:', err);
        setError('Erro ao processar sua solicitação. Por favor, tente novamente.');
      } finally {
        setLoading(false);
      }
      return;
    }

    // Se for recuperação de senha
    if (isForgotPassword) {
      if (!formData.email) {
        setError('Por favor, insira seu email');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError('Por favor, insira um email válido');
        return;
      }

      setLoading(true);
      setError(null);
      setSuccess(null);

      try {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(formData.email, {
          redirectTo: `${window.location.origin}/entrar`,
        });

        if (resetError) {
          console.error('Erro ao enviar email:', resetError);
          setError('Erro ao enviar email de recuperação. Tente novamente.');
          return;
        }

        // Marcar que enviamos email de recuperação
        localStorage.setItem('password_recovery_sent', 'true');

        setSuccess('Email de recuperação enviado! Verifique sua caixa de entrada.');
        setFormData({ ...formData, email: '' });
      } catch (err) {
        console.error('Erro:', err);
        setError('Erro ao processar sua solicitação. Por favor, tente novamente.');
      } finally {
        setLoading(false);
      }
      return;
    }

    // Validação normal para login/cadastro
    if (!validateForm()) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (!isRegistering) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (signInError) {
          if (signInError.message.includes('Invalid login credentials')) {
            setError('Email ou senha incorretos. Verifique seus dados e tente novamente.');
            setFieldErrors({ email: true, password: true });
          } else if (signInError.message.includes('Email not confirmed')) {
            setError('Por favor, confirme seu email antes de fazer login. Verifique sua caixa de entrada.');
            setFieldErrors({ email: true });
          } else {
            console.error('Erro no login:', signInError);
            setError(`Erro ao fazer login: ${signInError.message}`);
          }
          return;
        }

        navigate((location.state as any)?.from || '/');
      } else {
        console.log('Tentando criar conta com:', {
          email: formData.email,
          full_name: formData.full_name,
          cpf_cnpj: formData.cpf_cnpj.replace(/\D/g, ''),
          phone: formData.phone.replace(/\D/g, ''),
        });

        // Criar usuário - O trigger handle_new_user() vai inserir automaticamente na tabela users
        const { data: { user, session }, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.full_name,
              cpf_cnpj: formData.cpf_cnpj.replace(/\D/g, ''),
              phone: formData.phone.replace(/\D/g, ''),
            },
            emailRedirectTo: `${window.location.origin}/entrar`
          }
        });

        console.log('Resposta do signup:', { user, session, error: signUpError });

        if (signUpError) {
          if (signUpError.message.includes('User already registered')) {
            setError('Este email já está cadastrado');
            setIsRegistering(false);
          } else {
            console.error('Erro no signup:', signUpError);
            setError(`Erro ao criar conta: ${signUpError.message}`);
          }
          return;
        }

        if (user) {
          console.log('Usuário criado com sucesso:', user.id);
          
          // Se já tem sessão, significa que não precisa confirmar email
          if (session) {
            setSuccess('Conta criada com sucesso! Redirecionando...');
            setTimeout(() => {
              navigate('/');
            }, 1500);
          } else {
            // Precisa confirmar email
            setSuccess('Conta criada! Verifique seu email para confirmar o cadastro antes de fazer login.');
          }
          
          setIsRegistering(false);
          setFormData({
            email: '',
            password: '',
            confirmPassword: '',
            full_name: '',
            cpf_cnpj: '',
            phone: '',
          });
        }
      }
    } catch (err) {
      console.error('Erro:', err);
      setError('Erro ao processar sua solicitação. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex">
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          <div className="flex items-center justify-center mb-8">
            <img 
              src="/logo-transparente.png" 
              alt="TratorHub" 
              className="h-32 w-auto"
            />
          </div>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              {isResettingPassword
                ? 'Nova Senha'
                : isForgotPassword
                ? 'Recuperar Senha'
                : isRegistering
                ? 'Criar uma conta'
                : hasSession
                ? 'Bem-vindo de volta'
                : 'Bem-vindo ao TratorHub!'}
            </h2>
            <p className="mt-2 text-gray-600">
              {isResettingPassword
                ? 'Digite sua nova senha abaixo'
                : isForgotPassword
                ? 'Digite seu email para receber o link de recuperação'
                : isRegistering
                ? 'Preencha seus dados para se cadastrar'
                : hasSession
                ? 'Entre para acessar sua conta'
                : 'Seu próximo negócio começa onde o agro se encontra. Junte-se agora!'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 rounded-lg flex items-start gap-3">
              <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 rounded-lg flex items-start gap-3">
              <AlertCircle className="text-green-500 shrink-0 mt-0.5" size={20} />
              <p className="text-green-600 text-sm">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {isRegistering && !isForgotPassword && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome Completo
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 outline-none ${
                        fieldErrors.full_name 
                          ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                          : 'border-gray-200 focus:ring-green-500 focus:border-green-500'
                      }`}
                      placeholder="Seu nome completo"
                    />
                    <User className="absolute left-3 top-2.5 text-gray-600" size={20} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CPF/CNPJ *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="cpf_cnpj"
                      required
                      value={formData.cpf_cnpj}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 outline-none ${
                        fieldErrors.cpf_cnpj 
                          ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                          : 'border-gray-200 focus:ring-green-500 focus:border-green-500'
                      }`}
                      placeholder="000.000.000-00"
                      maxLength={18}
                    />
                    <FileText className="absolute left-3 top-2.5 text-gray-600" size={20} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone *
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 outline-none ${
                        fieldErrors.phone 
                          ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                          : 'border-gray-200 focus:ring-green-500 focus:border-green-500'
                      }`}
                      placeholder="(00) 00000-0000"
                      maxLength={15}
                    />
                    <Phone className="absolute left-3 top-2.5 text-gray-600" size={20} />
                  </div>
                </div>
              </>
            )}

            {!isResettingPassword && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-mail
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 outline-none ${
                      fieldErrors.email 
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-200 focus:ring-green-500 focus:border-green-500'
                    }`}
                    placeholder="seu@email.com"
                  />
                  <Mail className="absolute left-3 top-2.5 text-gray-600" size={20} />
                </div>
              </div>
            )}

            {(!isForgotPassword || isResettingPassword) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isResettingPassword ? 'Nova Senha' : 'Senha'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-12 py-2 border rounded-lg focus:ring-2 outline-none ${
                      fieldErrors.password 
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-200 focus:ring-green-500 focus:border-green-500'
                    }`}
                    placeholder="••••••••"
                  />
                  <Lock className="absolute left-3 top-2.5 text-gray-600" size={20} />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-gray-600 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            )}

            {(isRegistering || isResettingPassword) && !isForgotPassword && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar {isResettingPassword ? 'Nova ' : ''}Senha
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-12 py-2 border rounded-lg focus:ring-2 outline-none ${
                      fieldErrors.confirmPassword 
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-200 focus:ring-green-500 focus:border-green-500'
                    }`}
                    placeholder="••••••••"
                  />
                  <Lock className="absolute left-3 top-2.5 text-gray-600" size={20} />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-2.5 text-gray-600 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            )}

            {!isRegistering && !isForgotPassword && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded transition-colors"
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    Lembrar-me
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(true);
                    setIsRegistering(false);
                    setError(null);
                    setSuccess(null);
                  }}
                  className="text-sm text-green-600 hover:text-green-500 transition-colors"
                >
                  Esqueceu a senha?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base font-medium"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Aguarde...</span>
                </>
              ) : (
                <>
                  {isResettingPassword ? (
                    <>
                      <Lock size={20} />
                      <span>Redefinir Senha</span>
                    </>
                  ) : isForgotPassword ? (
                    <>
                      <Mail size={20} />
                      <span>Enviar Link de Recuperação</span>
                    </>
                  ) : isRegistering ? (
                    <>
                      <UserPlus size={20} />
                      <span>Criar Conta</span>
                    </>
                  ) : (
                    <>
                      <ArrowRight size={20} />
                      <span>Entrar</span>
                    </>
                  )}
                </>
              )}
            </button>

            {!isResettingPassword && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">ou</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (isForgotPassword) {
                      setIsForgotPassword(false);
                    } else {
                      setIsRegistering(!isRegistering);
                    }
                    setError(null);
                    setSuccess(null);
                    setShowPassword(false);
                    setShowConfirmPassword(false);
                    setFormData({
                      email: '',
                      password: '',
                      confirmPassword: '',
                      full_name: '',
                      cpf_cnpj: '',
                      phone: '',
                    });
                  }}
                  className="w-full py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-base font-medium"
                >
                  {isForgotPassword ? 'Voltar para o login' : isRegistering ? 'Já tem uma conta? Entre agora' : 'Não tem uma conta? Cadastre-se'}
                </button>
              </>
            )}
          </form>
        </div>
      </div>

      <div className="hidden lg:block w-1/2 bg-gray-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=2070&q=80"
            alt="Agricultura"
            className="w-full h-full object-cover opacity-50"
          />
        </div>
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="max-w-xl text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Conectando o Agronegócio
            </h2>
            <p className="text-xl text-gray-300">
              A maior plataforma de compra, venda e aluguel de máquinas e implementos agrícolas do Brasil.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}