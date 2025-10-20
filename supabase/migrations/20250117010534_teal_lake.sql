-- Função para validar nome completo
CREATE OR REPLACE FUNCTION validate_full_name(name text)
RETURNS boolean AS $$
BEGIN
  -- Verificar se tem pelo menos duas palavras
  IF array_length(regexp_split_to_array(trim(name), '\s+'), 1) < 2 THEN
    RETURN false;
  END IF;
  
  -- Verificar se não contém números ou caracteres especiais
  IF name ~ '[0-9!@#$%^&*(),.?":{}|<>]' THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Função para validar estado
CREATE OR REPLACE FUNCTION validate_state(state text)
RETURNS boolean AS $$
BEGIN
  RETURN state = ANY(ARRAY[
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
    'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
    'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ]);
END;
$$ LANGUAGE plpgsql;

-- Atualizar trigger de validação
DO $$ BEGIN
  -- Drop existing trigger if it exists
  DROP TRIGGER IF EXISTS validate_profile_data_trigger ON profiles;
  
  -- Drop existing function if it exists
  DROP FUNCTION IF EXISTS validate_profile_data();
  
  -- Create new function
  CREATE FUNCTION validate_profile_data()
  RETURNS trigger AS $BODY$
  BEGIN
    -- Validar nome completo
    IF NOT validate_full_name(NEW.full_name) THEN
      RAISE EXCEPTION 'Nome inválido. Insira nome e sobrenome sem números ou caracteres especiais.';
    END IF;

    -- Validar CPF/CNPJ
    IF NOT validate_cpf_cnpj(NEW.cpf_cnpj) THEN
      RAISE EXCEPTION 'CPF/CNPJ inválido. Verifique os números informados.';
    END IF;
    
    -- Validar telefone
    IF NOT validate_phone(NEW.phone) THEN
      RAISE EXCEPTION 'Telefone inválido. Use o formato (00) 00000-0000 para celular ou (00) 0000-0000 para fixo.';
    END IF;
    
    -- Validar CEP
    IF NOT validate_cep(NEW.postal_code) THEN
      RAISE EXCEPTION 'CEP inválido. Use o formato 00000-000.';
    END IF;

    -- Validar estado
    IF NOT validate_state(upper(NEW.state)) THEN
      RAISE EXCEPTION 'Estado inválido. Use a sigla do estado (ex: SP, RJ).';
    END IF;
    
    -- Validar cidade (não pode estar vazia e deve ter pelo menos 3 caracteres)
    IF length(trim(NEW.city)) < 3 THEN
      RAISE EXCEPTION 'Cidade inválida. Insira o nome completo da cidade.';
    END IF;

    -- Validar endereço (não pode estar vazio)
    IF length(trim(NEW.address)) < 5 THEN
      RAISE EXCEPTION 'Endereço inválido. Insira o endereço completo.';
    END IF;
    
    -- Limpar e formatar dados
    NEW.cpf_cnpj := regexp_replace(NEW.cpf_cnpj, '[^0-9]', '', 'g');
    NEW.phone := regexp_replace(NEW.phone, '[^0-9]', '', 'g');
    NEW.postal_code := regexp_replace(NEW.postal_code, '[^0-9]', '', 'g');
    NEW.state := upper(NEW.state);
    NEW.full_name := trim(regexp_replace(NEW.full_name, '\s+', ' ', 'g'));
    
    RETURN NEW;
  END;
  $BODY$ LANGUAGE plpgsql;

  -- Create new trigger
  CREATE TRIGGER validate_profile_data_trigger
    BEFORE INSERT OR UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION validate_profile_data();
END $$;