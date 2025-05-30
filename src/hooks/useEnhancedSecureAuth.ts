
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { loginRateLimiter, passwordResetRateLimiter, formatLockoutTime } from '@/utils/rateLimiting';
import { sanitizeEmail } from '@/utils/inputSanitization';
import { securePasswordReset } from '@/utils/securePasswordReset';
import { logAuthFailure, logRateLimitExceeded } from '@/utils/securityAuditLogger';

interface SecureAuthResult {
  success: boolean;
  error?: string;
  requiresDelay?: number;
}

export const useEnhancedSecureAuth = () => {
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  const secureSignIn = async (email: string, password: string): Promise<SecureAuthResult> => {
    const sanitizedEmail = sanitizeEmail(email);
    const identifier = sanitizedEmail;

    // Check rate limiting
    if (loginRateLimiter.isRateLimited(identifier)) {
      const remainingTime = loginRateLimiter.getRemainingLockoutTime(identifier);
      const message = `Too many failed attempts. Try again in ${formatLockoutTime(remainingTime)}.`;
      
      // Log rate limit exceeded
      logRateLimitExceeded(identifier, 5);
      
      toast({ title: 'Login Blocked', description: message, variant: 'destructive' });
      return { success: false, error: message, requiresDelay: remainingTime };
    }

    setLoading(true);
    try {
      const { error } = await signIn(sanitizedEmail, password);
      
      if (error) {
        // Record failed attempt
        loginRateLimiter.recordAttempt(identifier);
        
        // Log authentication failure
        logAuthFailure(sanitizedEmail, error.message || 'Invalid credentials');
        
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
      loginRateLimiter.recordAttempt(identifier);
      logAuthFailure(sanitizedEmail, 'Unexpected error during authentication');
      
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
        // Log signup failure
        logAuthFailure(sanitizedEmail, error.message || 'Registration failed');
        
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
      logAuthFailure(sanitizedEmail, 'Unexpected error during registration');
      
      const message = 'An unexpected error occurred during registration.';
      toast({ title: 'Error', description: message, variant: 'destructive' });
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const enhancedPasswordReset = async (email: string): Promise<SecureAuthResult> => {
    const sanitizedEmail = sanitizeEmail(email);
    const identifier = sanitizedEmail;

    // Check rate limiting for password reset
    if (passwordResetRateLimiter.isRateLimited(identifier)) {
      const remainingTime = passwordResetRateLimiter.getRemainingLockoutTime(identifier);
      const message = `Too many reset attempts. Try again in ${formatLockoutTime(remainingTime)}.`;
      
      logRateLimitExceeded(identifier, 3);
      
      toast({ title: 'Reset Blocked', description: message, variant: 'destructive' });
      return { success: false, error: message, requiresDelay: remainingTime };
    }

    setLoading(true);
    try {
      passwordResetRateLimiter.recordAttempt(identifier);
      
      // Use enhanced password reset with secure redirect
      const allowedDomains = [window.location.hostname];
      const { error } = await securePasswordReset({ 
        email: sanitizedEmail, 
        allowedDomains 
      });
      
      if (error) {
        // Don't reveal whether email exists or not
        const message = 'If an account with this email exists, you will receive a password reset link.';
        toast({ title: 'Reset Requested', description: message });
        return { success: true }; // Return success regardless
      }

      toast({ title: 'Reset Requested', description: 'If an account with this email exists, you will receive a password reset link.' });
      return { success: true };
    } catch (error) {
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
    enhancedPasswordReset,
    loading
  };
};
