-- Adicionar nova categoria nos comentários das migrations existentes
COMMENT ON TABLE products IS 'Tabela de produtos (Tratores, Colheitadeiras, Implementos, Peças e Componentes)';

-- Atualizar produtos existentes que possam estar em categorias antigas
UPDATE products 
SET category = 'Peças e Componentes'
WHERE category = 'Peças' OR category = 'Peças Diversas';