-- Verificar usuários criados no auth.users
SELECT 
  id,
  email,
  created_at,
  confirmed_at,
  email_confirmed_at,
  last_sign_in_at,
  raw_user_meta_data->>'full_name' as nome,
  raw_user_meta_data->>'cpf_cnpj' as cpf_cnpj,
  raw_user_meta_data->>'phone' as telefone
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;

-- Verificar perfis criados na tabela profiles
SELECT 
  id,
  user_id,
  full_name,
  cpf_cnpj,
  phone,
  created_at
FROM public.profiles
ORDER BY created_at DESC
LIMIT 10;

-- Verificar se há usuários sem perfil
SELECT 
  u.id,
  u.email,
  u.created_at,
  p.id as profile_id
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.user_id
WHERE p.id IS NULL
ORDER BY u.created_at DESC;
