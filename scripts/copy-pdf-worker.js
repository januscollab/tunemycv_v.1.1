
import { copyFileSync, mkdirSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const projectRoot = join(__dirname, '..');
const sourceFile = join(projectRoot, 'node_modules/pdfjs-dist/build/pdf.worker.min.js');
const assetsDir = join(projectRoot, 'public/assets');
const targetFile = join(assetsDir, 'pdf.worker.min.js');

console.log('🔧 Starting PDF.js worker copy process...');
console.log('Source:', sourceFile);
console.log('Target:', targetFile);

try {
  // Create assets directory if it doesn't exist
  if (!existsSync(assetsDir)) {
    mkdirSync(assetsDir, { recursive: true });
    console.log('✅ Created public/assets directory');
  }

  // Check if source file exists
  if (!existsSync(sourceFile)) {
    console.error('❌ Source PDF worker file not found at:', sourceFile);
    console.error('Make sure pdfjs-dist is installed: npm install pdfjs-dist');
    process.exit(1);
  }

  // Copy the worker file
  copyFileSync(sourceFile, targetFile);
  console.log('✅ PDF.js worker copied successfully to public/assets/pdf.worker.min.js');
  
  // Verify the copy
  if (existsSync(targetFile)) {
    console.log('✅ Worker file verified at target location');
    console.log('🎉 PDF.js worker setup complete!');
  } else {
    console.error('❌ Failed to verify copied worker file');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Error copying PDF worker:', error.message);
  process.exit(1);
}
