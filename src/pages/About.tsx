import React from 'react';
import { Users, Target, Shield, Award } from 'lucide-react';
import SEO from '../components/SEO';

export default function About() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* SEO Meta Tags */}
      <SEO 
        title="Sobre Nós - Conheça o TratorHub"
        description="Conheça a história do TratorHub, a plataforma que conecta produtores rurais e fornecedores de equipamentos agrícolas. Nossa missão, valores e compromisso com o agronegócio brasileiro."
        keywords="sobre TratorHub, quem somos, plataforma agrícola, história TratorHub, missão e valores"
        canonical="https://www.tratorhub.com.br/sobre"
      />
      
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-900">Sobre Nós</h1>
        
        <div className="prose max-w-none mb-12">
          <p className="text-lg text-gray-600 mb-6">
            O TratorHub nasceu da necessidade real de facilitar a conexão entre produtores rurais e fornecedores de equipamentos agrícolas. Somos uma plataforma em crescimento, focada em tornar mais acessível e transparente o processo de compra, venda e aluguel de máquinas.
          </p>
          <p className="text-lg text-gray-600 mb-6">
            Criada em 2025 por uma equipe apaixonada por tecnologia e agronegócio, nossa missão é simples: conectar quem precisa de equipamentos com quem pode fornecer, de forma prática e confiável.
          </p>
          <p className="text-lg text-gray-600">
            Estamos em constante evolução, ouvindo nossos usuários e melhorando a plataforma a cada dia. Acreditamos que a tecnologia pode democratizar o acesso a equipamentos agrícolas de qualidade, ajudando pequenos e médios produtores a crescerem seus negócios.
          </p>
        </div>

        {/* Values */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <Users className="text-green-600 mb-4" size={32} />
            <h3 className="text-xl font-semibold mb-2">Conexão Real</h3>
            <p className="text-gray-600">
              Facilitamos o contato direto entre produtores e fornecedores, sem intermediários, de forma transparente e honesta.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <Target className="text-green-600 mb-4" size={32} />
            <h3 className="text-xl font-semibold mb-2">Simplicidade</h3>
            <p className="text-gray-600">
              Nossa plataforma foi criada para ser fácil de usar, mesmo para quem não tem familiaridade com tecnologia.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <Shield className="text-green-600 mb-4" size={32} />
            <h3 className="text-xl font-semibold mb-2">Confiança</h3>
            <p className="text-gray-600">
              Trabalhamos para criar um ambiente seguro, com verificação de anúncios e suporte ao usuário.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <Award className="text-green-600 mb-4" size={32} />
            <h3 className="text-xl font-semibold mb-2">Crescimento</h3>
            <p className="text-gray-600">
              Estamos em constante evolução, crescendo junto com nossa comunidade de usuários.
            </p>
          </div>
        </div>

        {/* Stats */}
        {/* <div className="bg-gray-900 text-white rounded-lg p-8">
          <h2 className="text-2xl font-semibold text-center mb-8">Nossa Jornada Até Agora</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-green-400 mb-2">150+</div>
              <div className="text-gray-300">Anúncios Ativos</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-400 mb-2">80+</div>
              <div className="text-gray-300">Usuários Cadastrados</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-400 mb-2">25+</div>
              <div className="text-gray-300">Negociações Realizadas</div>
            </div>
          </div>
          <p className="text-center text-gray-600 mt-6 text-sm">
            * Números atualizados em outubro de 2025
          </p>
        </div> */}
      </div>
    </div>
  );
}