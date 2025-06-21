
import React from 'react';
import { createRoot } from 'react-dom/client';
import { pdfjs } from 'react-pdf';
import App from './App.tsx';
import './index.css';

// Configure react-pdf worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url,
).toString();

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
