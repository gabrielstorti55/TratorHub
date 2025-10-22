/*
  # Adicionar campo de bairro à tabela profiles

  1. Changes
    - Adiciona coluna neighborhood (bairro) à tabela profiles
    - Permite valores vazios inicialmente
  
  2. Notes
    - O campo será preenchido automaticamente via API ViaCEP
*/

-- Adicionar coluna neighborhood
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS neighborhood text DEFAULT '';

-- Adicionar comentário para documentação
COMMENT ON COLUMN profiles.neighborhood IS 'Bairro do usuário, preenchido via API ViaCEP';
