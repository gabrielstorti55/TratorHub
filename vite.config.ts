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
      },
    },
    // Dividir código em chunks menores para melhor cache
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor';
            }
            if (id.includes('@supabase')) {
              return 'supabase';
            }
            if (id.includes('lucide-react')) {
              return 'icons';
            }
            if (id.includes('@vercel')) {
              return 'analytics';
            }
            if (id.includes('react-helmet')) {
              return 'helmet';
            }
            return 'vendor';
          }
        },
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
