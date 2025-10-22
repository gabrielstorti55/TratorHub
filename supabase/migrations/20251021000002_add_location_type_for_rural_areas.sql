/*
  # Adicionar suporte para zona rural

  1. Changes
    - Adiciona coluna location_type (urban/rural)
    - Torna CEP opcional (zona rural pode não ter)
    - Atualiza comentários das colunas para refletir novos usos
  
  2. Notes
    - location_type padrão é 'urban' (zona urbana)
    - Para zona rural: address = nome da propriedade, city = cidade de referência
    - Para zona urbana: mantém comportamento atual com CEP
*/

-- Adicionar campo de tipo de localização
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS location_type VARCHAR(10) DEFAULT 'urban' 
CHECK (location_type IN ('urban', 'rural'));

-- Comentários para documentação
COMMENT ON COLUMN profiles.location_type IS 'Tipo de localização: urban (zona urbana com CEP) ou rural (fazenda/sítio)';
COMMENT ON COLUMN profiles.address IS 'Para zona urbana: endereço completo (rua, número). Para zona rural: nome da propriedade/fazenda';
COMMENT ON COLUMN profiles.neighborhood IS 'Apenas para zona urbana. Para zona rural pode ficar vazio';
COMMENT ON COLUMN profiles.postal_code IS 'Apenas para zona urbana. Para zona rural pode ficar vazio';
COMMENT ON COLUMN profiles.city IS 'Para zona urbana: cidade do endereço. Para zona rural: cidade de referência mais próxima';
COMMENT ON COLUMN profiles.company_name IS 'Nome da empresa ou fazenda (opcional)';
