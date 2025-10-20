import React from 'react';
import { Link } from 'react-router-dom';
import { Tractor, Facebook, Instagram, Linkedin, Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Tractor className="text-white" size={32} />
              <span className="text-xl font-bold text-white">AgroMachines</span>
            </Link>
            <p className="text-sm">
              Seu marketplace confiável para compra, venda e aluguel de máquinas e implementos agrícolas.
            </p>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Links Rápidos</h3>
            <ul className="space-y-2">
              <li><Link to="/sobre" className="hover:text-green-400 transition">Sobre Nós</Link></li>
              <li><Link to="/como-funciona" className="hover:text-green-400 transition">Como Funciona</Link></li>
              <li><Link to="/vender" className="hover:text-green-400 transition">Anunciar</Link></li>
              <li><Link to="/contato" className="hover:text-green-400 transition">Contato</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Contato</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <Phone size={16} />
                <span>(11) 99999-9999</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={16} />
                <span>contato@agromachines.com.br</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={16} />
                <span>São Paulo, SP</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Redes Sociais</h3>
            <div className="flex gap-4">
              <a href="#" className="hover:text-green-400 transition">
                <Facebook size={24} />
              </a>
              <a href="#" className="hover:text-green-400 transition">
                <Instagram size={24} />
              </a>
              <a href="#" className="hover:text-green-400 transition">
                <Linkedin size={24} />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
          <p>&copy; 2024 AgroMachines. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}