
import { useToast } from '@/hooks/use-toast';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

type AuthMode = 'login' | 'register' | 'forgot-password';

export const useAuthValidation = () => {
  const { toast } = useToast();

  const validateForm = (formData: FormData, mode: AuthMode) => {
    if (mode === 'register') {
      if (!formData.firstName.trim()) {
        toast({ title: 'Error', description: 'First name is required', variant: 'destructive' });
        return false;
      }
      if (!formData.lastName.trim()) {
        toast({ title: 'Error', description: 'Last name is required', variant: 'destructive' });
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        toast({ title: 'Error', description: 'Passwords do not match', variant: 'destructive' });
        return false;
      }
      if (!formData.acceptTerms) {
        toast({ title: 'Error', description: 'You must accept the terms of service', variant: 'destructive' });
        return false;
      }
    }
    
    if (!formData.email.trim()) {
      toast({ title: 'Error', description: 'Email is required', variant: 'destructive' });
      return false;
    }
    
    if (mode !== 'forgot-password' && !formData.password.trim()) {
      toast({ title: 'Error', description: 'Password is required', variant: 'destructive' });
      return false;
    }

    return true;
  };

  return { validateForm };
};
