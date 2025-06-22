
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Configure PDF.js worker for react-pdf
import { pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Set up PDF.js worker with detailed logging
const workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url,
).toString();

console.log('PDF.js worker source:', workerSrc);
pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

// Test worker loading
pdfjs.getDocument({ data: new Uint8Array([37, 80, 68, 70]) }).promise.catch((error) => {
  console.error('PDF.js worker test failed:', error);
}).then(() => {
  console.log('PDF.js worker loaded successfully');
});

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
