import React from 'react';
import { Users, Target, Shield, Award } from 'lucide-react';

export default function About() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-900">Sobre Nós</h1>
        
        <div className="prose max-w-none mb-12">
          <p className="text-lg text-gray-600 mb-6">
            A AgroMachines é a principal plataforma de compra, venda e aluguel de máquinas e implementos agrícolas do Brasil. Nossa missão é conectar agricultores e fornecedores de equipamentos de forma segura e eficiente.
          </p>
          <p className="text-lg text-gray-600">
            Fundada em 2024, nossa plataforma já ajudou milhares de agricultores a encontrar os equipamentos ideais para suas operações, sempre com segurança e garantia em todas as transações.
          </p>
        </div>

        {/* Values */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <Users className="text-green-600 mb-4" size={32} />
            <h3 className="text-xl font-semibold mb-2">Comunidade</h3>
            <p className="text-gray-600">
              Construímos uma comunidade forte de agricultores e fornecedores comprometidos com o desenvolvimento do setor.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <Target className="text-green-600 mb-4" size={32} />
            <h3 className="text-xl font-semibold mb-2">Inovação</h3>
            <p className="text-gray-600">
              Buscamos constantemente novas tecnologias e soluções para melhorar a experiência dos nossos usuários.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <Shield className="text-green-600 mb-4" size={32} />
            <h3 className="text-xl font-semibold mb-2">Segurança</h3>
            <p className="text-gray-600">
              Garantimos a segurança em todas as transações realizadas em nossa plataforma.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <Award className="text-green-600 mb-4" size={32} />
            <h3 className="text-xl font-semibold mb-2">Qualidade</h3>
            <p className="text-gray-600">
              Mantemos um alto padrão de qualidade em todos os anúncios e serviços oferecidos.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-gray-900 text-white rounded-lg p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-green-400 mb-2">+5000</div>
              <div className="text-gray-300">Equipamentos Anunciados</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-400 mb-2">+3000</div>
              <div className="text-gray-300">Usuários Ativos</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-400 mb-2">+1000</div>
              <div className="text-gray-300">Negócios Realizados</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}