
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
      external: [],
      output: {
        // Ensure worker files are properly handled
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.includes('pdf.worker')) {
            return 'assets/pdf.worker-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        }
      }
    }
  },
  // Enhanced worker support for PDF.js
  worker: {
    format: 'es',
    plugins: () => [react()]
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(mode)
  },
  // Optimize PDF.js dependencies
  optimizeDeps: {
    include: ['pdfjs-dist', '@react-pdf-viewer/core'],
    exclude: ['pdfjs-dist/build/pdf.worker.min.js']
  },
  // Configure asset handling
  publicDir: 'public',
  // Ensure PDF.js worker can be imported
  assetsInclude: ['**/*.worker.js', '**/*.worker.min.js']
}));
