
import { useToast } from '@/hooks/use-toast';
import { sanitizeEmail, sanitizeText } from '@/utils/inputSanitization';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

type AuthMode = 'login' | 'register' | 'forgot-password';

export const useSecureFormValidation = () => {
  const { toast } = useToast();

  const validateForm = (formData: FormData, mode: AuthMode): { isValid: boolean; sanitizedData?: Partial<FormData> } => {
    const sanitizedData: Partial<FormData> = {};

    // Email validation and sanitization
    if (!formData.email.trim()) {
      toast({ title: 'Validation Error', description: 'Email is required', variant: 'destructive' });
      return { isValid: false };
    }

    const sanitizedEmail = sanitizeEmail(formData.email);
    if (!sanitizedEmail || !isValidEmail(sanitizedEmail)) {
      toast({ title: 'Validation Error', description: 'Please enter a valid email address', variant: 'destructive' });
      return { isValid: false };
    }
    sanitizedData.email = sanitizedEmail;

    // Password validation for non-forgot-password modes
    if (mode !== 'forgot-password') {
      if (!formData.password.trim()) {
        toast({ title: 'Validation Error', description: 'Password is required', variant: 'destructive' });
        return { isValid: false };
      }

      if (formData.password.length < 8) {
        toast({ title: 'Validation Error', description: 'Password must be at least 8 characters long', variant: 'destructive' });
        return { isValid: false };
      }

      // Check for basic password complexity
      if (!hasPasswordComplexity(formData.password)) {
        toast({ 
          title: 'Validation Error', 
          description: 'Password must contain at least one uppercase letter, one lowercase letter, and one number', 
          variant: 'destructive' 
        });
        return { isValid: false };
      }

      sanitizedData.password = formData.password; // Don't sanitize passwords
    }

    // Registration-specific validation
    if (mode === 'register') {
      // Name validation
      if (!formData.firstName.trim()) {
        toast({ title: 'Validation Error', description: 'First name is required', variant: 'destructive' });
        return { isValid: false };
      }

      if (!formData.lastName.trim()) {
        toast({ title: 'Validation Error', description: 'Last name is required', variant: 'destructive' });
        return { isValid: false };
      }

      // Sanitize names
      const sanitizedFirstName = sanitizeText(formData.firstName).trim();
      const sanitizedLastName = sanitizeText(formData.lastName).trim();

      if (sanitizedFirstName.length < 1 || sanitizedFirstName.length > 50) {
        toast({ title: 'Validation Error', description: 'First name must be between 1 and 50 characters', variant: 'destructive' });
        return { isValid: false };
      }

      if (sanitizedLastName.length < 1 || sanitizedLastName.length > 50) {
        toast({ title: 'Validation Error', description: 'Last name must be between 1 and 50 characters', variant: 'destructive' });
        return { isValid: false };
      }

      sanitizedData.firstName = sanitizedFirstName;
      sanitizedData.lastName = sanitizedLastName;

      // Password confirmation
      if (formData.password !== formData.confirmPassword) {
        toast({ title: 'Validation Error', description: 'Passwords do not match', variant: 'destructive' });
        return { isValid: false };
      }

      // Terms acceptance
      if (!formData.acceptTerms) {
        toast({ title: 'Validation Error', description: 'You must accept the terms of service', variant: 'destructive' });
        return { isValid: false };
      }

      sanitizedData.acceptTerms = formData.acceptTerms;
    }

    return { isValid: true, sanitizedData };
  };

  return { validateForm };
};

// Helper functions
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254; // RFC 5321 limit
};

const hasPasswordComplexity = (password: string): boolean => {
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  return hasUppercase && hasLowercase && hasNumber;
};
