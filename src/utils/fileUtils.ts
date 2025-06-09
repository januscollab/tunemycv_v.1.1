
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

// Enhanced text formatting cleanup that enforces JSON formatting rules
const cleanExtractedText = (text: string): string => {
  return text
    // Fix smart quotes but preserve formatting
    .replace(/[""]/g, '"')
    .replace(/['']/g, "'")
    // First pass: normalize line breaks and preserve document structure
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Normalize ALL bullet points to "-" as per JSON formatting rules
    .replace(/^[\s]*[•·‐−–—*]\s+/gm, '- ')
    .replace(/[•·‐−–—*]/g, '-')
    // Remove italics, underlines, and other unsupported formatting
    .replace(/[_*~`]+/g, '')
    // Remove font information (single font type rule)
    .replace(/font-family:[^;]+;?/gi, '')
    .replace(/font-size:[^;]+;?/gi, '')
    .replace(/font-weight:[^;]+;?/gi, '')
    // Preserve section breaks and headers
    .split('\n')
    .map(line => {
      const trimmedLine = line.trim();
      // Detect section headers (all caps lines or lines ending with colon)
      if (trimmedLine.length > 2 && 
          (trimmedLine === trimmedLine.toUpperCase() || trimmedLine.endsWith(':'))) {
        return '\n' + trimmedLine + '\n';
      }
      // Preserve indentation for list items
      if (trimmedLine.startsWith('-')) {
        return trimmedLine;
      }
      // Regular content - preserve but clean
      return trimmedLine;
    })
    .join('\n')
    // Clean up excessive blank lines but preserve section spacing
    .replace(/\n{4,}/g, '\n\n\n')
    .replace(/\n{2,}(\n[A-Z][A-Z\s:]+\n)/g, '\n\n$1')
    // Clean up excessive spaces within lines (keep max 2 spaces)
    .replace(/ {3,}/g, '  ')
    // Remove any remaining complex formatting
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/\{[^}]*\}/g, '') // Remove style blocks
    // Final cleanup - ensure proper line spacing
    .replace(/^\n+/, '') // Remove leading newlines
    .replace(/\n+$/, '') // Remove trailing newlines
    .trim();
};

export const extractTextFromFile = async (file: File, signal?: AbortSignal): Promise<string> => {
  if (file.type === 'application/pdf') {
    try {
      console.log(`Extracting text from PDF using Adobe PDF Services: ${file.name}`);
      
      // Check for cancellation before starting
      if (signal?.aborted) {
        throw new Error('Processing cancelled by user');
      }

      // Use Adobe PDF Services API for all PDF extraction
      const { supabase } = await import('@/integrations/supabase/client');
      
      // Convert file to base64 for Adobe processing
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // Convert to base64 in chunks to avoid stack overflow for large files
      let binaryString = '';
      const chunkSize = 8192; // Process in 8KB chunks
      for (let i = 0; i < uint8Array.length; i += chunkSize) {
        const chunk = uint8Array.slice(i, i + chunkSize);
        binaryString += String.fromCharCode(...chunk);
      }
      const base64String = btoa(binaryString);
      
      console.log('Processing PDF with Adobe PDF Services...');
      
      const { data, error: adobeError } = await supabase.functions.invoke('adobe-pdf-extract', {
        body: {
          fileData: base64String,
          fileName: file.name,
          fileSize: file.size
        }
      });
      
      if (adobeError) {
        console.error('Adobe PDF Services error:', adobeError);
        // Pass through user-friendly error messages from the Adobe API
        throw new Error(adobeError.message || 'PDF processing service temporarily unavailable. Please try again.');
      }
      
      if (!data?.success) {
        // Use the user-friendly error message from the Adobe API if available
        const errorMessage = data?.error || 'PDF processing encountered an issue. Please try again or use a different file format.';
        throw new Error(errorMessage);
      }
      
      console.log(`Adobe PDF extraction successful: ${data.wordCount} words extracted in ${data.processingTime}ms`);
      return cleanExtractedText(data.extractedText);
      
    } catch (error) {
      console.error('Adobe PDF extraction failed:', error);
      
      if (error instanceof Error) {
        // Check for specific error patterns and provide helpful messages
        if (error.message.includes('Monthly usage limit exceeded') || error.message.includes('PDF processing limit reached')) {
          throw new Error('PDF processing limit reached for this month. Please try again next month or contact support.');
        }
        if (error.message.includes('Adobe API credentials not configured') || error.message.includes('not properly configured')) {
          throw new Error('PDF processing service is temporarily unavailable. Please contact support.');
        }
        if (error.message.includes('not enabled') || error.message.includes('temporarily unavailable')) {
          throw new Error('PDF processing service is temporarily unavailable. Please try again in a few minutes.');
        }
        if (error.message.includes('bucketId is required') || error.message.includes('storage')) {
          throw new Error('File processing encountered a storage issue. Please try again or contact support if the problem persists.');
        }
        if (error.message.includes('password-protected')) {
          throw new Error('This PDF appears to be password-protected. Please remove the password and try again.');
        }
        if (error.message.includes('corrupted')) {
          throw new Error('This PDF file appears to be corrupted. Please try uploading a different file.');
        }
        if (error.message.includes('complex formatting') || error.message.includes('difficult to process')) {
          throw new Error('PDF processing encountered an issue. PDFs can sometimes be difficult to process due to their complex formatting. We recommend trying a Word document (.docx) or plain text file (.txt) for best results.');
        }
        
        // If it's already a user-friendly message from the Adobe API, pass it through
        if (error.message && !error.message.includes('Adobe') && !error.message.includes('API')) {
          throw error;
        }
      }
      
      // Fallback to a generic but helpful error message
      throw new Error('PDF processing encountered an issue. We recommend trying a Word document (.docx) or plain text file (.txt) for best results.');
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
