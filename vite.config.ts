import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { copyFileSync } from "fs";

// https://vitejs.dev/config/
export default defineConfig(({ mode, command }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
    // Copy PDF.js worker to public directory during build and dev
    {
      name: 'copy-pdf-worker',
      buildStart() {
        try {
          copyFileSync(
            path.join(__dirname, 'node_modules/pdfjs-dist/build/pdf.worker.min.js'),
            path.join(__dirname, 'public/pdf.worker.min.js')
          );
          console.log('PDF.js worker copied to public directory');
        } catch (error) {
          console.warn('Failed to copy PDF.js worker:', error);
        }
      }
    }
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
