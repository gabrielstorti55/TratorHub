/*
  # Atualização das políticas de segurança da tabela profiles

  1. Alterações
    - Remove políticas existentes
    - Adiciona novas políticas com permissões corretas
    - Habilita RLS na tabela

  2. Políticas
    - Visualização: usuários podem ver seu próprio perfil
    - Inserção: usuários podem criar seu próprio perfil
    - Atualização: usuários podem atualizar seu próprio perfil
*/

-- Remover políticas existentes
DROP POLICY IF EXISTS "Users can create own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Política para visualização
CREATE POLICY "Users can view own profile"
ON profiles
FOR SELECT
USING (auth.uid() = user_id);

-- Política para inserção
CREATE POLICY "Users can create own profile"
ON profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Política para atualização
CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Garantir que RLS está ativado
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;