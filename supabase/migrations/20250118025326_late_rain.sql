-- Remover restrições existentes
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS check_postal_code_format;
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS check_phone_format;
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS check_cpf_cnpj_format;
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS check_state_format;

-- Alterar colunas para permitir valores vazios
ALTER TABLE profiles 
  ALTER COLUMN address DROP NOT NULL,
  ALTER COLUMN city DROP NOT NULL,
  ALTER COLUMN state DROP NOT NULL,
  ALTER COLUMN postal_code DROP NOT NULL;

-- Adicionar restrições apenas para os campos obrigatórios
ALTER TABLE profiles
  ADD CONSTRAINT check_cpf_cnpj_format CHECK (cpf_cnpj ~ '^[0-9]{11,14}$'),
  ADD CONSTRAINT check_phone_format CHECK (phone ~ '^[0-9]{10,11}$');