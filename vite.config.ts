
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { writeFileSync, mkdirSync, existsSync } from 'fs';

// Plugin to download and setup PDF.js worker
const setupPdfWorkerPlugin = () => ({
  name: 'setup-pdf-worker',
  async buildStart() {
    const assetsDir = path.resolve(__dirname, 'public/assets');
    const targetFile = path.resolve(assetsDir, 'pdf.worker.min.js');
    const workerUrl = 'https://unpkg.com/pdfjs-dist@5.3.31/build/pdf.worker.min.js';

    try {
      // Create assets directory if it doesn't exist
      if (!existsSync(assetsDir)) {
        mkdirSync(assetsDir, { recursive: true });
      }
      
      // Check if worker file already exists
      if (existsSync(targetFile)) {
        console.log('✅ PDF.js worker already available locally');
        return;
      }

      console.log('📥 Downloading PDF.js worker for local serving...');
      
      // Download the worker file
      const response = await fetch(workerUrl);
      
      if (response.ok) {
        const workerContent = await response.text();
        writeFileSync(targetFile, workerContent, 'utf8');
        console.log('✅ PDF.js worker downloaded and ready');
      } else {
        console.warn('⚠️ Could not download PDF.js worker - will use iframe fallback');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.warn('⚠️ Could not setup PDF.js worker:', errorMessage);
      console.warn('💡 App will use iframe fallback for PDF viewing');
    }
  }
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    setupPdfWorkerPlugin(),
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
  },
  // Configure asset handling
  publicDir: 'public',
}));
