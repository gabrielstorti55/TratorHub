/*
  # Adicionar funções de validação

  1. Funções
    - validate_cpf: Valida CPF usando algoritmo oficial
    - validate_cnpj: Valida CNPJ usando algoritmo oficial
    - validate_phone: Valida número de telefone brasileiro
    - validate_cep: Valida CEP brasileiro

  2. Triggers
    - Adiciona triggers para validar dados antes de inserir/atualizar
*/

-- Função para validar CPF
CREATE OR REPLACE FUNCTION validate_cpf(cpf text)
RETURNS boolean AS $$
DECLARE
  sum integer;
  digit integer;
  cpf_array integer[];
  i integer;
BEGIN
  -- Remover caracteres não numéricos
  cpf := regexp_replace(cpf, '[^0-9]', '', 'g');
  
  -- Verificar tamanho
  IF length(cpf) != 11 THEN
    RETURN false;
  END IF;
  
  -- Verificar números repetidos
  IF cpf ~ '^(\d)\1{10}$' THEN
    RETURN false;
  END IF;
  
  -- Converter para array de inteiros
  cpf_array := array(
    SELECT (substr(cpf, i, 1))::integer 
    FROM generate_series(1, 11) i
  );
  
  -- Validar primeiro dígito
  sum := 0;
  FOR i IN 1..9 LOOP
    sum := sum + (cpf_array[i] * (11 - i));
  END LOOP;
  
  digit := (11 - (sum % 11));
  IF digit >= 10 THEN
    digit := 0;
  END IF;
  
  IF digit != cpf_array[10] THEN
    RETURN false;
  END IF;
  
  -- Validar segundo dígito
  sum := 0;
  FOR i IN 1..10 LOOP
    sum := sum + (cpf_array[i] * (12 - i));
  END LOOP;
  
  digit := (11 - (sum % 11));
  IF digit >= 10 THEN
    digit := 0;
  END IF;
  
  RETURN digit = cpf_array[11];
END;
$$ LANGUAGE plpgsql;

-- Função para validar CNPJ
CREATE OR REPLACE FUNCTION validate_cnpj(cnpj text)
RETURNS boolean AS $$
DECLARE
  sum integer;
  digit integer;
  cnpj_array integer[];
  i integer;
  weight integer[];
BEGIN
  -- Remover caracteres não numéricos
  cnpj := regexp_replace(cnpj, '[^0-9]', '', 'g');
  
  -- Verificar tamanho
  IF length(cnpj) != 14 THEN
    RETURN false;
  END IF;
  
  -- Verificar números repetidos
  IF cnpj ~ '^(\d)\1{13}$' THEN
    RETURN false;
  END IF;
  
  -- Converter para array de inteiros
  cnpj_array := array(
    SELECT (substr(cnpj, i, 1))::integer 
    FROM generate_series(1, 14) i
  );
  
  -- Pesos para cálculo do primeiro dígito
  weight := ARRAY[5,4,3,2,9,8,7,6,5,4,3,2];
  
  -- Validar primeiro dígito
  sum := 0;
  FOR i IN 1..12 LOOP
    sum := sum + (cnpj_array[i] * weight[i]);
  END LOOP;
  
  digit := (11 - (sum % 11));
  IF digit >= 10 THEN
    digit := 0;
  END IF;
  
  IF digit != cnpj_array[13] THEN
    RETURN false;
  END IF;
  
  -- Pesos para cálculo do segundo dígito
  weight := ARRAY[6,5,4,3,2,9,8,7,6,5,4,3,2];
  
  -- Validar segundo dígito
  sum := 0;
  FOR i IN 1..13 LOOP
    sum := sum + (cnpj_array[i] * weight[i]);
  END LOOP;
  
  digit := (11 - (sum % 11));
  IF digit >= 10 THEN
    digit := 0;
  END IF;
  
  RETURN digit = cnpj_array[14];
END;
$$ LANGUAGE plpgsql;

-- Função para validar CPF/CNPJ
CREATE OR REPLACE FUNCTION validate_cpf_cnpj(doc text)
RETURNS boolean AS $$
DECLARE
  clean_doc text;
BEGIN
  -- Remover caracteres não numéricos
  clean_doc := regexp_replace(doc, '[^0-9]', '', 'g');
  
  -- Verificar se é CPF ou CNPJ pelo tamanho
  IF length(clean_doc) = 11 THEN
    RETURN validate_cpf(clean_doc);
  ELSIF length(clean_doc) = 14 THEN
    RETURN validate_cnpj(clean_doc);
  ELSE
    RETURN false;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Função para validar telefone
CREATE OR REPLACE FUNCTION validate_phone(phone text)
RETURNS boolean AS $$
DECLARE
  clean_phone text;
BEGIN
  -- Remover caracteres não numéricos
  clean_phone := regexp_replace(phone, '[^0-9]', '', 'g');
  
  -- Verificar tamanho (10 ou 11 dígitos)
  IF length(clean_phone) NOT IN (10, 11) THEN
    RETURN false;
  END IF;
  
  -- Verificar DDD válido (11-99)
  IF NOT (substr(clean_phone, 1, 2) ~ '^[1-9][1-9]$') THEN
    RETURN false;
  END IF;
  
  -- Se for celular (11 dígitos), verificar se começa com 9
  IF length(clean_phone) = 11 AND substr(clean_phone, 3, 1) != '9' THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Função para validar CEP
CREATE OR REPLACE FUNCTION validate_cep(cep text)
RETURNS boolean AS $$
DECLARE
  clean_cep text;
BEGIN
  -- Remover caracteres não numéricos
  clean_cep := regexp_replace(cep, '[^0-9]', '', 'g');
  
  -- Verificar tamanho (8 dígitos)
  IF length(clean_cep) != 8 THEN
    RETURN false;
  END IF;
  
  -- Verificar se não é um CEP inválido conhecido
  IF clean_cep ~ '^00000000$' THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Trigger para validar dados antes de inserir/atualizar
CREATE OR REPLACE FUNCTION validate_profile_data()
RETURNS trigger AS $$
BEGIN
  -- Validar CPF/CNPJ
  IF NOT validate_cpf_cnpj(NEW.cpf_cnpj) THEN
    RAISE EXCEPTION 'CPF/CNPJ inválido';
  END IF;
  
  -- Validar telefone
  IF NOT validate_phone(NEW.phone) THEN
    RAISE EXCEPTION 'Número de telefone inválido';
  END IF;
  
  -- Validar CEP
  IF NOT validate_cep(NEW.postal_code) THEN
    RAISE EXCEPTION 'CEP inválido';
  END IF;
  
  -- Limpar dados antes de salvar
  NEW.cpf_cnpj := regexp_replace(NEW.cpf_cnpj, '[^0-9]', '', 'g');
  NEW.phone := regexp_replace(NEW.phone, '[^0-9]', '', 'g');
  NEW.postal_code := regexp_replace(NEW.postal_code, '[^0-9]', '', 'g');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger
DROP TRIGGER IF EXISTS validate_profile_data_trigger ON profiles;
CREATE TRIGGER validate_profile_data_trigger
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION validate_profile_data();