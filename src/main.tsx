
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Configure PDF.js worker for react-pdf
import { pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Set up PDF.js worker with CDN fallback for better compatibility
const setupPDFWorker = () => {
  try {
    // Try to use the bundled worker first
    const workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.js',
      import.meta.url,
    ).toString();
    
    console.log('Attempting to use bundled PDF.js worker:', workerSrc);
    pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
    
    // Test if the worker loads
    return pdfjs.getDocument({ data: new Uint8Array([37, 80, 68, 70]) }).promise
      .then(() => {
        console.log('PDF.js bundled worker loaded successfully');
        return true;
      })
      .catch((error) => {
        console.warn('Bundled PDF.js worker failed, trying CDN fallback:', error);
        // Fallback to CDN worker
        const cdnWorkerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
        console.log('Using CDN PDF.js worker:', cdnWorkerSrc);
        pdfjs.GlobalWorkerOptions.workerSrc = cdnWorkerSrc;
        
        // Test CDN worker
        return pdfjs.getDocument({ data: new Uint8Array([37, 80, 68, 70]) }).promise
          .then(() => {
            console.log('PDF.js CDN worker loaded successfully');
            return true;
          })
          .catch((cdnError) => {
            console.error('Both PDF.js workers failed:', cdnError);
            return false;
          });
      });
  } catch (error) {
    console.error('PDF.js worker setup failed:', error);
    return Promise.resolve(false);
  }
};

// Initialize PDF worker
setupPDFWorker();

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
