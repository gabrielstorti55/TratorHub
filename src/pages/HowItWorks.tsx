import React from 'react';
import { ShoppingCart, Truck, Shield, DollarSign } from 'lucide-react';
import SEO from '../components/SEO';

export default function HowItWorks() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* SEO Meta Tags */}
      <SEO 
        title="Como Funciona - Guia Completo"
        description="Aprenda como comprar, vender e alugar máquinas agrícolas no TratorHub. Passo a passo simples para anunciar seus equipamentos ou encontrar o que você precisa."
        keywords="como funciona TratorHub, tutorial, passo a passo, como anunciar, como comprar"
        canonical="https://www.tratorhub.com.br/como-funciona"
      />
      
      <h1 className="text-4xl font-bold text-center mb-12 text-gray-900">Como Funciona</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="text-center">
          <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="text-green-600" size={32} />
          </div>
          <h3 className="text-xl font-semibold mb-2">1. Navegue pelos Anúncios</h3>
          <p className="text-gray-600">
            Explore os anúncios de máquinas e implementos disponíveis para compra ou aluguel na região.
          </p>
        </div>

        <div className="text-center">
          <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="text-green-600" size={32} />
          </div>
          <h3 className="text-xl font-semibold mb-2">2. Entre em Contato</h3>
          <p className="text-gray-600">
            Encontrou algo interessante? Entre em contato direto com o anunciante pelo telefone ou WhatsApp.
          </p>
        </div>

        <div className="text-center">
          <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <DollarSign className="text-green-600" size={32} />
          </div>
          <h3 className="text-xl font-semibold mb-2">3. Negocie Diretamente</h3>
          <p className="text-gray-600">
            Converse, tire dúvidas e negocie o preço e condições diretamente com o proprietário.
          </p>
        </div>

        <div className="text-center">
          <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Truck className="text-green-600" size={32} />
          </div>
          <h3 className="text-xl font-semibold mb-2">4. Combine os Detalhes</h3>
          <p className="text-gray-600">
            Acerte a forma de pagamento, entrega ou retirada diretamente com o vendedor ou locador.
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
              Para anunciar, você precisa criar uma conta gratuita. Depois, clique em "Anunciar" no menu, preencha os dados do seu equipamento, adicione fotos e publique. É simples e rápido!
            </p>
          </details>

          <details className="bg-white rounded-lg shadow-md p-4">
            <summary className="font-semibold cursor-pointer">A plataforma cobra alguma taxa?</summary>
            <p className="mt-2 text-gray-600">
              Não! O TratorHub é gratuito tanto para anunciar quanto para buscar equipamentos. Conectamos pessoas sem cobrar comissões.
            </p>
          </details>

          <details className="bg-white rounded-lg shadow-md p-4">
            <summary className="font-semibold cursor-pointer">Como funciona o pagamento?</summary>
            <p className="mt-2 text-gray-600">
              O pagamento é combinado diretamente entre comprador e vendedor. Somos uma plataforma de anúncios, não intermediamos pagamentos. Recomendamos sempre documentar a negociação.
            </p>
          </details>

          <details className="bg-white rounded-lg shadow-md p-4">
            <summary className="font-semibold cursor-pointer">Como funciona o aluguel?</summary>
            <p className="mt-2 text-gray-600">
              O aluguel funciona da mesma forma: você encontra o anúncio, entra em contato com o proprietário e combina período, valor e condições diretamente com ele.
            </p>
          </details>

          <details className="bg-white rounded-lg shadow-md p-4">
            <summary className="font-semibold cursor-pointer">Vocês fazem entrega dos equipamentos?</summary>
            <p className="mt-2 text-gray-600">
              Não fazemos entrega. A logística é combinada entre comprador e vendedor. Alguns anunciantes podem oferecer entrega, outros preferem que o comprador retire no local.
            </p>
          </details>

          <details className="bg-white rounded-lg shadow-md p-4">
            <summary className="font-semibold cursor-pointer">Como posso confiar nos anúncios?</summary>
            <p className="mt-2 text-gray-600">
              Recomendamos sempre conversar bem com o anunciante, pedir mais fotos se necessário e, quando possível, visitar o equipamento pessoalmente antes de fechar negócio. Use o bom senso!
            </p>
          </details>
        </div>
      </div>
    </div>
  );
}