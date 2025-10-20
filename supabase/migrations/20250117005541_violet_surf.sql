/*
  # Adicionar restrições de segurança adicionais

  1. Restrições
    - Bloquear acesso ao perfil específico
    - Adicionar políticas de segurança mais rigorosas
    - Adicionar validações extras
*/

-- Adicionar política específica para bloquear o email
CREATE OR REPLACE FUNCTION block_specific_email()
RETURNS trigger AS $$
BEGIN
  IF NEW.email = 'gabriel.storti@stackblitz.com' THEN
    RAISE EXCEPTION 'Acesso não autorizado';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para bloquear o email na tabela auth.users
DROP TRIGGER IF EXISTS block_email_trigger ON auth.users;
CREATE TRIGGER block_email_trigger
  BEFORE INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION block_specific_email();

-- Remover políticas existentes
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can create own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Criar políticas mais restritivas
CREATE POLICY "Users can view own profile"
ON profiles
FOR SELECT
USING (
  auth.uid() = user_id 
  AND user_id NOT IN (
    SELECT id FROM auth.users 
    WHERE email = 'gabriel.storti@stackblitz.com'
  )
);

CREATE POLICY "Users can create own profile"
ON profiles
FOR INSERT
WITH CHECK (
  auth.uid() = user_id 
  AND user_id NOT IN (
    SELECT id FROM auth.users 
    WHERE email = 'gabriel.storti@stackblitz.com'
  )
);

CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
USING (
  auth.uid() = user_id 
  AND user_id NOT IN (
    SELECT id FROM auth.users 
    WHERE email = 'gabriel.storti@stackblitz.com'
  )
)
WITH CHECK (
  auth.uid() = user_id 
  AND user_id NOT IN (
    SELECT id FROM auth.users 
    WHERE email = 'gabriel.storti@stackblitz.com'
  )
);

-- Adicionar restrição na tabela de produtos
CREATE POLICY "Block specific user products"
ON products
FOR ALL
USING (
  user_id NOT IN (
    SELECT id FROM auth.users 
    WHERE email = 'gabriel.storti@stackblitz.com'
  )
);