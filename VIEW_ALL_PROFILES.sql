-- ============================================================================
-- ADICIONAR POLÍTICA PARA ADMIN VER TODOS OS PERFIS
-- ============================================================================

-- Opção 1: Adicionar política para ver todos os perfis (para admin/desenvolvimento)
CREATE POLICY "Admin can view all profiles"
  ON public.profiles
  FOR SELECT
  USING (true);  -- Permite visualizar todos os perfis

-- Ou se quiser manter restrito, só permita para emails específicos:
/*
CREATE POLICY "Admin can view all profiles"
  ON public.profiles
  FOR SELECT
  USING (
    auth.jwt()->>'email' IN (
      'seu-email-admin@exemplo.com'  -- Substitua pelo seu email
    )
    OR auth.uid() = user_id  -- Ou é o próprio usuário
  );
*/

-- Verificar se agora consegue ver todos os perfis
SELECT 
  id,
  user_id,
  full_name,
  email,
  cpf_cnpj,
  phone,
  created_at
FROM public.profiles
ORDER BY created_at DESC;

-- Ver usuários e perfis juntos
SELECT 
  u.email,
  u.created_at as usuario_criado,
  p.id as perfil_id,
  p.full_name,
  p.cpf_cnpj,
  p.phone,
  p.created_at as perfil_criado
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.user_id
ORDER BY u.created_at DESC
LIMIT 10;
