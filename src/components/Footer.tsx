import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Linkedin, Phone, Mail, MapPin } from 'lucide-react';
import logo from '../assets/logo transparente.png';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex flex-col">
            <Link to="/" className="inline-block  -mt-7">
              <img 
                src={logo} 
                alt="TratorHub - Conectando produtores rurais" 
                className="h-28 w-auto"
                width="112"
                height="112"
                loading="lazy"
              />
            </Link>
            <p className="text-sm max-w-xs font-size">
              Conectando produtores rurais com equipamentos agrícolas de forma simples e direta.
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
                <span>(16) 99444-0505</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={16} />
                <span>contato@tratorhub.com.br</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={16} />
                <span>Franca, SP</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Redes Sociais</h3>
            <div className="flex gap-4">
              <a href="#" className="hover:text-green-400 transition" aria-label="Facebook do TratorHub">
                <Facebook size={24} aria-hidden="true" />
              </a>
              <a href="https://www.instagram.com/tratorhub" target="_blank" rel="noopener noreferrer" className="hover:text-green-400 transition" aria-label="Instagram do TratorHub">
                <Instagram size={24} aria-hidden="true" />
              </a>
              <a href="#" className="hover:text-green-400 transition" aria-label="LinkedIn do TratorHub">
                <Linkedin size={24} aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
          <p>&copy; 2025 TratorHub. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}