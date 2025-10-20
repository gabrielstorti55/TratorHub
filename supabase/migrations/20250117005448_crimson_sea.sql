/*
  # Limpar dados do perfil

  1. Operações
    - Excluir anúncios do usuário
    - Excluir perfil do usuário
    - Excluir usuário
*/

-- Primeiro, excluir os anúncios do usuário
DELETE FROM products
WHERE user_id = (
  SELECT id 
  FROM auth.users 
  WHERE email = 'gabriel.storti@stackblitz.com'
);

-- Depois, excluir o perfil do usuário
DELETE FROM profiles
WHERE user_id = (
  SELECT id 
  FROM auth.users 
  WHERE email = 'gabriel.storti@stackblitz.com'
);

-- Por fim, excluir o usuário
DELETE FROM auth.users
WHERE email = 'gabriel.storti@stackblitz.com';