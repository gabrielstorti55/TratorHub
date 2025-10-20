/*
  # Create products and related tables

  1. New Tables
    - `products`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `price` (numeric)
      - `type` (text) - 'Venda' or 'Aluguel'
      - `period` (text, nullable) - for rental period
      - `brand` (text)
      - `model` (text)
      - `year` (text)
      - `location` (text)
      - `category` (text)
      - `image_url` (text)
      - `user_id` (uuid, foreign key)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on products table
    - Add policies for CRUD operations
*/

CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  price numeric NOT NULL,
  type text NOT NULL CHECK (type IN ('Venda', 'Aluguel')),
  period text CHECK (period IN ('Diário', 'Semanal', 'Mensal')),
  brand text NOT NULL,
  model text NOT NULL,
  year text NOT NULL,
  location text NOT NULL,
  category text NOT NULL,
  image_url text NOT NULL,
  user_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Allow read access to everyone
CREATE POLICY "Anyone can view products"
  ON products
  FOR SELECT
  USING (true);

-- Allow insert for authenticated users
CREATE POLICY "Users can create products"
  ON products
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow update for product owners
CREATE POLICY "Users can update own products"
  ON products
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow delete for product owners
CREATE POLICY "Users can delete own products"
  ON products
  FOR DELETE
  USING (auth.uid() = user_id);