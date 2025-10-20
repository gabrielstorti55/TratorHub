-- Atualizar as imagens dos produtos existentes com fotos mais relevantes e específicas
UPDATE products
SET image_url = CASE 
  -- Tratores
  WHEN category = 'Tratores' AND brand ILIKE '%john deere%' THEN
    'https://images.unsplash.com/photo-1605338803155-8b46c2edc3d7?auto=format&fit=crop&w=800&q=80'
  WHEN category = 'Tratores' AND brand ILIKE '%massey%' THEN
    'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=800&q=80'
  WHEN category = 'Tratores' THEN
    'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=800&q=80'
  
  -- Colheitadeiras
  WHEN category = 'Colheitadeiras' AND brand ILIKE '%case%' THEN
    'https://images.unsplash.com/photo-1570420118092-5b96e28ff4cb?auto=format&fit=crop&w=800&q=80'
  WHEN category = 'Colheitadeiras' AND brand ILIKE '%new holland%' THEN
    'https://images.unsplash.com/photo-1592557004717-bc7266e0cc14?auto=format&fit=crop&w=800&q=80'
  WHEN category = 'Colheitadeiras' THEN
    'https://images.unsplash.com/photo-1599909631725-d8647b877f57?auto=format&fit=crop&w=800&q=80'
  
  -- Implementos
  WHEN category = 'Implementos' AND description ILIKE '%pulverizador%' THEN
    'https://images.unsplash.com/photo-1588696755473-c7c04a8427fa?auto=format&fit=crop&w=800&q=80'
  WHEN category = 'Implementos' AND description ILIKE '%grade%' THEN
    'https://images.unsplash.com/photo-1530267981375-f08d53d8c290?auto=format&fit=crop&w=800&q=80'
  WHEN category = 'Implementos' AND description ILIKE '%plantadeira%' THEN
    'https://images.unsplash.com/photo-1589328437343-5c4e8b0f8879?auto=format&fit=crop&w=800&q=80'
  WHEN category = 'Implementos' THEN
    'https://images.unsplash.com/photo-1516498188160-5004e7d2d7d4?auto=format&fit=crop&w=800&q=80'
  
  -- Fallback para qualquer outro caso
  ELSE 'https://images.unsplash.com/photo-1605338803155-8b46c2edc3d7?auto=format&fit=crop&w=800&q=80'
END
WHERE image_url IS NULL OR image_url = '';

-- Garantir que todos os produtos tenham uma imagem
UPDATE products
SET image_url = 'https://images.unsplash.com/photo-1605338803155-8b46c2edc3d7?auto=format&fit=crop&w=800&q=80'
WHERE image_url IS NULL OR image_url = '';