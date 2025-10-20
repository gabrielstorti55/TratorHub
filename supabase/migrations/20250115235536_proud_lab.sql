/*
  # Add Test Data
  
  1. Changes
    - Add sample products using Gabriel Storti's account
  
  2. Security
    - Uses existing authenticated user
    - Maintains referential integrity
*/

-- Add sample products
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
    (SELECT id FROM auth.users WHERE email = 'gabriel.storti@stackblitz.com')
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
    'Ribeirão Preto, SP',
    'Colheitadeiras',
    'https://images.unsplash.com/photo-1570420118092-5b96e28ff4cb?auto=format&fit=crop&w=800&q=80',
    (SELECT id FROM auth.users WHERE email = 'gabriel.storti@stackblitz.com')
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
    'Campinas, SP',
    'Implementos',
    'https://images.unsplash.com/photo-1588696755473-c7c04a8427fa?auto=format&fit=crop&w=800&q=80',
    (SELECT id FROM auth.users WHERE email = 'gabriel.storti@stackblitz.com')
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
    'São Paulo, SP',
    'Implementos',
    'https://images.unsplash.com/photo-1530267981375-f08d53d8c290?auto=format&fit=crop&w=800&q=80',
    (SELECT id FROM auth.users WHERE email = 'gabriel.storti@stackblitz.com')
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
    (SELECT id FROM auth.users WHERE email = 'gabriel.storti@stackblitz.com')
  );