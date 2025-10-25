import { memo } from 'react';
import ProductCard from './ProductCard';
import { Product } from '../hooks/useProducts';

interface VirtualProductGridProps {
  products: Product[];
}

const VirtualProductGrid = memo(function VirtualProductGrid({ 
  products
}: VirtualProductGridProps) {
  
  if (products.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          id={product.id}
          title={product.title}
          price={new Intl.NumberFormat('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(product.price)}
          type={product.type}
          period={product.period}
          image={product.image_url}
          location={product.location}
          year={product.year}
        />
      ))}
    </div>
  );
});

export default VirtualProductGrid;
