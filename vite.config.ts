
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
      },
      external: (id) => {
        // Don't externalize the worker, let it be bundled
        return false;
      }
    },
    assetsDir: 'assets',
    // Ensure PDF.js worker files are copied to the build output
    copyPublicDir: true
  },
  // Add specific handling for PDF.js worker files
  assetsInclude: ['**/*.worker.js', '**/*.worker.min.js']
}));
