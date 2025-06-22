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
  build: {
    assetsDir: 'assets',
    copyPublicDir: true,
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          // Keep PDF worker files with predictable names
          if (assetInfo.name?.includes('pdf.worker')) {
            return 'assets/pdf.worker.min.js';
          }
          return 'assets/[name]-[hash][extname]';
        }
      }
    }
  },
  // Add worker support for general use
  worker: {
    format: 'es'
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(mode)
  },
  // Optimize PDF.js dependencies
  optimizeDeps: {
    include: ['pdfjs-dist']
  },
  // Ensure PDF.js worker is available in development
  publicDir: 'public',
  // Configure asset handling for PDF.js
  assetsInclude: ['**/*.worker.js', '**/*.worker.min.js']
}));
