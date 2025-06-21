
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Ensure React is available globally
if (typeof window !== 'undefined') {
  (window as any).React = React;
}

// Configure react-pdf worker with better error handling
const configurePDFWorker = () => {
  try {
    // Dynamic import to avoid module resolution issues
    import('pdfjs-dist').then((pdfjs) => {
      pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.min.js',
        import.meta.url,
      ).toString();
    }).catch((error) => {
      console.warn('PDF.js worker configuration failed:', error);
    });
  } catch (error) {
    console.warn('PDF.js not available:', error);
  }
};

configurePDFWorker();

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
