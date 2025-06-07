
import { validateFileSecurely, createSecureFileObject } from '@/utils/secureFileValidation';

export const validateFile = (file: File, allowedTypes: string[], maxSize: number) => {
  const errors: string[] = [];
  
  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type ${file.type} is not supported. Please use ${allowedTypes.join(', ')}`);
  }
  
  if (file.size > maxSize) {
    errors.push(`File size exceeds ${Math.round(maxSize / (1024 * 1024))}MB limit`);
  }
  
  return errors;
};

// Enhanced secure file validation
export const validateFileSecure = (file: File, type: 'cv' | 'job_description') => {
  return validateFileSecurely(file, type);
};

// Smart text formatting cleanup that preserves document structure
const cleanExtractedText = (text: string): string => {
  return text
    // Fix smart quotes but preserve formatting
    .replace(/[""]/g, '"')
    .replace(/['']/g, "'")
    // Normalize bullet points while preserving their structure
    .replace(/[•·‐−]/g, '• ')
    .replace(/[–—]/g, '- ')
    // Clean up excessive blank lines (more than 2 consecutive)
    .replace(/\n\s*\n\s*\n\s*\n+/g, '\n\n\n')
    // Remove trailing spaces from lines but preserve line structure
    .split('\n').map(line => line.replace(/\s+$/, '')).join('\n')
    // Clean up excessive spaces within lines (but keep intentional spacing)
    .replace(/ {3,}/g, '  ')
    // Preserve headers and sections by detecting patterns
    .replace(/^([A-Z][A-Z\s]{2,})$/gm, '\n$1\n')
    // Ensure proper spacing around section headers
    .replace(/\n\n\n([A-Z][A-Z\s]{2,})\n\n\n/g, '\n\n$1\n\n')
    .trim();
};

export const extractTextFromFile = async (file: File, signal?: AbortSignal): Promise<string> => {
  if (file.type === 'application/pdf') {
    try {
      console.log(`Extracting text from PDF: ${file.name}`);
      
      // Import pdfjs-dist for better browser compatibility
      const pdfjsLib = await import('pdfjs-dist');
      
      // Set up worker with CDN for better reliability
      if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
        // Use CDN worker for better compatibility
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
        console.log('Using CDN PDF.js worker');
      }
      
      // Check for cancellation before starting
      if (signal?.aborted) {
        throw new Error('Processing cancelled by user');
      }

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let extractedText = '';
      
      // Extract text from all pages with cancellation checks
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        // Check for cancellation before each page
        if (signal?.aborted) {
          throw new Error('Processing cancelled by user');
        }

        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        // Combine text items with proper spacing
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();
          
        if (pageText) {
          extractedText += (extractedText ? '\n\n' : '') + pageText;
        }
      }
      
      if (!extractedText || extractedText.trim().length === 0) {
        throw new Error('No text content could be extracted from the PDF');
      }
      
      // Apply smart formatting cleanup
      extractedText = cleanExtractedText(extractedText);
      
      console.log(`Successfully extracted ${extractedText.split(/\s+/).length} words from ${file.name}`);
      return extractedText;
      
    } catch (error) {
      console.error('Client-side PDF extraction failed, trying server-side fallback:', error);
      
      try {
        // Server-side fallback using Supabase Edge Function
        const { supabase } = await import('@/integrations/supabase/client');
        
        // Convert file to base64 for server processing
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        const base64String = btoa(String.fromCharCode(...uint8Array));
        
        console.log('Attempting server-side PDF extraction...');
        
        const { data, error: serverError } = await supabase.functions.invoke('extract-pdf-text', {
          body: {
            fileData: base64String,
            fileName: file.name
          }
        });
        
        if (serverError) {
          throw new Error(`Server-side extraction failed: ${serverError.message}`);
        }
        
        if (!data?.success) {
          throw new Error(data?.error || 'Server-side extraction returned no data');
        }
        
        console.log(`Server-side extraction successful: ${data.wordCount} words extracted`);
        return cleanExtractedText(data.extractedText);
        
      } catch (serverError) {
        console.error('Server-side PDF extraction also failed:', serverError);
        
        // Final fallback error message
        if (error instanceof Error) {
          if (error.message.includes('worker') || error.message.includes('Worker')) {
            throw new Error('PDF processing failed on both client and server. Please try converting your PDF to a Word document or text file.');
          }
          if (error.message.includes('InvalidPDFException') || error.message.includes('corrupted')) {
            throw new Error('PDF file appears to be corrupted or invalid. Please try a different PDF file.');
          }
          if (error.message.includes('PasswordException')) {
            throw new Error('PDF file is password protected. Please use an unprotected PDF file.');
          }
        }
        
        throw new Error(`Failed to extract text from PDF using both client and server methods. Please try converting to a Word document or text file.`);
      }
    }
  }
  
  if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    try {
      console.log(`Extracting text from DOCX: ${file.name}`);
      
      // Import mammoth dynamically
      const mammoth = await import('mammoth');
      const arrayBuffer = await file.arrayBuffer();
      
      const result = await mammoth.extractRawText({ arrayBuffer });
      let extractedText = result.value;
      
      if (!extractedText || extractedText.trim().length === 0) {
        throw new Error('No text content could be extracted from the DOCX');
      }
      
      // Apply smart formatting cleanup
      extractedText = cleanExtractedText(extractedText);
      
      console.log(`Successfully extracted ${extractedText.split(/\s+/).length} words from ${file.name}`);
      return extractedText;
      
    } catch (error) {
      console.error('DOCX extraction error:', error);
      throw new Error(`Failed to extract text from DOCX: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  // For text files, use the existing file reader approach
  if (file.type === 'text/plain') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        try {
          let content = reader.result as string;
          // Basic content validation
          if (content.length === 0) {
            reject(new Error('File appears to be empty'));
            return;
          }
          if (content.length > 500000) { // 500KB text limit to match edge function
            reject(new Error('Text content too large'));
            return;
          }
          
          // Apply smart formatting cleanup
          content = cleanExtractedText(content);
          
          resolve(content);
        } catch (error) {
          reject(new Error('Failed to process file content'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      // Set a timeout for file reading
      setTimeout(() => {
        reject(new Error('File reading timed out'));
      }, 30000); // 30 second timeout
      
      reader.readAsText(file);
    });
  }
  
  // Unsupported file type
  throw new Error(`Unsupported file type: ${file.type}. Please use PDF, DOCX, or TXT files.`);
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Create secure file object with sanitized name
export const createSecureFile = (file: File, sanitizedName: string): File => {
  return createSecureFileObject(file, sanitizedName);
};
