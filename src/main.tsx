
import React from 'react';
import { createRoot } from 'react-dom/client';
import { pdfjs } from 'react-pdf';
import App from './App.tsx';
import './index.css';

// Configure react-pdf to disable worker to avoid CSP issues
// This forces react-pdf to use canvas rendering instead of web workers
pdfjs.GlobalWorkerOptions.workerSrc = false;

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
