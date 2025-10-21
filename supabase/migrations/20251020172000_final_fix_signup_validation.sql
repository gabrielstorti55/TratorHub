/*
  # Fix final para validação no signup - permite dados vazios

  1. Changes
    - Atualiza validate_profile_data para aceitar strings vazias em TODOS os campos opcionais
    - Remove validações estritas que causam erro 500 no signup
    - Mantém validação apenas quando dados reais são fornecidos
  
  2. Security
    - Permite criação inicial de perfil com dados mínimos
    - Validação aplicada quando usuário completa o perfil
*/

-- Recriar função de validação com lógica relaxada para signup
CREATE OR REPLACE FUNCTION validate_profile_data()
RETURNS trigger AS $$
DECLARE
  clean_cpf_cnpj text;
  clean_phone text;
  clean_postal_code text;
BEGIN
  -- Limpar dados antes da validação
  NEW.full_name := trim(regexp_replace(COALESCE(NEW.full_name, ''), '\s+', ' ', 'g'));
  clean_cpf_cnpj := regexp_replace(COALESCE(NEW.cpf_cnpj, ''), '[^0-9]', '', 'g');
  clean_phone := regexp_replace(COALESCE(NEW.phone, ''), '[^0-9]', '', 'g');
  clean_postal_code := regexp_replace(COALESCE(NEW.postal_code, ''), '[^0-9]', '', 'g');
  NEW.state := upper(COALESCE(NEW.state, ''));
  NEW.city := trim(COALESCE(NEW.city, ''));
  NEW.address := trim(COALESCE(NEW.address, ''));

  -- Atualizar os campos com os valores limpos
  NEW.cpf_cnpj := clean_cpf_cnpj;
  NEW.phone := clean_phone;
  NEW.postal_code := clean_postal_code;

  -- Validar nome completo APENAS se não for vazio
  IF NEW.full_name != '' THEN
    -- Validação básica: pelo menos 2 palavras e caracteres válidos
    IF NOT (NEW.full_name ~ '^[[:alpha:]\s\u00C0-\u00FF''\-\.]+$' AND 
            array_length(regexp_split_to_array(NEW.full_name, '\s+'), 1) >= 2) THEN
      RAISE EXCEPTION 'Nome inválido. Insira nome e sobrenome completos.';
    END IF;
  END IF;

  -- Validar CPF/CNPJ apenas se não for vazio ou placeholder
  IF clean_cpf_cnpj != '' AND clean_cpf_cnpj != '00000000000' AND clean_cpf_cnpj != '00000000000000' THEN
    IF NOT (length(clean_cpf_cnpj) IN (11, 14)) THEN
      RAISE EXCEPTION 'CPF/CNPJ inválido. Deve ter 11 dígitos (CPF) ou 14 dígitos (CNPJ).';
    END IF;
  END IF;
  
  -- Validar telefone apenas se não for vazio ou placeholder
  IF clean_phone != '' AND clean_phone != '00000000000' THEN
    IF NOT (length(clean_phone) IN (10, 11)) THEN
      RAISE EXCEPTION 'Telefone inválido. Deve ter 10 ou 11 dígitos.';
    END IF;
  END IF;
  
  -- Validar CEP apenas se preenchido
  IF NEW.postal_code != '' AND length(clean_postal_code) != 8 THEN
    RAISE EXCEPTION 'CEP inválido. Deve ter 8 dígitos.';
  END IF;

  -- Validar estado apenas se preenchido
  IF NEW.state != '' AND NOT validate_state(NEW.state) THEN
    RAISE EXCEPTION 'Estado inválido. Use a sigla do estado (ex: SP, RJ).';
  END IF;
  
  -- Validar cidade apenas se preenchida
  IF NEW.city != '' AND length(NEW.city) < 3 THEN
    RAISE EXCEPTION 'Cidade inválida. Insira o nome completo da cidade.';
  END IF;

  -- Validar endereço apenas se preenchido
  IF NEW.address != '' AND length(NEW.address) < 5 THEN
    RAISE EXCEPTION 'Endereço inválido. Insira o endereço completo.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
