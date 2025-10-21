-- ============================================================================
-- DESABILITAR RLS TEMPORARIAMENTE PARA VERIFICAÇÃO
-- ============================================================================
-- Use isso APENAS para desenvolvimento/debug

-- Desabilitar RLS completamente (temporariamente)
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Agora verificar TODOS os perfis (sem restrição de RLS)
SELECT 
  COUNT(*) as total_perfis
FROM public.profiles;

-- Ver todos os perfis criados
SELECT 
  id,
  user_id,
  full_name,
  cpf_cnpj,
  phone,
  created_at
FROM public.profiles
ORDER BY created_at DESC;

-- Ver relação usuários x perfis
SELECT 
  u.email,
  u.created_at as usuario_criado,
  p.id as perfil_existe,
  p.full_name,
  p.created_at as perfil_criado
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.user_id
ORDER BY u.created_at DESC;

-- Para REABILITAR RLS depois do teste:
-- ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
