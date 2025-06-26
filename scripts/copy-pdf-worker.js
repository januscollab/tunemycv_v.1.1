
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const projectRoot = join(__dirname, '..');
const assetsDir = join(projectRoot, 'public/assets');
const targetFile = join(assetsDir, 'pdf.worker.min.js');

// PDF.js worker URL from CDN
const workerUrl = 'https://unpkg.com/pdfjs-dist@5.3.31/build/pdf.worker.min.js';

console.log('🔧 Starting PDF.js worker download process...');
console.log('Source:', workerUrl);
console.log('Target:', targetFile);

try {
  // Create assets directory if it doesn't exist
  if (!existsSync(assetsDir)) {
    mkdirSync(assetsDir, { recursive: true });
    console.log('✅ Created public/assets directory');
  }

  // Check if worker file already exists
  if (existsSync(targetFile)) {
    console.log('✅ PDF.js worker already exists locally');
    console.log('🎉 PDF.js worker setup complete!');
    process.exit(0);
  }

  console.log('📥 Downloading PDF.js worker from CDN...');
  
  // Download the worker file
  const response = await fetch(workerUrl);
  
  if (!response.ok) {
    throw new Error(`Failed to download worker: ${response.status} ${response.statusText}`);
  }
  
  const workerContent = await response.text();
  
  // Save the worker file
  writeFileSync(targetFile, workerContent, 'utf8');
  console.log('✅ PDF.js worker downloaded and saved successfully');
  
  // Verify the file
  if (existsSync(targetFile)) {
    console.log('✅ Worker file verified at target location');
    console.log('🎉 PDF.js worker setup complete!');
  } else {
    console.error('❌ Failed to verify downloaded worker file');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Error downloading PDF worker:', error.message);
  console.error('💡 This might be due to network issues. The app will fall back to iframe viewing.');
  // Don't exit with error - let the app handle fallback
  process.exit(0);
}
