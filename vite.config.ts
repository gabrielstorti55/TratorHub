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
    // Dividir código em chunks menores
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'supabase': ['@supabase/supabase-js'],
          'icons': ['lucide-react'],
        },
      },
    },
    // Aumentar limite de aviso para chunks grandes
    chunkSizeWarningLimit: 1000,
  },
  server: {
    // Otimizações para desenvolvimento
    hmr: {
      overlay: false, // Desabilitar overlay de erros (pode ser lento)
    },
  },
});
