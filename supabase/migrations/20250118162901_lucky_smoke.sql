-- Drop existing check constraints
ALTER TABLE products
DROP CONSTRAINT IF EXISTS check_implement_type,
DROP CONSTRAINT IF EXISTS check_part_type,
DROP CONSTRAINT IF EXISTS check_part_condition;

-- Add updated check constraints with all valid values
ALTER TABLE products
ADD CONSTRAINT check_implement_type CHECK (
  implement_type IS NULL OR 
  implement_type IN (
    'Arado',
    'Grade',
    'Plantadeira',
    'Pulverizador',
    'Colhedora',
    'Semeadora',
    'Distribuidor',
    'Carreta',
    'Plataforma',
    'Subsolador',
    'Cultivador',
    'Roçadeira',
    'Enleirador',
    'Enfardadeira',
    'Outro'
  )
),
ADD CONSTRAINT check_part_type CHECK (
  part_type IS NULL OR 
  part_type IN (
    'Motor',
    'Transmissão',
    'Hidráulico',
    'Elétrico',
    'Chassi',
    'Suspensão',
    'Direção',
    'Freios',
    'Embreagem',
    'Filtros',
    'Rolamentos',
    'Correias',
    'Outro'
  )
),
ADD CONSTRAINT check_part_condition CHECK (
  part_condition IS NULL OR 
  part_condition IN (
    'Nova',
    'Usada',
    'Recondicionada'
  )
);

-- Update validation function to match new constraints
CREATE OR REPLACE FUNCTION validate_product_data()
RETURNS trigger AS $$
BEGIN
  -- Basic validation
  IF NEW.price <= 0 THEN
    RAISE EXCEPTION 'O preço deve ser maior que zero';
  END IF;

  IF NEW.type = 'Aluguel' AND NEW.period IS NULL THEN
    RAISE EXCEPTION 'O período é obrigatório para anúncios de aluguel';
  END IF;

  -- Category-specific validation
  CASE NEW.category
    WHEN 'Tratores', 'Colheitadeiras' THEN
      IF NEW.hours IS NULL OR NEW.power IS NULL THEN
        RAISE EXCEPTION 'Horas de uso e potência são obrigatórios para %', NEW.category;
      END IF;
      IF NEW.hours < 0 THEN
        RAISE EXCEPTION 'Horas de uso não pode ser negativo';
      END IF;
      IF NEW.power <= 0 THEN
        RAISE EXCEPTION 'Potência deve ser maior que zero';
      END IF;

    WHEN 'Implementos' THEN
      IF NEW.implement_type IS NULL THEN
        RAISE EXCEPTION 'Tipo de implemento é obrigatório';
      END IF;
      IF NEW.work_width IS NULL OR NEW.work_width <= 0 THEN
        RAISE EXCEPTION 'Largura de trabalho deve ser maior que zero';
      END IF;

    WHEN 'Peças e Componentes' THEN
      IF NEW.part_type IS NULL THEN
        RAISE EXCEPTION 'Tipo de peça é obrigatório';
      END IF;
      IF NEW.part_condition IS NULL THEN
        RAISE EXCEPTION 'Condição da peça é obrigatória';
      END IF;
  END CASE;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;