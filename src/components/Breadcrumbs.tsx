import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import StructuredData, { createBreadcrumbSchema } from './StructuredData';

/**
 * Componente de navegação breadcrumb
 * Melhora UX e SEO com structured data
 */
export default function Breadcrumbs() {
  const location = useLocation();
  
  // Mapeamento de rotas para nomes amigáveis
  const routeNames: Record<string, string> = {
    '/': 'Início',
    '/comprar': 'Comprar Máquinas',
    '/alugar': 'Alugar Equipamentos',
    '/vender': 'Vender Máquinas',
    '/como-funciona': 'Como Funciona',
    '/sobre': 'Sobre Nós',
    '/contato': 'Contato',
    '/comparar': 'Comparar Produtos',
    '/produto': 'Detalhes do Produto',
    '/perfil': 'Meu Perfil',
    '/meus-anuncios': 'Meus Anúncios'
  };

  // Gerar breadcrumbs baseado na URL atual
  const generateBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [
      { name: 'Início', url: 'https://www.tratorhub.com.br/' }
    ];

    let currentPath = '';
    paths.forEach((path) => {
      currentPath += `/${path}`;
      const routeKey = currentPath.replace(/\/[0-9]+$/, '/produto'); // Normalizar rotas dinâmicas
      const name = routeNames[routeKey] || path.charAt(0).toUpperCase() + path.slice(1);
      
      breadcrumbs.push({
        name,
        url: `https://www.tratorhub.com.br${currentPath}`
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Não mostrar breadcrumbs na home
  if (location.pathname === '/') {
    return null;
  }

  return (
    <>
      {/* Structured Data para SEO */}
      <StructuredData 
        type="BreadcrumbList" 
        data={createBreadcrumbSchema(breadcrumbs)}
      />

      {/* UI do Breadcrumb */}
      <nav 
        aria-label="Breadcrumb" 
        className="bg-gray-50 border-b border-gray-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <ol className="flex items-center space-x-2 text-sm">
            {breadcrumbs.map((crumb, index) => (
              <li key={crumb.url} className="flex items-center">
                {index > 0 && (
                  <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />
                )}
                
                {index === breadcrumbs.length - 1 ? (
                  // Último item (página atual) - não é link
                  <span className="flex items-center text-gray-900 font-medium">
                    {index === 0 && <Home className="w-4 h-4 mr-1" />}
                    {crumb.name}
                  </span>
                ) : (
                  // Items anteriores - são links
                  <Link 
                    to={crumb.url.replace('https://www.tratorhub.com.br', '')}
                    className="flex items-center text-gray-600 hover:text-green-600 transition-colors"
                  >
                    {index === 0 && <Home className="w-4 h-4 mr-1" />}
                    {crumb.name}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </div>
      </nav>
    </>
  );
}
