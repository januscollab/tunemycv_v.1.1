
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import PasswordStrengthMeter from '@/components/PasswordStrengthMeter';
import { validatePassword } from '@/utils/passwordValidation';
import { sanitizeText, sanitizeEmail } from '@/utils/inputSanitization';

interface AuthFormProps {
  mode: 'signin' | 'signup';
  onModeChange: (mode: 'signin' | 'signup') => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ mode, onModeChange }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  
  const { signIn, signUp, resetPassword } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Sanitize inputs
    const sanitizedEmail = sanitizeEmail(email);
    const sanitizedFirstName = sanitizeText(firstName);
    const sanitizedLastName = sanitizeText(lastName);

    if (mode === 'signup') {
      // Validate password strength
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        toast({
          title: 'Password Requirements Not Met',
          description: passwordValidation.errors.join('\n'),
          variant: 'destructive',
        });
        return;
      }

      if (password !== confirmPassword) {
        toast({
          title: 'Error',
          description: 'Passwords do not match',
          variant: 'destructive',
        });
        return;
      }

      if (!sanitizedFirstName.trim() || !sanitizedLastName.trim()) {
        toast({
          title: 'Error',
          description: 'First name and last name are required',
          variant: 'destructive',
        });
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === 'signin') {
        const { error } = await signIn(sanitizedEmail, password);
        if (error) throw error;
        navigate('/');
      } else {
        const { error } = await signUp(sanitizedEmail, password, sanitizedFirstName, sanitizedLastName);
        if (error) throw error;
        toast({
          title: 'Success',
          description: 'Please check your email to verify your account',
        });
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast({
        title: 'Error',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const sanitizedEmail = sanitizeEmail(email);
    
    if (!sanitizedEmail) {
      toast({
        title: 'Error',
        description: 'Please enter your email address',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await resetPassword(sanitizedEmail);
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Password reset email sent. Please check your inbox.',
      });
      setShowResetForm(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send reset email',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (showResetForm) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Reset Password</h2>
          <p className="text-gray-600 mt-2">Enter your email to receive a reset link</p>
        </div>
        
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1"
              maxLength={254}
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Email'}
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => setShowResetForm(false)}
          >
            Back to Sign In
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">
          {mode === 'signin' ? 'Sign In' : 'Create Account'}
        </h2>
        <p className="text-gray-600 mt-2">
          {mode === 'signin' 
            ? 'Welcome back! Please sign in to your account.' 
            : 'Join us today and start optimizing your CV.'
          }
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'signup' && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="mt-1"
                  maxLength={50}
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="mt-1"
                  maxLength={50}
                />
              </div>
            </div>
          </>
        )}

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1"
            maxLength={254}
          />
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1"
            maxLength={128}
          />
          {mode === 'signup' && password && (
            <div className="mt-2">
              <PasswordStrengthMeter password={password} />
            </div>
          )}
        </div>

        {mode === 'signup' && (
          <div>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="mt-1"
              maxLength={128}
            />
          </div>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Processing...' : (mode === 'signin' ? 'Sign In' : 'Create Account')}
        </Button>

        {mode === 'signin' && (
          <Button
            type="button"
            variant="ghost"
            className="w-full text-sm"
            onClick={() => setShowResetForm(true)}
          >
            Forgot your password?
          </Button>
        )}
      </form>

      <div className="text-center">
        <button
          type="button"
          onClick={() => onModeChange(mode === 'signin' ? 'signup' : 'signin')}
          className="text-sm text-blue-600 hover:text-blue-500"
        >
          {mode === 'signin' 
            ? "Don't have an account? Sign up" 
            : 'Already have an account? Sign in'
          }
        </button>
      </div>
    </div>
  );
};

export default AuthForm;
