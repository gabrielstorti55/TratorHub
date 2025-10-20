-- Create product_images table
CREATE TABLE IF NOT EXISTS product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS product_images_product_id_idx ON product_images(product_id);

-- Enable RLS
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Anyone can view product images"
  ON product_images
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert product images"
  ON product_images
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM products WHERE id = product_id
    )
  );

CREATE POLICY "Users can update own product images"
  ON product_images
  FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT user_id FROM products WHERE id = product_id
    )
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM products WHERE id = product_id
    )
  );

CREATE POLICY "Users can delete own product images"
  ON product_images
  FOR DELETE
  USING (
    auth.uid() IN (
      SELECT user_id FROM products WHERE id = product_id
    )
  );

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_product_images_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_product_images_updated_at
  BEFORE UPDATE ON product_images
  FOR EACH ROW
  EXECUTE FUNCTION update_product_images_updated_at();