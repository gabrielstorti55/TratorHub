-- Drop existing triggers and functions
DROP TRIGGER IF EXISTS validate_profile_data_trigger ON profiles;
DROP FUNCTION IF EXISTS validate_profile_data();
DROP FUNCTION IF EXISTS validate_full_name(text);

-- Create improved name validation function with better Unicode support
CREATE OR REPLACE FUNCTION validate_full_name(name text)
RETURNS boolean AS $$
DECLARE
  cleaned_name text;
  name_parts text[];
BEGIN
  -- Remove extra spaces and trim
  cleaned_name := regexp_replace(trim(name), '\s+', ' ', 'g');
  
  -- Split into parts
  name_parts := regexp_split_to_array(cleaned_name, '\s+');
  
  -- Check if has at least two parts
  IF array_length(name_parts, 1) < 2 THEN
    RETURN false;
  END IF;
  
  -- Check if each part is valid
  FOR i IN 1..array_length(name_parts, 1) LOOP
    -- Skip checking length for prepositions and articles
    IF name_parts[i] = ANY(ARRAY[
      'de', 'da', 'do', 'dos', 'das', 'e', 
      'von', 'van', 'del', 'der', 'den',
      'la', 'el', 'al', 'ibn', 'ben',
      'mac', 'mc', 'o', 'di', 'des'
    ]) THEN
      CONTINUE;
    END IF;
    
    -- Each non-preposition part must:
    -- 1. Be at least 2 characters long
    -- 2. Contain at least one letter
    -- 3. Not start or end with special characters
    IF length(name_parts[i]) < 2 
      OR NOT name_parts[i] ~ '[[:alpha:]]'
      OR name_parts[i] ~ '^[^[:alpha:]]|[^[:alpha:]]$' THEN
      RETURN false;
    END IF;
  END LOOP;
  
  -- Allow:
  -- - Letters (including accented)
  -- - Spaces
  -- - Hyphens (for compound names)
  -- - Apostrophes (for names like D'Ávila, O'Connor)
  -- - Periods (for abbreviations like J.)
  RETURN cleaned_name ~ '^[[:alpha:]\s\u00C0-\u00FF''\-\.]+$'
    AND NOT cleaned_name ~ '[-''\.]{2,}'  -- No consecutive special characters
    AND NOT cleaned_name ~ '^[^[:alpha:]]|[^[:alpha:]]$'  -- Must start and end with letter
    AND length(cleaned_name) >= 5;  -- Minimum total length
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
    RAISE EXCEPTION 'Nome inválido. Insira nome e sobrenome usando apenas letras, hífens e apóstrofos quando necessário.';
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