
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useSecureAuth } from './useSecureAuth';
import { useSecureFormValidation } from './useSecureFormValidation';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

type AuthMode = 'login' | 'register' | 'forgot-password';

export const useAuthSubmit = (mode: AuthMode, formData: FormData, setMode: (mode: AuthMode) => void) => {
  const [loading, setLoading] = useState(false);
  const { secureSignIn, secureSignUp, securePasswordReset } = useSecureAuth();
  const { validateForm } = useSecureFormValidation();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate and sanitize form data
    const validation = validateForm(formData, mode);
    if (!validation.isValid || !validation.sanitizedData) {
      return;
    }

    const sanitizedData = validation.sanitizedData;
    setLoading(true);

    try {
      if (mode === 'login') {
        const result = await secureSignIn(sanitizedData.email!, formData.password);
        if (result.success) {
          navigate('/');
        }
      } else if (mode === 'register') {
        const result = await secureSignUp(
          sanitizedData.email!, 
          formData.password, 
          sanitizedData.firstName!, 
          sanitizedData.lastName!
        );
        if (result.success) {
          setMode('login');
        }
      } else if (mode === 'forgot-password') {
        const result = await securePasswordReset(sanitizedData.email!);
        if (result.success) {
          setMode('login');
        }
      }
    } catch (error) {
      console.error('Authentication error:', error);
      toast({ 
        title: 'Error', 
        description: 'An unexpected error occurred. Please try again.', 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  return { handleSubmit, loading };
};
