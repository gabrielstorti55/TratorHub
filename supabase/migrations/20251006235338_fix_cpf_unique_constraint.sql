/*
  # Fix CPF/CNPJ unique constraint to allow placeholders

  1. Changes
    - Drop UNIQUE constraint on cpf_cnpj
    - Add UNIQUE constraint that excludes placeholder values (00000000000)
    - This allows multiple users with placeholder CPF during initial signup
  
  2. Security
    - Real CPF/CNPJ values remain unique
    - Placeholder values don't conflict
*/

-- Drop existing unique constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_cpf_cnpj_key;

-- Create partial unique index that excludes placeholder values
CREATE UNIQUE INDEX profiles_cpf_cnpj_unique 
  ON profiles(cpf_cnpj) 
  WHERE cpf_cnpj != '' AND cpf_cnpj != '00000000000' AND cpf_cnpj != '00000000000000';
