
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
  // For PDF and DOCX files, use the Supabase edge function
  if (file.type === 'application/pdf' || 
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      // Create FormData for the edge function
      const formData = new FormData();
      formData.append('file', file);
      
      console.log(`Extracting text from ${file.type} file: ${file.name}`);
      
      const { data, error } = await supabase.functions.invoke('extract-document-text', {
        body: formData,
      });
      
      if (error) {
        console.error('Edge function error:', error);
        throw new Error(`Failed to extract text: ${error.message}`);
      }
      
      if (!data || !data.success) {
        throw new Error(data?.error || 'Text extraction failed');
      }
      
      const extractedText = data.extractedText;
      console.log(`Successfully extracted ${data.metadata?.wordCount || 0} words from ${file.name}`);
      
      return extractedText;
      
    } catch (error) {
      console.error('Text extraction error:', error);
      // Fallback to placeholder if extraction fails
      const fallbackContent = `[Text extraction from ${file.name} failed]\n\nPlease ensure the file is not corrupted and try again. Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
      return fallbackContent;
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
