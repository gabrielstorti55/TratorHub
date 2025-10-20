-- Add new columns for product details
ALTER TABLE products
ADD COLUMN IF NOT EXISTS hours integer,
ADD COLUMN IF NOT EXISTS power integer,
ADD COLUMN IF NOT EXISTS implement_type text,
ADD COLUMN IF NOT EXISTS work_width numeric,
ADD COLUMN IF NOT EXISTS part_type text,
ADD COLUMN IF NOT EXISTS part_condition text CHECK (part_condition IN ('Nova', 'Usada', 'Recondicionada')),
ADD COLUMN IF NOT EXISTS part_number text;

-- Add check constraints
ALTER TABLE products
ADD CONSTRAINT check_hours_positive CHECK (hours IS NULL OR hours >= 0),
ADD CONSTRAINT check_power_positive CHECK (power IS NULL OR power >= 0),
ADD CONSTRAINT check_work_width_positive CHECK (work_width IS NULL OR work_width >= 0),
ADD CONSTRAINT check_implement_type CHECK (
  implement_type IS NULL OR 
  implement_type IN ('Arado', 'Grade', 'Plantadeira', 'Pulverizador', 'Colhedora', 'Outro')
),
ADD CONSTRAINT check_part_type CHECK (
  part_type IS NULL OR 
  part_type IN ('Motor', 'Transmissão', 'Hidráulico', 'Elétrico', 'Chassi', 'Outro')
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_products_hours ON products(hours);
CREATE INDEX IF NOT EXISTS idx_products_power ON products(power);
CREATE INDEX IF NOT EXISTS idx_products_implement_type ON products(implement_type);
CREATE INDEX IF NOT EXISTS idx_products_part_type ON products(part_type);
CREATE INDEX IF NOT EXISTS idx_products_part_condition ON products(part_condition);

-- Update database types
COMMENT ON TABLE products IS 'Table storing agricultural machinery and equipment listings';
COMMENT ON COLUMN products.hours IS 'Operating hours for machinery (tractors, harvesters)';
COMMENT ON COLUMN products.power IS 'Engine power in horsepower (cv)';
COMMENT ON COLUMN products.implement_type IS 'Type of agricultural implement';
COMMENT ON COLUMN products.work_width IS 'Working width in meters for implements';
COMMENT ON COLUMN products.part_type IS 'Type of spare part or component';
COMMENT ON COLUMN products.part_condition IS 'Condition of the spare part (New, Used, Reconditioned)';
COMMENT ON COLUMN products.part_number IS 'Manufacturer part number if available';