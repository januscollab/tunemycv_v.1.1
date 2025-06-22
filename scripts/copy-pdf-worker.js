
import { copyFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sourceFile = join(__dirname, '../node_modules/pdfjs-dist/build/pdf.worker.min.js');
const targetDir = join(__dirname, '../public/assets');
const targetFile = join(targetDir, 'pdf.worker.min.js');

try {
  // Ensure target directory exists
  if (!existsSync(targetDir)) {
    mkdirSync(targetDir, { recursive: true });
  }
  
  // Copy the worker file
  copyFileSync(sourceFile, targetFile);
  console.log('PDF.js worker copied successfully');
} catch (error) {
  console.error('Error copying PDF.js worker:', error);
  process.exit(1);
}
