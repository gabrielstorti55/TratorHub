/**
 * Script de otimização avançada de imagens
 * - Converte para WebP/AVIF
 * - Redimensiona para múltiplas resoluções
 * - Comprime com qualidade otimizada
 * 
 * Uso: node scripts/optimize-images-advanced.js
 */

import sharp from 'sharp';
import { readdir, stat, mkdir } from 'fs/promises';
import { join, extname, basename } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PUBLIC_DIR = join(__dirname, '..', 'public');
const OUTPUT_DIR = join(PUBLIC_DIR, 'optimized');

// Configurações de otimização
const SIZES = {
  thumbnail: 400,
  small: 800,
  medium: 1200,
  large: 1920,
  xlarge: 2560,
};

const FORMATS = ['webp', 'avif']; // Formatos modernos

const QUALITY = {
  webp: 80,
  avif: 75,
  jpeg: 85,
};

/**
 * Verifica se o arquivo é uma imagem
 */
function isImage(filename) {
  const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff'];
  return imageExts.includes(extname(filename).toLowerCase());
}

/**
 * Otimiza uma única imagem
 */
async function optimizeImage(inputPath, filename) {
  const name = basename(filename, extname(filename));
  const image = sharp(inputPath);
  const metadata = await image.metadata();
  
  console.log(`\n📸 Processando: ${filename}`);
  console.log(`   Dimensões originais: ${metadata.width}x${metadata.height}`);
  console.log(`   Tamanho original: ${(await stat(inputPath)).size / 1024 / 1024}MB`);

  let totalSaved = 0;

  // Gerar versões em diferentes tamanhos
  for (const [sizeName, width] of Object.entries(SIZES)) {
    // Pular se a imagem original for menor que o tamanho alvo
    if (metadata.width && metadata.width < width) continue;

    // Gerar para cada formato moderno
    for (const format of FORMATS) {
      const outputFilename = `${name}-${sizeName}.${format}`;
      const outputPath = join(OUTPUT_DIR, outputFilename);

      try {
        const result = await sharp(inputPath)
          .resize(width, null, {
            width: width,
            fit: 'inside',
            withoutEnlargement: true,
          })
          [format]({ quality: QUALITY[format] })
          .toFile(outputPath);

        const sizeMB = result.size / 1024 / 1024;
        totalSaved += (await stat(inputPath)).size - result.size;

        console.log(`   ✅ ${sizeName} (${format}): ${width}px → ${sizeMB.toFixed(2)}MB`);
      } catch (error) {
        console.error(`   ❌ Erro ao processar ${outputFilename}:`, error.message);
      }
    }

    // Gerar versão 2x para retina
    if (width <= 1920) {
      const width2x = width * 2;
      
      for (const format of FORMATS) {
        const outputFilename = `${name}-${sizeName}@2x.${format}`;
        const outputPath = join(OUTPUT_DIR, outputFilename);

        try {
          await sharp(inputPath)
            .resize(width2x, null, {
              fit: 'inside',
              withoutEnlargement: true,
            })
            [format]({ quality: QUALITY[format] })
            .toFile(outputPath);

          console.log(`   ✅ ${sizeName}@2x (${format}): ${width2x}px`);
        } catch (error) {
          console.error(`   ❌ Erro @2x:`, error.message);
        }
      }
    }
  }

  console.log(`   💾 Economia total: ${(totalSaved / 1024 / 1024).toFixed(2)}MB`);
}

/**
 * Processa todas as imagens recursivamente
 */
async function processDirectory(dir) {
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      // Pular diretório de output e node_modules
      if (entry.name !== 'optimized' && entry.name !== 'node_modules') {
        await processDirectory(fullPath);
      }
    } else if (entry.isFile() && isImage(entry.name)) {
      await optimizeImage(fullPath, entry.name);
    }
  }
}

/**
 * Função principal
 */
async function main() {
  console.log('🚀 Otimizador Avançado de Imagens - TratorHub\n');
  console.log(`📂 Diretório: ${PUBLIC_DIR}`);
  console.log(`📤 Output: ${OUTPUT_DIR}\n`);

  // Criar diretório de output
  try {
    await mkdir(OUTPUT_DIR, { recursive: true });
  } catch (error) {
    // Diretório já existe
  }

  // Processar todas as imagens
  await processDirectory(PUBLIC_DIR);

  console.log('\n✅ Otimização concluída!');
  console.log('\n📝 Próximos passos:');
  console.log('   1. Substitua as imagens antigas pelas otimizadas');
  console.log('   2. Atualize os componentes para usar <picture> com srcset');
  console.log('   3. Configure o servidor para servir WebP/AVIF quando suportado');
  console.log('   4. Teste no PageSpeed Insights\n');
}

// Executar
main().catch(console.error);
