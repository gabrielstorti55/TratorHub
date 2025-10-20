import React from 'react';
import { ShoppingCart, Truck, Shield, DollarSign } from 'lucide-react';

export default function HowItWorks() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-12 text-gray-900">Como Funciona</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="text-center">
          <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="text-green-600" size={32} />
          </div>
          <h3 className="text-xl font-semibold mb-2">Encontre o Equipamento</h3>
          <p className="text-gray-600">
            Busque entre milhares de máquinas e implementos agrícolas disponíveis.
          </p>
        </div>

        <div className="text-center">
          <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="text-green-600" size={32} />
          </div>
          <h3 className="text-xl font-semibold mb-2">Negocie com Segurança</h3>
          <p className="text-gray-600">
            Utilize nossa plataforma segura para todas as negociações e pagamentos.
          </p>
        </div>

        <div className="text-center">
          <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <DollarSign className="text-green-600" size={32} />
          </div>
          <h3 className="text-xl font-semibold mb-2">Realize o Pagamento</h3>
          <p className="text-gray-600">
            Escolha entre várias opções de pagamento seguras e garantidas.
          </p>
        </div>

        <div className="text-center">
          <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Truck className="text-green-600" size={32} />
          </div>
          <h3 className="text-xl font-semibold mb-2">Receba seu Equipamento</h3>
          <p className="text-gray-600">
            Acompanhe a entrega e receba seu equipamento no prazo combinado.
          </p>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mt-16">
        <h2 className="text-3xl font-bold text-center mb-8">Perguntas Frequentes</h2>
        <div className="max-w-3xl mx-auto space-y-4">
          <details className="bg-white rounded-lg shadow-md p-4">
            <summary className="font-semibold cursor-pointer">Como faço para anunciar?</summary>
            <p className="mt-2 text-gray-600">
              Para anunciar, basta criar uma conta gratuita e clicar em "Anunciar Agora". Preencha as informações do seu equipamento e publique seu anúncio.
            </p>
          </details>

          <details className="bg-white rounded-lg shadow-md p-4">
            <summary className="font-semibold cursor-pointer">Quais são as formas de pagamento?</summary>
            <p className="mt-2 text-gray-600">
              Aceitamos diversas formas de pagamento, incluindo cartão de crédito, boleto bancário e transferência bancária.
            </p>
          </details>

          <details className="bg-white rounded-lg shadow-md p-4">
            <summary className="font-semibold cursor-pointer">Como funciona o aluguel?</summary>
            <p className="mt-2 text-gray-600">
              O aluguel é feito diretamente com o proprietário do equipamento. Você pode escolher entre períodos diários, semanais ou mensais.
            </p>
          </details>

          <details className="bg-white rounded-lg shadow-md p-4">
            <summary className="font-semibold cursor-pointer">O site oferece garantia?</summary>
            <p className="mt-2 text-gray-600">
              Sim, oferecemos garantia em todas as transações realizadas através da nossa plataforma, protegendo tanto compradores quanto vendedores.
            </p>
          </details>
        </div>
      </div>
    </div>
  );
}