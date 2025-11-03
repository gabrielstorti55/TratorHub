import { Helmet } from 'react-helmet-async';

interface StructuredDataProps {
  type: 'Organization' | 'BreadcrumbList' | 'Product' | 'WebPage' | 'FAQPage';
  data: any;
}

/**
 * Componente para adicionar dados estruturados (Schema.org) às páginas
 * Melhora SEO e habilita rich snippets no Google
 */
export default function StructuredData({ type, data }: StructuredDataProps) {
  
  const generateSchema = () => {
    const baseSchema = {
      '@context': 'https://schema.org',
      '@type': type,
      ...data
    };

    // Adicionar organização em todos os schemas
    if (type !== 'Organization') {
      return [
        baseSchema,
        {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'TratorHub',
          url: 'https://www.tratorhub.com.br',
          logo: 'https://www.tratorhub.com.br/logo.png',
          description: 'Marketplace líder em compra, venda e aluguel de máquinas agrícolas no Brasil',
          contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'Customer Service',
            email: 'contato@tratorhub.com.br',
            availableLanguage: 'Portuguese'
          },
          sameAs: [
            'https://www.facebook.com/tratorhub',
            'https://www.instagram.com/tratorhub',
            'https://www.linkedin.com/company/tratorhub'
          ]
        }
      ];
    }

    return baseSchema;
  };

  const schema = generateSchema();

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
}

// Helpers para criar schemas específicos

export const createBreadcrumbSchema = (items: Array<{ name: string; url: string }>) => {
  return {
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
};

export const createProductSchema = (product: {
  name: string;
  image: string;
  description: string;
  brand: string;
  price: number;
  currency?: string;
  availability?: string;
  condition?: string;
}) => {
  return {
    name: product.name,
    image: product.image,
    description: product.description,
    brand: {
      '@type': 'Brand',
      name: product.brand
    },
    offers: {
      '@type': 'Offer',
      price: product.price.toString(),
      priceCurrency: product.currency || 'BRL',
      availability: product.availability || 'https://schema.org/InStock',
      itemCondition: product.condition || 'https://schema.org/UsedCondition'
    }
  };
};

export const createFAQSchema = (faqs: Array<{ question: string; answer: string }>) => {
  return {
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };
};

export const createWebPageSchema = (page: {
  name: string;
  description: string;
  url: string;
}) => {
  return {
    name: page.name,
    description: page.description,
    url: page.url,
    inLanguage: 'pt-BR',
    isPartOf: {
      '@type': 'WebSite',
      name: 'TratorHub',
      url: 'https://www.tratorhub.com.br'
    }
  };
};
