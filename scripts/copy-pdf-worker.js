
import { writeFileSync, mkdirSync, existsSync, readFileSync, statSync } from 'fs';
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

// Check if existing file is a placeholder
const isPlaceholderFile = (filePath: string) => {
  if (!existsSync(filePath)) return false;
  
  try {
    const content = readFileSync(filePath, 'utf8');
    const stats = statSync(filePath);
    
    // Check for placeholder indicators
    const hasPlaceholderComment = content.includes('PDF.js worker placeholder');
    const hasPlaceholderWarning = content.includes('actual worker not loaded');
    const isTooSmall = stats.size < 10000; // Real worker should be ~500KB+
    
    return hasPlaceholderComment || hasPlaceholderWarning || isTooSmall;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log('Error reading existing file:', errorMessage);
    return true; // Treat as placeholder if we can't read it
  }
};

try {
  // Create assets directory if it doesn't exist
  if (!existsSync(assetsDir)) {
    mkdirSync(assetsDir, { recursive: true });
    console.log('✅ Created public/assets directory');
  }

  // Check if worker file exists and is valid
  if (existsSync(targetFile)) {
    if (isPlaceholderFile(targetFile)) {
      console.log('🔄 Found placeholder file, downloading real worker...');
    } else {
      const stats = statSync(targetFile);
      console.log(`✅ Valid PDF.js worker already exists (${Math.round(stats.size / 1024)}KB)`);
      console.log('🎉 PDF.js worker setup complete!');
      process.exit(0);
    }
  }

  console.log('📥 Downloading PDF.js worker from CDN...');
  
  // Download the worker file
  const response = await fetch(workerUrl);
  
  if (!response.ok) {
    throw new Error(`Failed to download worker: ${response.status} ${response.statusText}`);
  }
  
  const workerContent = await response.text();
  
  // Validate downloaded content
  if (workerContent.length < 10000) {
    throw new Error('Downloaded content appears to be too small for a valid worker');
  }
  
  if (workerContent.includes('PDF.js worker placeholder')) {
    throw new Error('Downloaded content appears to be a placeholder, not the real worker');
  }
  
  // Save the worker file
  writeFileSync(targetFile, workerContent, 'utf8');
  console.log('✅ PDF.js worker downloaded and saved successfully');
  
  // Verify the file
  if (existsSync(targetFile)) {
    const stats = statSync(targetFile);
    console.log(`✅ Worker file verified: ${Math.round(stats.size / 1024)}KB`);
    console.log('🎉 PDF.js worker setup complete!');
  } else {
    console.error('❌ Failed to verify downloaded worker file');
    process.exit(1);
  }
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error('❌ Error downloading PDF worker:', errorMessage);
  console.error('💡 This might be due to network issues. The app will fall back to iframe viewing.');
  // Don't exit with error - let the app handle fallback
  process.exit(0);
}
