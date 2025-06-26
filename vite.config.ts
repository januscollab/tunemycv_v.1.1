
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { copyFileSync, mkdirSync, existsSync } from 'fs';

// Plugin to copy PDF.js worker
const copyPdfWorkerPlugin = () => ({
  name: 'copy-pdf-worker',
  buildStart() {
    const sourceFile = path.resolve(__dirname, 'node_modules/pdfjs-dist/build/pdf.worker.min.js');
    const assetsDir = path.resolve(__dirname, 'public/assets');
    const targetFile = path.resolve(assetsDir, 'pdf.worker.min.js');

    try {
      if (!existsSync(assetsDir)) {
        mkdirSync(assetsDir, { recursive: true });
      }
      
      if (existsSync(sourceFile)) {
        copyFileSync(sourceFile, targetFile);
        console.log('✅ PDF.js worker copied automatically');
      }
    } catch (error) {
      console.warn('⚠️ Could not copy PDF.js worker:', error.message);
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
    copyPdfWorkerPlugin(),
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
