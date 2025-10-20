-- Primeiro, limpar todos os dados existentes
DELETE FROM products;
DELETE FROM profiles;
DELETE FROM auth.users;

-- Criar usuário admin
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  aud
) VALUES (
  'ad6e43e4-9c5f-4b9e-8c5a-4f9d7b6f5b2d',
  '00000000-0000-0000-0000-000000000000',
  'admin@agromachines.com.br',
  crypt('Admin@123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Administrador AgroMachines"}',
  false,
  'authenticated'
);

-- Criar perfil do admin
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
) VALUES (
  'ad6e43e4-9c5f-4b9e-8c5a-4f9d7b6f5b2d',
  'Administrador AgroMachines',
  '12345678900',
  '11999999999',
  'Av. Paulista, 1000',
  'São Paulo',
  'SP',
  '01310100',
  'AgroMachines Ltda',
  'Administrador da plataforma AgroMachines'
);

-- Adicionar produtos de exemplo
INSERT INTO products (
  title,
  description,
  price,
  type,
  period,
  brand,
  model,
  year,
  location,
  category,
  image_url,
  user_id
) VALUES
  (
    'Trator John Deere 6110J',
    'Trator seminovo com apenas 800 horas de uso. Potência de 110cv, cabine com ar condicionado, piloto automático e monitor de produtividade.',
    320000.00,
    'Venda',
    NULL,
    'John Deere',
    '6110J',
    '2023',
    'São Paulo, SP',
    'Tratores',
    'https://images.unsplash.com/photo-1605338803155-8b46c2edc3d7?auto=format&fit=crop&w=800&q=80',
    'ad6e43e4-9c5f-4b9e-8c5a-4f9d7b6f5b2d'
  ),
  (
    'Colheitadeira Case IH 8250',
    'Colheitadeira de última geração com plataforma de 40 pés. Sistema AFS Harvest Command™ automatizado, ideal para grandes produções.',
    980000.00,
    'Venda',
    NULL,
    'Case IH',
    '8250',
    '2023',
    'São Paulo, SP',
    'Colheitadeiras',
    'https://images.unsplash.com/photo-1570420118092-5b96e28ff4cb?auto=format&fit=crop&w=800&q=80',
    'ad6e43e4-9c5f-4b9e-8c5a-4f9d7b6f5b2d'
  ),
  (
    'Pulverizador Jacto Uniport 3030',
    'Pulverizador disponível para aluguel mensal. Barra de 36 metros, tanque de 3000L, GPS e piloto automático.',
    5000.00,
    'Aluguel',
    'Mensal',
    'Jacto',
    'Uniport 3030',
    '2022',
    'São Paulo, SP',
    'Implementos',
    'https://images.unsplash.com/photo-1588696755473-c7c04a8427fa?auto=format&fit=crop&w=800&q=80',
    'ad6e43e4-9c5f-4b9e-8c5a-4f9d7b6f5b2d'
  );