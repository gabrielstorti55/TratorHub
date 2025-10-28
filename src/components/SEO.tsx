import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product';
}

/**
 * Componente SEO otimizado para todas as páginas
 * Gerencia meta tags, Open Graph, Twitter Cards e Schema.org
 */
export default function SEO({ 
  title, 
  description, 
  keywords = 'máquinas agrícolas, tratores, colheitadeiras, implementos agrícolas, comprar trator, alugar equipamentos agrícolas',
  canonical,
  ogImage = 'https://www.tratorhub.com.br/logo.png',
  ogType = 'website'
}: SEOProps) {
  const siteTitle = 'TratorHub';
  const fullTitle = `${title} | ${siteTitle}`;
  const siteUrl = 'https://www.tratorhub.com.br';
  const canonicalUrl = canonical || siteUrl;

  return (
    <Helmet>
      {/* Meta Tags Básicas */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Open Graph para Facebook/LinkedIn */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content={siteTitle} />
      <meta property="og:locale" content="pt_BR" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* Mobile Web App */}
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content={siteTitle} />
      
      {/* Geo Tags para Brasil */}
      <meta name="geo.region" content="BR" />
      <meta name="geo.placename" content="Brasil" />
      
      {/* Idioma */}
      <meta httpEquiv="content-language" content="pt-BR" />
      
      {/* Robots */}
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow" />
    </Helmet>
  );
}
