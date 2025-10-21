-- ============================================================================
-- CORRIGIR TRIGGER DEFINITIVAMENTE
-- ============================================================================

-- 1. Dropar trigger e função antigas
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- 2. Criar função SEM try-catch para ver erros reais
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Inserir perfil para o novo usuário
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
    '',
    '',
    '',
    ''
  );
  
  RETURN NEW;
END;
$$;

-- 3. Recriar o trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 4. Garantir que RLS não bloqueia o trigger
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 5. Criar perfis faltantes (retroativo)
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

-- 6. Verificar resultado
SELECT 
  'Total usuários' as tipo,
  COUNT(*) as quantidade
FROM auth.users
UNION ALL
SELECT 
  'Total perfis' as tipo,
  COUNT(*) as quantidade
FROM public.profiles
UNION ALL
SELECT 
  'Usuários SEM perfil' as tipo,
  COUNT(*) as quantidade
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.user_id
WHERE p.id IS NULL;

-- 7. IMPORTANTE: Reabilitar RLS depois de testar
-- Descomente as linhas abaixo quando confirmar que está funcionando:
/*
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Recriar políticas básicas
DROP POLICY IF EXISTS "Enable profile creation" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Enable profile creation"
  ON public.profiles FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id OR true);  -- true = permite ver todos (dev)

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
*/
