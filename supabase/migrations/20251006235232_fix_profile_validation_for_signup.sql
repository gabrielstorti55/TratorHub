/*
  # Fix profile validation to allow signup with missing data

  1. Changes
    - Update validation function to allow empty/placeholder values during initial signup
    - Users can complete their profile information later
    - Validation still applies when users update with real data
  
  2. Security
    - Maintains data integrity for completed profiles
    - Allows initial profile creation with minimal data
*/

-- Update validation function to be more lenient for initial signup
CREATE OR REPLACE FUNCTION validate_profile_data()
RETURNS trigger AS $$
DECLARE
  clean_cpf_cnpj text;
  clean_phone text;
  clean_postal_code text;
BEGIN
  -- Limpar dados antes da validação
  NEW.full_name := trim(regexp_replace(NEW.full_name, '\s+', ' ', 'g'));
  clean_cpf_cnpj := regexp_replace(NEW.cpf_cnpj, '[^0-9]', '', 'g');
  clean_phone := regexp_replace(NEW.phone, '[^0-9]', '', 'g');
  clean_postal_code := regexp_replace(NEW.postal_code, '[^0-9]', '', 'g');
  NEW.state := upper(NEW.state);
  NEW.city := trim(NEW.city);
  NEW.address := trim(NEW.address);

  -- Atualizar os campos com os valores limpos
  NEW.cpf_cnpj := clean_cpf_cnpj;
  NEW.phone := clean_phone;
  NEW.postal_code := clean_postal_code;

  -- Validar CPF/CNPJ apenas se não for placeholder
  IF clean_cpf_cnpj != '' AND clean_cpf_cnpj != '00000000000' AND clean_cpf_cnpj != '00000000000000' THEN
    IF NOT (length(clean_cpf_cnpj) IN (11, 14)) THEN
      RAISE EXCEPTION 'CPF/CNPJ inválido. Use apenas números.';
    END IF;
  END IF;
  
  -- Validar telefone apenas se não for placeholder
  IF clean_phone != '' AND clean_phone != '00000000000' THEN
    IF NOT (length(clean_phone) IN (10, 11)) THEN
      RAISE EXCEPTION 'Telefone inválido. Use apenas números.';
    END IF;
  END IF;
  
  -- Validar campos opcionais apenas se estiverem preenchidos
  IF NEW.postal_code != '' AND length(clean_postal_code) != 8 THEN
    RAISE EXCEPTION 'CEP inválido. Use apenas números.';
  END IF;

  IF NEW.state != '' AND NOT validate_state(NEW.state) THEN
    RAISE EXCEPTION 'Estado inválido. Use a sigla do estado (ex: SP, RJ).';
  END IF;
  
  IF NEW.city != '' AND length(NEW.city) < 3 THEN
    RAISE EXCEPTION 'Cidade inválida. Insira o nome completo da cidade.';
  END IF;

  IF NEW.address != '' AND length(NEW.address) < 5 THEN
    RAISE EXCEPTION 'Endereço inválido. Insira o endereço completo.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
