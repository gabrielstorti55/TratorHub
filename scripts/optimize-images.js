#!/usr/bin/env node

/**
 * Script de Otimização Automática de Imagens
 * 
 * Converte imagens JPEG/PNG para WebP com compressão
 * Gera versões otimizadas mantendo os originais
 * 
 * Uso: npm run optimize-images
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Configurações
const CONFIG = {
  inputDir: './public',
  outputDir: './public/optimized',
  quality: 80, // Qualidade WebP (1-100)
  maxWidth: 1920, // Largura máxima
  formats: ['.jpg', '.jpeg', '.png'],
  skipDirs: ['optimized', 'node_modules']
};

// Criar diretório de saída se não existir
if (!fs.existsSync(CONFIG.outputDir)) {
  fs.mkdirSync(CONFIG.outputDir, { recursive: true });
  console.log(`✅ Diretório criado: ${CONFIG.outputDir}`);
}

/**
 * Processa uma imagem e gera versão WebP otimizada
 */
async function processImage(inputPath, outputPath) {
  try {
    const stats = fs.statSync(inputPath);
    const originalSize = (stats.size / 1024).toFixed(2);

    // Converter para WebP
    await sharp(inputPath)
      .resize(CONFIG.maxWidth, null, {
        withoutEnlargement: true,
        fit: 'inside'
      })
      .webp({ quality: CONFIG.quality })
      .toFile(outputPath);

    const newStats = fs.statSync(outputPath);
    const newSize = (newStats.size / 1024).toFixed(2);
    const savings = ((1 - newSize / originalSize) * 100).toFixed(1);

    console.log(`✅ ${path.basename(inputPath)}`);
    console.log(`   ${originalSize}KB → ${newSize}KB (${savings}% menor)`);
    
    return { original: originalSize, optimized: newSize, savings };
  } catch (error) {
    console.error(`❌ Erro ao processar ${inputPath}:`, error.message);
    return null;
  }
}

/**
 * Busca recursivamente todas as imagens
 */
function findImages(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (!CONFIG.skipDirs.includes(file)) {
        findImages(filePath, fileList);
      }
    } else {
      const ext = path.extname(file).toLowerCase();
      if (CONFIG.formats.includes(ext)) {
        fileList.push(filePath);
      }
    }
  });

  return fileList;
}

/**
 * Função principal
 */
async function main() {
  console.log('🖼️  Iniciando otimização de imagens...\n');
  console.log(`📁 Diretório: ${CONFIG.inputDir}`);
  console.log(`💾 Saída: ${CONFIG.outputDir}`);
  console.log(`⚙️  Qualidade WebP: ${CONFIG.quality}%`);
  console.log(`📐 Largura máxima: ${CONFIG.maxWidth}px\n`);

  const images = findImages(CONFIG.inputDir);
  
  if (images.length === 0) {
    console.log('⚠️  Nenhuma imagem encontrada para otimizar.');
    return;
  }

  console.log(`📸 ${images.length} imagens encontradas\n`);

  let totalOriginal = 0;
  let totalOptimized = 0;
  let processedCount = 0;

  for (const imagePath of images) {
    const relativePath = path.relative(CONFIG.inputDir, imagePath);
    const outputPath = path.join(
      CONFIG.outputDir, 
      relativePath.replace(path.extname(relativePath), '.webp')
    );

    // Criar subdiretórios se necessário
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const result = await processImage(imagePath, outputPath);
    
    if (result) {
      totalOriginal += parseFloat(result.original);
      totalOptimized += parseFloat(result.optimized);
      processedCount++;
    }
  }

  const totalSavings = ((1 - totalOptimized / totalOriginal) * 100).toFixed(1);

  console.log('\n📊 RESUMO:');
  console.log(`✅ ${processedCount}/${images.length} imagens processadas`);
  console.log(`💾 Tamanho original: ${totalOriginal.toFixed(2)}KB`);
  console.log(`💾 Tamanho otimizado: ${totalOptimized.toFixed(2)}KB`);
  console.log(`🚀 Economia total: ${totalSavings}%`);
  console.log(`💰 ${(totalOriginal - totalOptimized).toFixed(2)}KB economizados\n`);
}

// Executar
main().catch(console.error);
