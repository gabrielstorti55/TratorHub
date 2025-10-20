-- Adicionar restrições de validação se não existirem
DO $$ BEGIN
  -- Alterar colunas para NOT NULL
  ALTER TABLE profiles
    ALTER COLUMN full_name SET NOT NULL,
    ALTER COLUMN cpf_cnpj SET NOT NULL,
    ALTER COLUMN phone SET NOT NULL,
    ALTER COLUMN address SET NOT NULL,
    ALTER COLUMN city SET NOT NULL,
    ALTER COLUMN state SET NOT NULL,
    ALTER COLUMN postal_code SET NOT NULL;
EXCEPTION
  WHEN others THEN NULL;
END $$;

-- Adicionar checks para formatos se não existirem
DO $$ BEGIN
  -- CPF/CNPJ format
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_cpf_cnpj_format'
  ) THEN
    ALTER TABLE profiles
      ADD CONSTRAINT check_cpf_cnpj_format 
        CHECK (cpf_cnpj ~ '^[0-9]{11,14}$');
  END IF;

  -- Phone format
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_phone_format'
  ) THEN
    ALTER TABLE profiles
      ADD CONSTRAINT check_phone_format 
        CHECK (phone ~ '^[0-9]{10,11}$');
  END IF;

  -- Postal code format
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_postal_code_format'
  ) THEN
    ALTER TABLE profiles
      ADD CONSTRAINT check_postal_code_format 
        CHECK (postal_code ~ '^[0-9]{8}$');
  END IF;

  -- State format
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_state_format'
  ) THEN
    ALTER TABLE profiles
      ADD CONSTRAINT check_state_format 
        CHECK (length(state) = 2);
  END IF;
END $$;

-- Adicionar índices se não existirem
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'idx_profiles_full_name'
  ) THEN
    CREATE INDEX idx_profiles_full_name ON profiles(full_name);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'idx_profiles_city'
  ) THEN
    CREATE INDEX idx_profiles_city ON profiles(city);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'idx_profiles_state'
  ) THEN
    CREATE INDEX idx_profiles_state ON profiles(state);
  END IF;
END $$;