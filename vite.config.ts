
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
    include: ['pdfjs-dist', '@react-pdf-viewer/core']
  },
  // Configure asset handling
  publicDir: 'public'
}));
