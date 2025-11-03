/**
 * Script para gerar sitemap.xml dinâmico
 * Inclui rotas estáticas + produtos do Supabase
 * 
 * Uso:
 * node scripts/generate-sitemap.js
 */

import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://gxfhiqhpwjknwqlefhzz.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4ZmhpcWhwd2prbndxbGVmaHp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY5ODI0NjQsImV4cCI6MjA1MjU1ODQ2NH0.xJvPVFyAVGNbYfDCcI0X2_1FgzRiAj2PY9hAXg9kP0Q';

const supabase = createClient(supabaseUrl, supabaseKey);

// Rotas estáticas do site
const staticRoutes = [
  { loc: '/', priority: '1.0', changefreq: 'daily' },
  { loc: '/comprar', priority: '0.9', changefreq: 'daily' },
  { loc: '/alugar', priority: '0.9', changefreq: 'daily' },
  { loc: '/vender', priority: '0.8', changefreq: 'weekly' },
  { loc: '/como-funciona', priority: '0.8', changefreq: 'monthly' },
  { loc: '/sobre', priority: '0.7', changefreq: 'monthly' },
  { loc: '/contato', priority: '0.7', changefreq: 'monthly' },
  { loc: '/comparar', priority: '0.7', changefreq: 'weekly' }
];

/**
 * Formata data no padrão ISO (YYYY-MM-DD)
 */
function formatDate(date) {
  return date.toISOString().split('T')[0];
}

/**
 * Busca produtos do Supabase
 */
async function fetchProducts() {
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('id, updated_at, listing_type')
      .eq('status', 'aprovado')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar produtos:', error);
      return [];
    }

    console.log(`✅ ${products.length} produtos encontrados`);
    return products;
  } catch (error) {
    console.error('Erro na consulta ao Supabase:', error);
    return [];
  }
}

/**
 * Gera XML do sitemap
 */
function generateSitemapXML(routes) {
  const baseUrl = 'https://www.tratorhub.com.br';
  const today = formatDate(new Date());

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
  xml += '        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"\n';
  xml += '        xmlns:xhtml="http://www.w3.org/1999/xhtml"\n';
  xml += '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n\n';

  // Adicionar rotas estáticas
  xml += '  <!-- Páginas Estáticas -->\n';
  routes.static.forEach(route => {
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}${route.loc}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
    xml += `    <priority>${route.priority}</priority>\n`;
    xml += '  </url>\n\n';
  });

  // Adicionar produtos
  if (routes.products && routes.products.length > 0) {
    xml += '  <!-- Produtos Dinâmicos -->\n';
    routes.products.forEach(product => {
      const productDate = product.updated_at 
        ? formatDate(new Date(product.updated_at))
        : today;
      
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/produto/${product.id}</loc>\n`;
      xml += `    <lastmod>${productDate}</lastmod>\n`;
      xml += '    <changefreq>weekly</changefreq>\n';
      xml += '    <priority>0.8</priority>\n';
      xml += '  </url>\n\n';
    });
  }

  xml += '</urlset>';
  return xml;
}

/**
 * Função principal
 */
async function main() {
  console.log('🚀 Gerando sitemap.xml...\n');

  // Buscar produtos
  const products = await fetchProducts();

  // Gerar XML
  const sitemapXML = generateSitemapXML({
    static: staticRoutes,
    products: products
  });

  // Salvar arquivo
  const outputPath = join(__dirname, '..', 'public', 'sitemap.xml');
  writeFileSync(outputPath, sitemapXML, 'utf-8');

  console.log(`\n✅ Sitemap gerado com sucesso!`);
  console.log(`📍 Localização: ${outputPath}`);
  console.log(`📊 Estatísticas:`);
  console.log(`   - Páginas estáticas: ${staticRoutes.length}`);
  console.log(`   - Produtos: ${products.length}`);
  console.log(`   - Total de URLs: ${staticRoutes.length + products.length}`);
  console.log(`\n💡 Próximos passos:`);
  console.log(`   1. Fazer deploy do site`);
  console.log(`   2. Reenviar sitemap no Google Search Console`);
  console.log(`   3. Aguardar indexação (24-72h)`);
}

// Executar
main().catch(console.error);
