
import { validateFileSecurely, FileValidationResult } from '@/utils/secureFileValidation';

// Magic number signatures for file type validation
const FILE_SIGNATURES = {
  pdf: [0x25, 0x50, 0x44, 0x46], // %PDF
  docx: [0x50, 0x4B, 0x03, 0x04], // PK (ZIP-based)
  txt: [] // Text files don't have magic numbers
};

interface EnhancedFileValidationResult extends FileValidationResult {
  contentValidation?: {
    magicNumberValid: boolean;
    suspiciousContent: boolean;
  };
}

export const validateFileContent = async (file: File): Promise<boolean> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer;
      if (!arrayBuffer) {
        resolve(false);
        return;
      }

      const bytes = new Uint8Array(arrayBuffer);
      const extension = file.name.split('.').pop()?.toLowerCase();
      
      // Check magic numbers for known file types
      if (extension && FILE_SIGNATURES[extension as keyof typeof FILE_SIGNATURES]) {
        const signature = FILE_SIGNATURES[extension as keyof typeof FILE_SIGNATURES];
        if (signature.length > 0) {
          const matches = signature.every((byte, index) => bytes[index] === byte);
          resolve(matches);
          return;
        }
      }
      
      // For text files or unknown types, check for suspicious content
      const textContent = new TextDecoder('utf-8', { fatal: false }).decode(bytes.slice(0, 1024));
      const suspiciousPatterns = [
        /<script/i,
        /javascript:/i,
        /vbscript:/i,
        /on\w+\s*=/i,
        /%3cscript/i
      ];
      
      const hasSuspiciousContent = suspiciousPatterns.some(pattern => pattern.test(textContent));
      resolve(!hasSuspiciousContent);
    };

    reader.onerror = () => resolve(false);
    
    // Read first 1KB for validation
    reader.readAsArrayBuffer(file.slice(0, 1024));
  });
};

export const enhancedFileValidation = async (
  file: File, 
  type: 'cv' | 'job_description'
): Promise<EnhancedFileValidationResult> => {
  // Run basic validation first
  const basicValidation = validateFileSecurely(file, type);
  
  if (!basicValidation.isValid) {
    return basicValidation;
  }

  // Perform content validation
  const magicNumberValid = await validateFileContent(file);
  
  // Check file size limits more strictly
  const maxContentSize = 50 * 1024; // 50KB text content limit
  let suspiciousContent = false;
  
  if (file.type === 'text/plain' && file.size > maxContentSize) {
    suspiciousContent = true;
    basicValidation.errors.push('Text file content exceeds safe size limit');
  }

  if (!magicNumberValid) {
    basicValidation.errors.push('File content does not match declared file type');
  }

  return {
    ...basicValidation,
    isValid: basicValidation.isValid && magicNumberValid && !suspiciousContent,
    contentValidation: {
      magicNumberValid,
      suspiciousContent
    }
  };
};
