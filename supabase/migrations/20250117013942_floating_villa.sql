-- Drop existing triggers and functions
DROP TRIGGER IF EXISTS validate_profile_data_trigger ON profiles;
DROP FUNCTION IF EXISTS validate_profile_data();
DROP FUNCTION IF EXISTS validate_full_name(text);
DROP FUNCTION IF EXISTS validate_state(text);

-- Create or replace validation functions
CREATE OR REPLACE FUNCTION validate_full_name(name text)
RETURNS boolean AS $$
DECLARE
  cleaned_name text;
BEGIN
  -- Remove extra spaces and trim
  cleaned_name := regexp_replace(trim(name), '\s+', ' ', 'g');
  
  -- Verificar se tem pelo menos duas palavras
  IF array_length(regexp_split_to_array(cleaned_name, '\s+'), 1) < 2 THEN
    RETURN false;
  END IF;
  
  -- Verificar se contém apenas letras e espaços
  RETURN cleaned_name ~ '^[a-zA-ZÀ-ÿ\s]+$';
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION validate_state(state text)
RETURNS boolean AS $$
BEGIN
  RETURN upper(state) = ANY(ARRAY[
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
    'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
    'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ]);
END;
$$ LANGUAGE plpgsql;

-- Create new validation trigger function
CREATE OR REPLACE FUNCTION validate_profile_data()
RETURNS trigger AS $$
BEGIN
  -- Limpar dados antes da validação
  NEW.full_name := trim(regexp_replace(NEW.full_name, '\s+', ' ', 'g'));
  NEW.cpf_cnpj := regexp_replace(NEW.cpf_cnpj, '[^0-9]', '', 'g');
  NEW.phone := regexp_replace(NEW.phone, '[^0-9]', '', 'g');
  NEW.postal_code := regexp_replace(NEW.postal_code, '[^0-9]', '', 'g');
  NEW.state := upper(NEW.state);
  NEW.city := trim(NEW.city);
  NEW.address := trim(NEW.address);

  -- Validar nome completo
  IF NOT validate_full_name(NEW.full_name) THEN
    RAISE EXCEPTION 'Nome inválido. Insira nome e sobrenome usando apenas letras.';
  END IF;

  -- Validar CPF/CNPJ
  IF NOT (length(NEW.cpf_cnpj) IN (11, 14)) THEN
    RAISE EXCEPTION 'CPF/CNPJ inválido. Use apenas números.';
  END IF;
  
  -- Validar telefone
  IF NOT (length(NEW.phone) IN (10, 11)) THEN
    RAISE EXCEPTION 'Telefone inválido. Use apenas números.';
  END IF;
  
  -- Validar CEP
  IF length(NEW.postal_code) != 8 THEN
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

-- Create new trigger
CREATE TRIGGER validate_profile_data_trigger
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION validate_profile_data();

-- Update existing profiles to clean data
UPDATE profiles SET
  full_name = trim(regexp_replace(full_name, '\s+', ' ', 'g')),
  cpf_cnpj = regexp_replace(cpf_cnpj, '[^0-9]', '', 'g'),
  phone = regexp_replace(phone, '[^0-9]', '', 'g'),
  postal_code = regexp_replace(postal_code, '[^0-9]', '', 'g'),
  state = upper(state),
  city = trim(city),
  address = trim(address);