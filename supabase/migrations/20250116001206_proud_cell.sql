-- Atualizar os produtos existentes para usar o ID do usuário admin
UPDATE products
SET user_id = (SELECT id FROM auth.users WHERE email = 'admin@agromachines.com.br')
WHERE user_id IS NULL OR user_id NOT IN (SELECT id FROM auth.users);

-- Criar perfil para o usuário admin se não existir
INSERT INTO profiles (
  user_id,
  full_name,
  cpf_cnpj,
  phone,
  address,
  city,
  state,
  postal_code,
  company_name,
  bio
)
SELECT
  id,
  'Administrador AgroMachines',
  '12345678900',
  '(11) 99999-9999',
  'Av. Paulista, 1000',
  'São Paulo',
  'SP',
  '01310-100',
  'AgroMachines Ltda',
  'Administrador da plataforma AgroMachines'
FROM auth.users
WHERE email = 'admin@agromachines.com.br'
AND NOT EXISTS (
  SELECT 1 FROM profiles WHERE user_id = auth.users.id
);