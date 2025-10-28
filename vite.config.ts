import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    // Minificar e otimizar para produção
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs em produção
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'], // Remove funções específicas
      },
      format: {
        comments: false, // Remove comentários
      },
    },
    // Dividir código em chunks menores para melhor cache
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'supabase': ['@supabase/supabase-js'],
          'icons': ['lucide-react'],
          'analytics': ['@vercel/analytics', '@vercel/speed-insights'],
          'helmet': ['react-helmet-async'],
        },
      },
      treeshake: {
        moduleSideEffects: false, // Assume que módulos não têm efeitos colaterais
        preset: 'recommended',
      },
    },
    // Aumentar limite de aviso para chunks grandes
    chunkSizeWarningLimit: 1000,
    // Gerar sourcemaps apenas para debug
    sourcemap: false,
    // Otimizar CSS
    cssCodeSplit: true,
    cssMinify: true,
  },
  server: {
    // Otimizações para desenvolvimento
    hmr: {
      overlay: false, // Desabilitar overlay de erros (pode ser lento)
    },
  },
});
