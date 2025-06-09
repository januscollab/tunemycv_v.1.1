import { useState } from 'react';
import { validateFileSecurely, createSecureFileObject } from '@/utils/secureFileValidation';
import { useToast } from '@/hooks/use-toast';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedName?: string;
  secureFile?: File;
}

export const useFileValidation = () => {
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();

  const validateFile = async (file: File, fileType: 'cv' | 'job_description'): Promise<ValidationResult> => {
    setIsValidating(true);
    
    try {
      // Perform security validation
      const validation = validateFileSecurely(file, fileType);
      
      if (!validation.isValid) {
        toast({
          title: "File validation failed",
          description: validation.errors[0],
          variant: "destructive"
        });
        
        return {
          isValid: false,
          errors: validation.errors
        };
      }
      
      // Create secure file object with sanitized name
      const secureFile = createSecureFileObject(file, validation.sanitizedName!);
      
      return {
        isValid: true,
        errors: [],
        sanitizedName: validation.sanitizedName,
        secureFile
      };
      
    } finally {
      setIsValidating(false);
    }
  };

  return {
    isValidating,
    validateFile
  };
};