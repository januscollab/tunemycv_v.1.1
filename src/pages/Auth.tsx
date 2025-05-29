import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import PasswordStrengthMeter from '@/components/PasswordStrengthMeter';
import { useToast } from '@/hooks/use-toast';

type AuthMode = 'login' | 'register' | 'forgot-password';

const Auth = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { signIn, signUp, resetPassword, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });

  // Check if user came from analyze page
  const fromAnalyze = location.state?.from === '/analyze';

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const validateForm = () => {
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

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth`
        }
      });
      if (error) throw error;
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast({ title: 'Error', description: 'Invalid email or password', variant: 'destructive' });
          } else {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
          }
        } else {
          toast({ title: 'Success', description: 'Welcome back!' });
          navigate('/');
        }
      } else if (mode === 'register') {
        const { error } = await signUp(formData.email, formData.password, formData.firstName, formData.lastName);
        if (error) {
          if (error.message.includes('User already registered')) {
            toast({ title: 'Error', description: 'An account with this email already exists', variant: 'destructive' });
          } else {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
          }
        } else {
          toast({ 
            title: 'Success', 
            description: 'Account created! Please check your email for verification.' 
          });
          setMode('login');
        }
      } else if (mode === 'forgot-password') {
        const { error } = await resetPassword(formData.email);
        if (error) {
          toast({ title: 'Error', description: error.message, variant: 'destructive' });
        } else {
          toast({ 
            title: 'Success', 
            description: 'Password reset email sent! Check your inbox.' 
          });
          setMode('login');
        }
      }
    } catch (error) {
      toast({ title: 'Error', description: 'An unexpected error occurred', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false
    });
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    resetForm();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          
          {fromAnalyze && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
              <div className="text-sm text-blue-800">
                <strong>Login Required:</strong> You need to sign in to analyze your CV and access personalized insights.
              </div>
            </div>
          )}
          
          <h2 className="text-3xl font-bold text-gray-900">
            {mode === 'login' && 'Welcome back'}
            {mode === 'register' && 'Create your account'}
            {mode === 'forgot-password' && 'Reset your password'}
          </h2>
          <p className="mt-2 text-gray-600">
            {mode === 'login' && 'Sign in to your TuneMyCV account'}
            {mode === 'register' && 'Join TuneMyCV and optimize your career'}
            {mode === 'forgot-password' && 'Enter your email to receive reset instructions'}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Google Sign In Button */}
          {mode !== 'forgot-password' && (
            <div className="mb-6">
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {loading ? 'Signing in...' : `Continue with Google`}
              </button>
              
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with email</span>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {mode === 'register' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="firstName"
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="First name"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="lastName"
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Last name"
                    />
                  </div>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {mode !== 'forgot-password' && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={mode === 'register' ? 'Create a password' : 'Enter your password'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {mode === 'register' && <PasswordStrengthMeter password={formData.password} />}
              </div>
            )}

            {mode === 'register' && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            )}

            {mode === 'login' && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => switchMode('forgot-password')}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {mode === 'register' && (
              <div className="flex items-center">
                <input
                  id="terms"
                  type="checkbox"
                  checked={formData.acceptTerms}
                  onChange={(e) => setFormData({...formData, acceptTerms: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                  I agree to the{' '}
                  <Link to="/terms" className="text-blue-600 hover:text-blue-700">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-blue-600 hover:text-blue-700">
                    Privacy Policy
                  </Link>
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                <>
                  {mode === 'login' && 'Sign In'}
                  {mode === 'register' && 'Create Account'}
                  {mode === 'forgot-password' && 'Send Reset Email'}
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            {mode === 'login' && (
              <p className="text-gray-600">
                Don't have an account?{' '}
                <button onClick={() => switchMode('register')} className="text-blue-600 hover:text-blue-700 font-medium">
                  Sign up here
                </button>
              </p>
            )}
            {mode === 'register' && (
              <p className="text-gray-600">
                Already have an account?{' '}
                <button onClick={() => switchMode('login')} className="text-blue-600 hover:text-blue-700 font-medium">
                  Sign in here
                </button>
              </p>
            )}
            {mode === 'forgot-password' && (
              <p className="text-gray-600">
                Remember your password?{' '}
                <button onClick={() => switchMode('login')} className="text-blue-600 hover:text-blue-700 font-medium">
                  Sign in here
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
