
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import OAuthCallback from '@/components/auth/OAuthCallback';
import SocialAuthButtons from '@/components/auth/SocialAuthButtons';
import AuthForm from '@/components/auth/AuthForm';
import AuthModeSwitch from '@/components/auth/AuthModeSwitch';

type AuthMode = 'login' | 'register' | 'forgot-password';

const Auth = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
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
    if (user && !oauthLoading) {
      navigate('/');
    }
  }, [user, navigate, oauthLoading]);

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

  const isAnyLoading = loading || oauthLoading;

  return (
    <>
      <OAuthCallback onLoadingChange={setOauthLoading} />
      <div className="min-h-screen bg-gradient-to-br from-apple-core/20 via-white to-citrus/10 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <Link to="/" className="inline-flex items-center text-apricot hover:text-apricot/80 mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
            
            {fromAnalyze && (
              <div className="bg-citrus/10 border border-citrus/30 rounded-md p-4 mb-6">
                <div className="text-sm text-blueberry">
                  <strong>Login Required:</strong> You need to sign in to analyze your CV and access personalized insights.
                </div>
              </div>
            )}
            
            <h2 className="text-3xl font-bold text-blueberry">
              {mode === 'login' && 'Welcome back'}
              {mode === 'register' && 'Create your account'}
              {mode === 'forgot-password' && 'Reset your password'}
            </h2>
            <p className="mt-2 text-blueberry/70">
              {mode === 'login' && 'Sign in to your TuneMyCV account'}
              {mode === 'register' && 'Join TuneMyCV and optimize your career'}
              {mode === 'forgot-password' && 'Enter your email to receive reset instructions'}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 border border-apple-core/30">
            {mode !== 'forgot-password' && (
              <SocialAuthButtons isAnyLoading={isAnyLoading} />
            )}

            <AuthForm
              mode={mode}
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleSubmit}
              loading={loading}
              rememberMe={rememberMe}
              setRememberMe={setRememberMe}
              switchMode={switchMode}
            />

            <AuthModeSwitch mode={mode} switchMode={switchMode} />
          </div>
        </div>
      </div>
    </>
  );
};

export default Auth;
