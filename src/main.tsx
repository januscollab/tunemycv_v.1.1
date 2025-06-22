
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Configure PDF.js worker for react-pdf
import { pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Set up PDF.js worker with local bundled worker and CDN fallback
const setupPDFWorker = async () => {
  try {
    // Try to use the bundled worker first
    const workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.js',
      import.meta.url,
    ).toString();
    
    console.log('Attempting to use bundled PDF.js worker:', workerSrc);
    pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
    
    // Test if the worker loads by creating a simple document
    const testDoc = await pdfjs.getDocument({ 
      data: new Uint8Array([37, 80, 68, 70, 45, 49, 46, 52]) // "%PDF-1.4" header
    }).promise;
    
    console.log('PDF.js bundled worker loaded successfully');
    return true;
  } catch (error) {
    console.warn('Bundled PDF.js worker failed, using CDN fallback:', error);
    
    // Fallback to CDN worker
    const cdnWorkerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
    console.log('Using CDN PDF.js worker:', cdnWorkerSrc);
    pdfjs.GlobalWorkerOptions.workerSrc = cdnWorkerSrc;
    
    console.log('PDF.js CDN worker configured');
    return false;
  }
};

// Initialize PDF worker
setupPDFWorker().then((usedLocal) => {
  console.log('PDF.js version:', pdfjs.version);
  console.log('PDF.js worker configured:', usedLocal ? 'local bundled' : 'CDN fallback');
}).catch((error) => {
  console.error('PDF.js worker setup failed:', error);
});

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
