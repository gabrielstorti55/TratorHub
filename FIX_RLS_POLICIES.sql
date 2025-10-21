-- ============================================================================
-- VERIFICAR E CORRIGIR PERMISSÕES RLS PARA O TRIGGER
-- ============================================================================

-- 1. Verificar políticas RLS atuais
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'profiles';

-- 2. Verificar se RLS está ativo
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'profiles';

-- 3. Desabilitar RLS temporariamente para o trigger funcionar
-- OU adicionar permissão ao service_role
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 4. Recriar políticas RLS mais permissivas
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can create own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.profiles;

-- Reabilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Política para SELECT (usuário pode ver seu próprio perfil)
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Política para INSERT (permitir que o sistema crie perfis automaticamente)
CREATE POLICY "Enable profile creation"
  ON public.profiles
  FOR INSERT
  WITH CHECK (true);  -- Permite qualquer insert (o trigger é SECURITY DEFINER)

-- Política para UPDATE (usuário pode atualizar seu próprio perfil)
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Política para DELETE (usuário pode deletar seu próprio perfil)
CREATE POLICY "Users can delete own profile"
  ON public.profiles
  FOR DELETE
  USING (auth.uid() = user_id);

-- 5. Verificar se ficou correto
SELECT 
  policyname,
  cmd as operacao,
  CASE 
    WHEN with_check = 'true' THEN 'Permite todos'
    WHEN with_check LIKE '%auth.uid()%' THEN 'Apenas próprio usuário'
    ELSE 'Outra condição'
  END as permissao
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY cmd;
