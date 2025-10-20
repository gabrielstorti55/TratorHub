-- Drop existing policies to recreate them with better security
DROP POLICY IF EXISTS "Anyone can view products" ON products;
DROP POLICY IF EXISTS "Users can create products" ON products;
DROP POLICY IF EXISTS "Users can update own products" ON products;
DROP POLICY IF EXISTS "Users can delete own products" ON products;

-- Create more secure policies for products table
CREATE POLICY "Anyone can view active products"
ON products
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create products"
ON products
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id AND
  (
    -- Validate required fields
    title IS NOT NULL AND
    price > 0 AND
    type IN ('Venda', 'Aluguel') AND
    brand IS NOT NULL AND
    model IS NOT NULL AND
    year IS NOT NULL AND
    location IS NOT NULL AND
    category IN ('Tratores', 'Colheitadeiras', 'Implementos', 'Peças e Componentes') AND
    image_url IS NOT NULL AND
    -- Validate type-specific fields
    (
      (category IN ('Tratores', 'Colheitadeiras') AND hours IS NOT NULL AND power IS NOT NULL) OR
      (category = 'Implementos' AND implement_type IS NOT NULL AND work_width IS NOT NULL) OR
      (category = 'Peças e Componentes' AND part_type IS NOT NULL AND part_condition IS NOT NULL)
    )
  )
);

CREATE POLICY "Users can update own products"
ON products
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own products"
ON products
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Add trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION update_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_products_updated_at();

-- Ensure storage bucket exists and has proper configuration
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'product-images'
  ) THEN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
      'product-images',
      'product-images',
      true,
      5242880, -- 5MB limit
      ARRAY['image/jpeg', 'image/png', 'image/webp']
    );
  ELSE
    UPDATE storage.buckets
    SET 
      file_size_limit = 5242880,
      allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp']
    WHERE id = 'product-images';
  END IF;
END $$;

-- Drop existing storage policies
DROP POLICY IF EXISTS "Users can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;

-- Create more secure storage policies
CREATE POLICY "Users can upload product images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-images' AND
  (CASE 
    WHEN POSITION('.' IN name) > 0 
    THEN LOWER(SUBSTRING(name FROM POSITION('.' IN name) + 1))
    ELSE ''
  END) IN ('jpg', 'jpeg', 'png', 'webp')
);

CREATE POLICY "Public can view product images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'product-images');

CREATE POLICY "Users can delete their own images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'product-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Add function to clean up orphaned images
CREATE OR REPLACE FUNCTION cleanup_orphaned_product_images()
RETURNS void AS $$
BEGIN
  DELETE FROM storage.objects
  WHERE bucket_id = 'product-images'
  AND NOT EXISTS (
    SELECT 1 FROM products
    WHERE image_url LIKE '%' || storage.objects.name
  );
END;
$$ LANGUAGE plpgsql;

-- Create a function to validate product data
CREATE OR REPLACE FUNCTION validate_product_data()
RETURNS trigger AS $$
BEGIN
  -- Basic validation
  IF NEW.price <= 0 THEN
    RAISE EXCEPTION 'O preço deve ser maior que zero';
  END IF;

  IF NEW.type = 'Aluguel' AND NEW.period IS NULL THEN
    RAISE EXCEPTION 'O período é obrigatório para anúncios de aluguel';
  END IF;

  -- Category-specific validation
  CASE NEW.category
    WHEN 'Tratores', 'Colheitadeiras' THEN
      IF NEW.hours IS NULL OR NEW.power IS NULL THEN
        RAISE EXCEPTION 'Horas de uso e potência são obrigatórios para % ', NEW.category;
      END IF;
      IF NEW.hours < 0 THEN
        RAISE EXCEPTION 'Horas de uso não pode ser negativo';
      END IF;
      IF NEW.power <= 0 THEN
        RAISE EXCEPTION 'Potência deve ser maior que zero';
      END IF;

    WHEN 'Implementos' THEN
      IF NEW.implement_type IS NULL OR NEW.work_width IS NULL THEN
        RAISE EXCEPTION 'Tipo de implemento e largura de trabalho são obrigatórios';
      END IF;
      IF NEW.work_width <= 0 THEN
        RAISE EXCEPTION 'Largura de trabalho deve ser maior que zero';
      END IF;

    WHEN 'Peças e Componentes' THEN
      IF NEW.part_type IS NULL OR NEW.part_condition IS NULL THEN
        RAISE EXCEPTION 'Tipo e condição da peça são obrigatórios';
      END IF;
  END CASE;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for product validation
DROP TRIGGER IF EXISTS validate_product_data_trigger ON products;
CREATE TRIGGER validate_product_data_trigger
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION validate_product_data();