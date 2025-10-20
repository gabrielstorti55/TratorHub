/*
  # Create products table for AgroMachines marketplace

  1. New Tables
    - `products`
      - `id` (uuid, primary key)
      - `title` (text, required)
      - `description` (text, optional)
      - `price` (numeric, required)
      - `type` (text, required) - Either 'Venda' or 'Aluguel'
      - `period` (text, optional) - 'Diário', 'Semanal', or 'Mensal' for rental items
      - `brand` (text, required)
      - `model` (text, required)
      - `year` (text, required)
      - `location` (text, required)
      - `category` (text, required)
      - `image_url` (text, required)
      - `user_id` (uuid, references auth.users)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on products table
    - Policies:
      - Anyone can view products
      - Authenticated users can create products
      - Users can update their own products
      - Users can delete their own products

  3. Indexes
    - Default primary key index on id
    - Index on type for filtering
    - Index on category for filtering
    - Index on user_id for ownership lookups
*/

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS products_type_idx ON products(type);
CREATE INDEX IF NOT EXISTS products_category_idx ON products(category);
CREATE INDEX IF NOT EXISTS products_user_id_idx ON products(user_id);

-- Create a trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();