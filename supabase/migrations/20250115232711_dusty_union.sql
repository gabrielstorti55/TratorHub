/*
  # Seed Products Data with Test User

  1. Data Population
    - Create a test user for sample products
    - Add sample products for both sale and rent
    - Include various categories: Tractors, Harvesters, and Implements
    - Add realistic prices and locations
*/

-- Ensure pgcrypto is available for password hashing helpers used below
create extension if not exists pgcrypto;

-- First, create a test user in auth.users
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
)
VALUES (
  'c9c90647-7e11-4ef6-8f79-d1a4f8c9e6a5',
  '00000000-0000-0000-0000-000000000000',
  'teste@agromachines.com.br',
  '$2b$10$t7hl5HeWYht1OA8nS0oW.OO8COYs2ZV3tYJB23EYsKdjlSCHuMhSa',
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  false,
  'authenticated'
);

-- Now insert the products using the test user's ID
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
    'Trator John Deere 5075E',
    'Trator em excelente estado, com 75cv de potência, ideal para pequenas e médias propriedades. Apenas 1200 horas de uso.',
    185000.00,
    'Venda',
    NULL,
    'John Deere',
    '5075E',
    '2022',
    'Ribeirão Preto, SP',
    'Tratores',
    'https://images.unsplash.com/photo-1605338803155-8b46c2edc3d7?auto=format&fit=crop&w=800&q=80',
    'c9c90647-7e11-4ef6-8f79-d1a4f8c9e6a5'
  ),
  (
    'Colheitadeira New Holland TC5090',
    'Colheitadeira seminova com plataforma de 25 pés, ideal para grãos. Excelente estado de conservação.',
    450000.00,
    'Venda',
    NULL,
    'New Holland',
    'TC5090',
    '2021',
    'Cascavel, PR',
    'Colheitadeiras',
    'https://images.unsplash.com/photo-1592557004717-bc7266e0cc14?auto=format&fit=crop&w=800&q=80',
    'c9c90647-7e11-4ef6-8f79-d1a4f8c9e6a5'
  ),
  (
    'Grade Aradora 20 Discos',
    'Grade aradora com discos de 28 polegadas, espaçamento adequado para diversos tipos de solo.',
    28000.00,
    'Venda',
    NULL,
    'Baldan',
    'GATCR',
    '2023',
    'Rondonópolis, MT',
    'Implementos',
    'https://images.unsplash.com/photo-1530267981375-f08d53d8c290?auto=format&fit=crop&w=800&q=80',
    'c9c90647-7e11-4ef6-8f79-d1a4f8c9e6a5'
  ),
  (
    'Trator Massey Ferguson 4290',
    'Trator disponível para aluguel, perfeito para operações de médio porte. Manutenção em dia.',
    800.00,
    'Aluguel',
    'Diário',
    'Massey Ferguson',
    '4290',
    '2020',
    'Uberaba, MG',
    'Tratores',
    'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=800&q=80',
    'c9c90647-7e11-4ef6-8f79-d1a4f8c9e6a5'
  ),
  (
    'Pulverizador Jacto Uniport 2500',
    'Pulverizador autopropelido com barra de 24 metros. Disponível para aluguel semanal ou mensal.',
    3500.00,
    'Aluguel',
    'Semanal',
    'Jacto',
    'Uniport 2500',
    '2021',
    'Rio Verde, GO',
    'Implementos',
    'https://images.unsplash.com/photo-1588696755473-c7c04a8427fa?auto=format&fit=crop&w=800&q=80',
    'c9c90647-7e11-4ef6-8f79-d1a4f8c9e6a5'
  ),
  (
    'Plantadeira Stara Princesa',
    'Plantadeira de 9 linhas, ideal para grãos. Sistema de distribuição pneumático.',
    120000.00,
    'Venda',
    NULL,
    'Stara',
    'Princesa',
    '2022',
    'Passo Fundo, RS',
    'Implementos',
    'https://images.unsplash.com/photo-1589328437343-5c4e8b0f8879?auto=format&fit=crop&w=800&q=80',
    'c9c90647-7e11-4ef6-8f79-d1a4f8c9e6a5'
  );