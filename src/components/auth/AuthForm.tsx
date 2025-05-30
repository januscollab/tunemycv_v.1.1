
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import PasswordStrengthMeter from '@/components/PasswordStrengthMeter';
import { sanitizeText, sanitizeEmail } from '@/utils/inputSanitization';

type AuthMode = 'login' | 'register' | 'forgot-password';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

interface AuthFormProps {
  mode: AuthMode;
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  rememberMe: boolean;
  setRememberMe: React.Dispatch<React.SetStateAction<boolean>>;
  switchMode: (mode: AuthMode) => void;
}

const AuthForm: React.FC<AuthFormProps> = ({
  mode,
  formData,
  setFormData,
  onSubmit,
  loading,
  rememberMe,
  setRememberMe,
  switchMode
}) => {
  const handleInputChange = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = field === 'acceptTerms' ? e.target.checked : e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="mt-8">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with email</span>
        </div>
      </div>

      <form className="mt-6 space-y-6" onSubmit={onSubmit}>
        {mode === 'register' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName" className="text-blueberry">
                First name
              </Label>
              <Input
                id="firstName"
                name="firstName"
                type="text"
                required
                value={formData.firstName}
                onChange={handleInputChange('firstName')}
                className="mt-1"
                maxLength={50}
              />
            </div>
            <div>
              <Label htmlFor="lastName" className="text-blueberry">
                Last name
              </Label>
              <Input
                id="lastName"
                name="lastName"
                type="text"
                required
                value={formData.lastName}
                onChange={handleInputChange('lastName')}
                className="mt-1"
                maxLength={50}
              />
            </div>
          </div>
        )}

        <div>
          <Label htmlFor="email" className="text-blueberry">
            Email address
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={formData.email}
            onChange={handleInputChange('email')}
            className="mt-1"
            maxLength={254}
          />
        </div>

        {mode !== 'forgot-password' && (
          <div>
            <Label htmlFor="password" className="text-blueberry">
              Password
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              required
              value={formData.password}
              onChange={handleInputChange('password')}
              className="mt-1"
              maxLength={128}
            />
            {mode === 'register' && formData.password && (
              <div className="mt-2">
                <PasswordStrengthMeter password={formData.password} />
              </div>
            )}
          </div>
        )}

        {mode === 'register' && (
          <div>
            <Label htmlFor="confirmPassword" className="text-blueberry">
              Confirm password
            </Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              value={formData.confirmPassword}
              onChange={handleInputChange('confirmPassword')}
              className="mt-1"
              maxLength={128}
            />
          </div>
        )}

        {mode === 'login' && (
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Checkbox
                id="remember-me"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked === true)}
              />
              <Label htmlFor="remember-me" className="ml-2 text-sm text-blueberry">
                Remember me
              </Label>
            </div>
            <button
              type="button"
              onClick={() => switchMode('forgot-password')}
              className="text-sm text-apricot hover:text-apricot/80"
            >
              Forgot password?
            </button>
          </div>
        )}

        {mode === 'register' && (
          <div className="flex items-center">
            <Checkbox
              id="accept-terms"
              checked={formData.acceptTerms}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, acceptTerms: checked === true }))
              }
              required
            />
            <Label htmlFor="accept-terms" className="ml-2 text-sm text-blueberry">
              I agree to the{' '}
              <a href="/terms" className="text-apricot hover:text-apricot/80">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy" className="text-apricot hover:text-apricot/80">
                Privacy Policy
              </a>
            </Label>
          </div>
        )}

        <div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-apricot hover:bg-apricot/90 text-white"
          >
            {loading ? (
              'Processing...'
            ) : (
              <>
                {mode === 'login' && 'Sign in'}
                {mode === 'register' && 'Create account'}
                {mode === 'forgot-password' && 'Send reset email'}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AuthForm;
