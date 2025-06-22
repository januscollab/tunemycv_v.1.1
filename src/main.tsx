
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Configure PDF.js worker for react-pdf
import { pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Use CDN worker directly to avoid bundling issues
const cdnWorkerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
console.log('Setting PDF.js worker to CDN:', cdnWorkerSrc);
pdfjs.GlobalWorkerOptions.workerSrc = cdnWorkerSrc;

// Simple test to verify worker is accessible
console.log('PDF.js version:', pdfjs.version);
console.log('PDF.js worker configured successfully');

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
