/*
  # Alterar padrão de location_type para urban

  1. Changes
    - Altera o padrão de 'rural' para 'urban'
    - Atualiza registros existentes que não têm location_type definido
  
  2. Notes
    - Usuários novos terão 'urban' por padrão
    - Usuários existentes sem CEP serão marcados como 'rural'
    - Usuários existentes com CEP serão marcados como 'urban'
*/

-- Atualizar registros existentes baseado na presença de CEP
UPDATE profiles 
SET location_type = CASE 
  WHEN postal_code IS NOT NULL AND postal_code != '' THEN 'urban'
  ELSE 'rural'
END
WHERE location_type IS NULL;

-- Alterar o padrão da coluna para 'urban'
ALTER TABLE profiles 
ALTER COLUMN location_type SET DEFAULT 'urban';
