-- ============================================================================
-- CORRIGIR TRIGGER DE CRIAÇÃO DE PERFIL
-- ============================================================================
-- Aplicar este script no SQL Editor do Supabase
-- ============================================================================

-- Atualizar função de criação automática de perfil
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    user_id,
    full_name,
    cpf_cnpj,
    phone,
    address,
    city,
    state,
    postal_code
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'cpf_cnpj', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    '',  -- address vazio
    '',  -- city vazio
    '',  -- state vazio
    ''   -- postal_code vazio
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log do erro mas não falha o signup
    RAISE WARNING 'Erro ao criar perfil automático: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recriar o trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Criar perfis para usuários que não têm (retroativo)
INSERT INTO public.profiles (
  user_id,
  full_name,
  cpf_cnpj,
  phone,
  address,
  city,
  state,
  postal_code
)
SELECT 
  u.id,
  COALESCE(u.raw_user_meta_data->>'full_name', ''),
  COALESCE(u.raw_user_meta_data->>'cpf_cnpj', ''),
  COALESCE(u.raw_user_meta_data->>'phone', ''),
  '',
  '',
  '',
  ''
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.user_id
WHERE p.id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- Verificar resultado
SELECT 
  'Total de usuários' as tipo,
  COUNT(*) as total
FROM auth.users
UNION ALL
SELECT 
  'Total de perfis' as tipo,
  COUNT(*) as total
FROM public.profiles
UNION ALL
SELECT 
  'Usuários sem perfil' as tipo,
  COUNT(*) as total
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.user_id
WHERE p.id IS NULL;
