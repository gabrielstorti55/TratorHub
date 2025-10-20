-- Drop existing triggers and functions
DROP TRIGGER IF EXISTS validate_profile_data_trigger ON profiles;
DROP FUNCTION IF EXISTS validate_profile_data();

-- Create validation trigger function without name validation
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

  -- Validar CPF/CNPJ
  IF NOT (length(clean_cpf_cnpj) IN (11, 14)) THEN
    RAISE EXCEPTION 'CPF/CNPJ inválido. Use apenas números.';
  END IF;
  
  -- Validar telefone
  IF NOT (length(clean_phone) IN (10, 11)) THEN
    RAISE EXCEPTION 'Telefone inválido. Use apenas números.';
  END IF;
  
  -- Validar CEP
  IF length(clean_postal_code) != 8 THEN
    RAISE EXCEPTION 'CEP inválido. Use apenas números.';
  END IF;

  -- Validar estado
  IF NOT validate_state(NEW.state) THEN
    RAISE EXCEPTION 'Estado inválido. Use a sigla do estado (ex: SP, RJ).';
  END IF;
  
  -- Validar cidade
  IF length(NEW.city) < 3 THEN
    RAISE EXCEPTION 'Cidade inválida. Insira o nome completo da cidade.';
  END IF;

  -- Validar endereço
  IF length(NEW.address) < 5 THEN
    RAISE EXCEPTION 'Endereço inválido. Insira o endereço completo.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER validate_profile_data_trigger
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION validate_profile_data();