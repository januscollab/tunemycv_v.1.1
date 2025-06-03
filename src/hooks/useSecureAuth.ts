
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { loginRateLimiter, passwordResetRateLimiter, formatLockoutTime } from '@/utils/rateLimiting';
import { sanitizeEmail } from '@/utils/inputSanitization';

interface SecureAuthResult {
  success: boolean;
  error?: string;
  requiresDelay?: number;
}

export const useSecureAuth = () => {
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, resetPassword } = useAuth();
  const { toast } = useToast();

  const secureSignIn = async (email: string, password: string): Promise<SecureAuthResult> => {
    const sanitizedEmail = sanitizeEmail(email);
    const identifier = sanitizedEmail;

    // Check rate limiting
    if (loginRateLimiter.isRateLimited(identifier)) {
      const remainingTime = loginRateLimiter.getRemainingLockoutTime(identifier);
      const message = `Too many failed attempts. Try again in ${formatLockoutTime(remainingTime)}.`;
      toast({ title: 'Login Blocked', description: message, variant: 'destructive' });
      return { success: false, error: message, requiresDelay: remainingTime };
    }

    setLoading(true);
    try {
      const { error } = await signIn(sanitizedEmail, password);
      
      if (error) {
        console.error('Sign in error:', error);
        // Record failed attempt
        loginRateLimiter.recordAttempt(identifier);
        
        // Generic error message to prevent user enumeration
        const genericMessage = 'Invalid email or password. Please check your credentials and try again.';
        toast({ title: 'Login Failed', description: genericMessage, variant: 'destructive' });
        return { success: false, error: genericMessage };
      }

      // Reset rate limiting on successful login
      loginRateLimiter.reset(identifier);
      toast({ title: 'Success', description: 'Welcome back!' });
      return { success: true };
    } catch (error) {
      console.error('Unexpected sign in error:', error);
      loginRateLimiter.recordAttempt(identifier);
      const message = 'An unexpected error occurred. Please try again.';
      toast({ title: 'Error', description: message, variant: 'destructive' });
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const secureSignUp = async (email: string, password: string, firstName: string, lastName: string): Promise<SecureAuthResult> => {
    const sanitizedEmail = sanitizeEmail(email);
    
    setLoading(true);
    try {
      const { error } = await signUp(sanitizedEmail, password, firstName, lastName);
      
      if (error) {
        console.error('Sign up error:', error);
        if (error.message.includes('User already registered')) {
          toast({ title: 'Account Exists', description: 'An account with this email already exists. Try signing in instead.', variant: 'destructive' });
        } else {
          toast({ title: 'Registration Failed', description: 'Unable to create account. Please try again.', variant: 'destructive' });
        }
        return { success: false, error: 'Registration failed' };
      }

      toast({ title: 'Success', description: 'Account created! Please check your email for verification.' });
      return { success: true };
    } catch (error) {
      console.error('Unexpected sign up error:', error);
      const message = 'An unexpected error occurred during registration.';
      toast({ title: 'Error', description: message, variant: 'destructive' });
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const securePasswordReset = async (email: string): Promise<SecureAuthResult> => {
    const sanitizedEmail = sanitizeEmail(email);
    const identifier = sanitizedEmail;

    // Check rate limiting for password reset
    if (passwordResetRateLimiter.isRateLimited(identifier)) {
      const remainingTime = passwordResetRateLimiter.getRemainingLockoutTime(identifier);
      const message = `Too many reset attempts. Try again in ${formatLockoutTime(remainingTime)}.`;
      toast({ title: 'Reset Blocked', description: message, variant: 'destructive' });
      return { success: false, error: message, requiresDelay: remainingTime };
    }

    setLoading(true);
    try {
      passwordResetRateLimiter.recordAttempt(identifier);
      const { error } = await resetPassword(sanitizedEmail);
      
      if (error) {
        console.error('Password reset error:', error);
        // Don't reveal whether email exists or not
        const message = 'If an account with this email exists, you will receive a password reset link.';
        toast({ title: 'Reset Requested', description: message });
        return { success: true }; // Return success regardless
      }

      toast({ title: 'Reset Requested', description: 'If an account with this email exists, you will receive a password reset link.' });
      return { success: true };
    } catch (error) {
      console.error('Unexpected password reset error:', error);
      const message = 'Unable to process password reset request.';
      toast({ title: 'Error', description: message, variant: 'destructive' });
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  return {
    secureSignIn,
    secureSignUp,
    securePasswordReset,
    loading
  };
};
