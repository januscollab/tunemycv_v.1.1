
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

export const extractTextFromFile = async (file: File): Promise<string> => {
  if (file.type === 'application/pdf') {
    try {
      console.log(`Extracting text from PDF: ${file.name}`);
      
      // Import pdf-parse dynamically
      const pdfParse = await import('pdf-parse');
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      const pdfData = await pdfParse.default(uint8Array);
      const extractedText = pdfData.text;
      
      if (!extractedText || extractedText.trim().length === 0) {
        throw new Error('No text content could be extracted from the PDF');
      }
      
      console.log(`Successfully extracted ${extractedText.split(/\s+/).length} words from ${file.name}`);
      return extractedText.trim();
      
    } catch (error) {
      console.error('PDF extraction error:', error);
      throw new Error(`Failed to extract text from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    try {
      console.log(`Extracting text from DOCX: ${file.name}`);
      
      // Import mammoth dynamically
      const mammoth = await import('mammoth');
      const arrayBuffer = await file.arrayBuffer();
      
      const result = await mammoth.extractRawText({ arrayBuffer });
      const extractedText = result.value;
      
      if (!extractedText || extractedText.trim().length === 0) {
        throw new Error('No text content could be extracted from the DOCX');
      }
      
      console.log(`Successfully extracted ${extractedText.split(/\s+/).length} words from ${file.name}`);
      return extractedText.trim();
      
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
          const content = reader.result as string;
          // Basic content validation
          if (content.length === 0) {
            reject(new Error('File appears to be empty'));
            return;
          }
          if (content.length > 500000) { // 500KB text limit to match edge function
            reject(new Error('Text content too large'));
            return;
          }
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
