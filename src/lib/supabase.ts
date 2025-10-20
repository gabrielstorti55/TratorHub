import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Por favor, configure as variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY'
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'X-Client-Info': 'agromachines-web'
    }
  },
  db: {
    schema: 'public'
  },
  // Configurações de retry e timeout
  realtime: {
    params: {
      eventsPerSecond: 2
    }
  },
  // Configurações de fetch personalizadas
  fetch: (url, options = {}) => {
    const fetchOptions = {
      ...options,
      // Aumentar o timeout para 30 segundos
      timeout: 30000,
      // Adicionar headers padrão
      headers: {
        ...options.headers,
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    };

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('Request timeout'));
      }, fetchOptions.timeout);

      fetch(url, fetchOptions)
        .then(response => {
          clearTimeout(timeoutId);
          resolve(response);
        })
        .catch(error => {
          clearTimeout(timeoutId);
          reject(error);
        });
    });
  }
});

// Verificar conexão inicial com o Supabase
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    console.log('Usuário autenticado:', session?.user?.email);
  } else if (event === 'SIGNED_OUT') {
    console.log('Usuário desconectado');
    window.localStorage.removeItem('supabase.auth.token');
  }
});

// Função auxiliar para verificar se o usuário está autenticado
export const isAuthenticated = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  } catch (err) {
    console.error('Erro ao verificar autenticação:', err);
    return false;
  }
};

// Função auxiliar para obter o usuário atual
export const getCurrentUser = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user || null;
  } catch (err) {
    console.error('Erro ao obter usuário:', err);
    return null;
  }
};

// Função auxiliar para lidar com erros do Supabase
export const handleSupabaseError = (error: any): string => {
  // Erro de timeout
  if (error?.message?.includes('timeout')) {
    return 'A conexão excedeu o tempo limite. Por favor, tente novamente.';
  }

  // Erro de conexão
  if (error?.message?.includes('Failed to fetch') || 
      error?.message?.includes('NetworkError') ||
      error?.message?.includes('network timeout') ||
      error?.message?.includes('Network request failed')) {
    return 'Erro de conexão. Verifique sua internet e tente novamente.';
  }
  
  // Erro de validação do nome
  if (error?.message?.includes('Nome inválido')) {
    return 'Nome inválido. Use apenas letras, hífens e apóstrofos quando necessário. Ex: João da Silva, Maria-Helena, D\'Ávila';
  }
  
  // Erro de registro não encontrado
  if (error?.code === 'PGRST116') {
    return 'Nenhum registro encontrado.';
  }
  
  // Erro de autenticação
  if (error?.message?.includes('Invalid login credentials')) {
    return 'Email ou senha incorretos.';
  }
  
  // Erro personalizado do banco
  if (error?.code === 'P0001') {
    return error.message;
  }
  
  // Erro genérico com mensagem
  if (error?.message) {
    return error.message;
  }
  
  // Fallback para erro desconhecido
  return 'Ocorreu um erro inesperado. Por favor, tente novamente.';
};