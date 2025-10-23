/*
  # Remover Dados Mockados
  
  Remove apenas os dados de exemplo/mockados do banco de dados:
  - Remove produtos dos usuários mockados
  - Remove perfis dos usuários mockados
  - Remove apenas os usuários de exemplo do auth
  
  Mantém todos os usuários reais e seus dados.
*/

-- IDs dos usuários mockados que foram criados nas migrações anteriores
-- 'c9c90647-7e11-4ef6-8f79-d1a4f8c9e6a5' - teste@agromachines.com.br
-- 'ad6e43e4-9c5f-4b9e-8c5a-4f9d7b6f5b2d' - admin@agromachines.com.br
-- 'f47ac10b-58cc-4372-a567-0e02b2c3d479' - joao.silva@exemplo.com
-- 'b5f8c25e-89cf-4384-9922-d7708dc12345' - maria.santos@exemplo.com
-- 'c9d4f7b8-1234-5678-90ab-cdef01234567' - cooperativa@exemplo.com
-- 'd1e2f3a4-b5c6-7890-1234-567890abcdef' - pedro.locadora@exemplo.com
-- '7c9e6d5f-4b3a-2c1d-8e7f-9a0b1c2d3e4f' - concessionaria@exemplo.com

-- Remover produtos dos usuários mockados
DELETE FROM products 
WHERE user_id IN (
  'c9c90647-7e11-4ef6-8f79-d1a4f8c9e6a5',
  'ad6e43e4-9c5f-4b9e-8c5a-4f9d7b6f5b2d',
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  'b5f8c25e-89cf-4384-9922-d7708dc12345',
  'c9d4f7b8-1234-5678-90ab-cdef01234567',
  'd1e2f3a4-b5c6-7890-1234-567890abcdef',
  '7c9e6d5f-4b3a-2c1d-8e7f-9a0b1c2d3e4f'
);

-- Remover perfis dos usuários mockados
DELETE FROM profiles 
WHERE user_id IN (
  'c9c90647-7e11-4ef6-8f79-d1a4f8c9e6a5',
  'ad6e43e4-9c5f-4b9e-8c5a-4f9d7b6f5b2d',
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  'b5f8c25e-89cf-4384-9922-d7708dc12345',
  'c9d4f7b8-1234-5678-90ab-cdef01234567',
  'd1e2f3a4-b5c6-7890-1234-567890abcdef',
  '7c9e6d5f-4b3a-2c1d-8e7f-9a0b1c2d3e4f'
);

-- Remover apenas os usuários mockados do auth
DELETE FROM auth.users 
WHERE id IN (
  'c9c90647-7e11-4ef6-8f79-d1a4f8c9e6a5',
  'ad6e43e4-9c5f-4b9e-8c5a-4f9d7b6f5b2d',
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  'b5f8c25e-89cf-4384-9922-d7708dc12345',
  'c9d4f7b8-1234-5678-90ab-cdef01234567',
  'd1e2f3a4-b5c6-7890-1234-567890abcdef',
  '7c9e6d5f-4b3a-2c1d-8e7f-9a0b1c2d3e4f'
)
OR email IN (
  'teste@agromachines.com.br',
  'admin@agromachines.com.br',
  'joao.silva@exemplo.com',
  'maria.santos@exemplo.com',
  'cooperativa@exemplo.com',
  'pedro.locadora@exemplo.com',
  'concessionaria@exemplo.com'
);
