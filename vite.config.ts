
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: ['react-pdf', 'pdfjs-dist']
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-pdf': ['react-pdf'],
          'pdfjs': ['pdfjs-dist']
        }
      }
    },
    assetsDir: 'assets',
    copyPublicDir: true
  },
  // Ensure PDF.js worker files are properly handled
  assetsInclude: ['**/*.worker.js', '**/*.worker.min.js'],
  // Add worker support
  worker: {
    format: 'es'
  },
  // Copy PDF.js worker to the correct location
  define: {
    'process.env.NODE_ENV': JSON.stringify(mode)
  }
}));
