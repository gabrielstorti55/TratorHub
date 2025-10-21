-- Limpar dados existentes
DELETE FROM products;
DELETE FROM profiles;
DELETE FROM auth.users;

-- Criar 5 usuários diferentes
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
) VALUES
  -- Fazendeiro
  (
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    '00000000-0000-0000-0000-000000000000',
    'joao.silva@exemplo.com',
  '$2b$10$TSFBVPYQTCBS2WDEROuKcOHi1JhQoxmElSFCExRmbaVksQ.VZ09dG',
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"João Silva"}',
    false,
    'authenticated'
  ),
  -- Revendedor
  (
    'b5f8c25e-89cf-4384-9922-d7708dc12345',
    '00000000-0000-0000-0000-000000000000',
    'maria.santos@exemplo.com',
  '$2b$10$TSFBVPYQTCBS2WDEROuKcOHi1JhQoxmElSFCExRmbaVksQ.VZ09dG',
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Maria Santos"}',
    false,
    'authenticated'
  ),
  -- Cooperativa
  (
    'c9d4f7b8-1234-5678-90ab-cdef01234567',
    '00000000-0000-0000-0000-000000000000',
    'cooperativa@exemplo.com',
  '$2b$10$TSFBVPYQTCBS2WDEROuKcOHi1JhQoxmElSFCExRmbaVksQ.VZ09dG',
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Cooperativa Agrícola Central"}',
    false,
    'authenticated'
  ),
  -- Locador de Equipamentos
  (
    'd1e2f3a4-b5c6-7890-1234-567890abcdef',
    '00000000-0000-0000-0000-000000000000',
    'pedro.locadora@exemplo.com',
  '$2b$10$TSFBVPYQTCBS2WDEROuKcOHi1JhQoxmElSFCExRmbaVksQ.VZ09dG',
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Pedro Almeida"}',
    false,
    'authenticated'
  ),
  -- Concessionária
  (
    '7c9e6d5f-4b3a-2c1d-8e7f-9a0b1c2d3e4f',
    '00000000-0000-0000-0000-000000000000',
  'concessionaria@exemplo.com',
  '$2b$10$TSFBVPYQTCBS2WDEROuKcOHi1JhQoxmElSFCExRmbaVksQ.VZ09dG',
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Concessionária Agro Máquinas"}',
    false,
    'authenticated'
  );

-- Criar perfis para os usuários
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
) VALUES
  -- Perfil do Fazendeiro
  (
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    'João Silva',
    '123.456.789-00',
    '(11) 98765-4321',
    'Fazenda Boa Esperança, Km 50',
    'Ribeirão Preto',
    'SP',
    '14020-000',
    NULL,
    'Produtor rural há 20 anos, especializado em grãos.'
  ),
  -- Perfil da Revendedora
  (
    'b5f8c25e-89cf-4384-9922-d7708dc12345',
    'Maria Santos',
    '98.765.432/0001-10',
    '(16) 99999-8888',
    'Av. Brasil, 1500',
    'Bauru',
    'SP',
    '17020-100',
    'Santos Máquinas Agrícolas',
    'Revendedora autorizada de máquinas agrícolas há 15 anos.'
  ),
  -- Perfil da Cooperativa
  (
    'c9d4f7b8-1234-5678-90ab-cdef01234567',
    'Cooperativa Agrícola Central',
    '45.678.901/0001-23',
    '(44) 3333-4444',
    'Rod. PR-323, Km 100',
    'Maringá',
    'PR',
    '87050-200',
    'Cooperativa Agrícola Central',
    'Cooperativa com mais de 1000 associados.'
  ),
  -- Perfil do Locador
  (
    'd1e2f3a4-b5c6-7890-1234-567890abcdef',
    'Pedro Almeida',
    '34.567.890/0001-45',
    '(62) 98888-7777',
    'Av. Goiás, 500',
    'Rio Verde',
    'GO',
    '75901-300',
    'Almeida Locações Agrícolas',
    'Especialista em locação de máquinas e implementos agrícolas.'
  ),
  -- Perfil da Concessionária
  (
    '7c9e6d5f-4b3a-2c1d-8e7f-9a0b1c2d3e4f',
    'Concessionária Agro Máquinas',
    '56.789.012/0001-67',
    '(65) 3222-1111',
    'Av. do Comércio, 2000',
    'Cuiabá',
    'MT',
    '78050-400',
    'Agro Máquinas Concessionária',
    'Concessionária oficial com as melhores máquinas do mercado.'
  );

-- Adicionar produtos variados para cada usuário
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
  -- Produtos do Fazendeiro (vendendo equipamentos usados)
  (
    'Trator Massey Ferguson 7415',
    'Trator em excelente estado, com 7.500 horas de uso. Pneus novos, revisão em dia.',
    280000.00,
    'Venda',
    NULL,
    'Massey Ferguson',
    '7415',
    '2019',
    'Ribeirão Preto, SP',
    'Tratores',
    'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=800&q=80',
    'f47ac10b-58cc-4372-a567-0e02b2c3d479'
  ),
  (
    'Grade Aradora 28 Discos',
    'Grade seminova, pouco uso, discos em ótimo estado.',
    45000.00,
    'Venda',
    NULL,
    'Tatu',
    'GAICR',
    '2020',
    'Ribeirão Preto, SP',
    'Implementos',
    'https://images.unsplash.com/photo-1530267981375-f08d53d8c290?auto=format&fit=crop&w=800&q=80',
    'f47ac10b-58cc-4372-a567-0e02b2c3d479'
  ),

  -- Produtos da Revendedora (equipamentos novos)
  (
    'Trator New Holland T7.245',
    'Trator 0km, potência de 245cv, câmbio Full Powershift, ar condicionado.',
    850000.00,
    'Venda',
    NULL,
    'New Holland',
    'T7.245',
    '2024',
    'Bauru, SP',
    'Tratores',
    'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=800&q=80',
    'b5f8c25e-89cf-4384-9922-d7708dc12345'
  ),
  (
    'Plantadeira Precision Planting',
    'Plantadeira de 15 linhas, com monitor de sementes e controle de população.',
    420000.00,
    'Venda',
    NULL,
    'John Deere',
    'DB60',
    '2024',
    'Bauru, SP',
    'Implementos',
    'https://images.unsplash.com/photo-1589328437343-5c4e8b0f8879?auto=format&fit=crop&w=800&q=80',
    'b5f8c25e-89cf-4384-9922-d7708dc12345'
  ),

  -- Produtos da Cooperativa (diversos)
  (
    'Colheitadeira Case IH 8250',
    'Colheitadeira seminova com plataforma de 40 pés, GPS e monitor de produtividade.',
    1200000.00,
    'Venda',
    NULL,
    'Case IH',
    '8250',
    '2023',
    'Maringá, PR',
    'Colheitadeiras',
    'https://images.unsplash.com/photo-1570420118092-5b96e28ff4cb?auto=format&fit=crop&w=800&q=80',
    'c9d4f7b8-1234-5678-90ab-cdef01234567'
  ),
  (
    'Pulverizador Jacto Uniport 4530',
    'Pulverizador com barras de 36m, computador de bordo e piloto automático.',
    890000.00,
    'Venda',
    NULL,
    'Jacto',
    'Uniport 4530',
    '2023',
    'Maringá, PR',
    'Implementos',
    'https://images.unsplash.com/photo-1588696755473-c7c04a8427fa?auto=format&fit=crop&w=800&q=80',
    'c9d4f7b8-1234-5678-90ab-cdef01234567'
  ),

  -- Produtos do Locador (aluguel)
  (
    'Trator John Deere 6180J',
    'Disponível para aluguel mensal ou sazonal. Manutenção inclusa.',
    4500.00,
    'Aluguel',
    'Mensal',
    'John Deere',
    '6180J',
    '2022',
    'Rio Verde, GO',
    'Tratores',
    'https://images.unsplash.com/photo-1605338803155-8b46c2edc3d7?auto=format&fit=crop&w=800&q=80',
    'd1e2f3a4-b5c6-7890-1234-567890abcdef'
  ),
  (
    'Colheitadeira New Holland CR8.90',
    'Aluguel para safra, operador opcional, manutenção inclusa.',
    15000.00,
    'Aluguel',
    'Mensal',
    'New Holland',
    'CR8.90',
    '2023',
    'Rio Verde, GO',
    'Colheitadeiras',
    'https://images.unsplash.com/photo-1592557004717-bc7266e0cc14?auto=format&fit=crop&w=800&q=80',
    'd1e2f3a4-b5c6-7890-1234-567890abcdef'
  ),

  -- Produtos da Concessionária (novos)
  (
    'Trator Case Magnum 400',
    'Novo, pronta entrega, potência máxima de 435cv, garantia de fábrica.',
    1500000.00,
    'Venda',
    NULL,
    'Case IH',
    'Magnum 400',
    '2024',
    'Cuiabá, MT',
    'Tratores',
    'https://images.unsplash.com/photo-1516498188160-5004e7d2d7d4?auto=format&fit=crop&w=800&q=80',
    '7c9e6d5f-4b3a-2c1d-8e7f-9a0b1c2d3e4f'
  ),
  (
    'Colheitadeira Axial-Flow 9250',
    'Nova, pronta entrega, plataforma de 45 pés, tecnologia de ponta.',
    2200000.00,
    'Venda',
    NULL,
    'Case IH',
    'Axial-Flow 9250',
    '2024',
    'Cuiabá, MT',
    'Colheitadeiras',
    'https://images.unsplash.com/photo-1599909631725-d8647b877f57?auto=format&fit=crop&w=800&q=80',
    '7c9e6d5f-4b3a-2c1d-8e7f-9a0b1c2d3e4f'
  );