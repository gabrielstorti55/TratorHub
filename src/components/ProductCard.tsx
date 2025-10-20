import React from 'react';
import { MapPin, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProductCardProps {
  id: string;
  title: string;
  price: string;
  type: 'Venda' | 'Aluguel';
  period?: string;
  image: string;
  location: string;
  year: string;
}

export default function ProductCard({
  id,
  title,
  price,
  type,
  period,
  image,
  location,
  year
}: ProductCardProps) {
  const navigate = useNavigate();

  return (
    <div 
      className="bg-white rounded-lg overflow-hidden hover:shadow-lg transition group cursor-pointer"
      onClick={() => navigate(`/produto/${id}`)}
    >
      <div className="relative">
        <img
          src={image}
          alt={title}
          className="w-full h-48 object-cover group-hover:scale-105 transition duration-300"
        />
        <div className="absolute top-3 right-3">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            type === 'Venda'
              ? 'bg-green-600 text-white'
              : 'bg-gray-900 text-white'
          }`}>
            {type}
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition">
          {title}
        </h3>
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
          <div className="flex items-center gap-1">
            <MapPin size={16} />
            <span>{location}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar size={16} />
            <span>{year}</span>
          </div>
        </div>
        <div className="flex justify-between items-end">
          <div>
            <span className="text-sm text-gray-500">
              {type === 'Venda' ? 'Valor' : period ? `${period}` : 'Diária'}
            </span>
            <p className="text-xl font-bold text-gray-900">
              R$ {price}
            </p>
          </div>
          <button className="text-green-600 font-semibold text-sm hover:text-green-500 transition">
            Ver detalhes
          </button>
        </div>
      </div>
    </div>
  );
}