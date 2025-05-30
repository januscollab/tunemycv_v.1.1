
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import OAuthCallback from '@/components/auth/OAuthCallback';
import SocialAuthButtons from '@/components/auth/SocialAuthButtons';
import AuthForm from '@/components/auth/AuthForm';
import AuthModeSwitch from '@/components/auth/AuthModeSwitch';
import AuthHeader from '@/components/auth/AuthHeader';
import { useAuthForm } from '@/hooks/useAuthForm';
import { useAuthSubmit } from '@/hooks/useAuthSubmit';

type AuthMode = 'login' | 'register' | 'forgot-password';

const Auth = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [oauthLoading, setOauthLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { formData, setFormData, resetForm } = useAuthForm();
  const { handleSubmit, loading } = useAuthSubmit(mode, formData, setMode);

  // Check if user came from analyze page
  const fromAnalyze = location.state?.from === '/analyze';

  useEffect(() => {
    if (user && !oauthLoading) {
      navigate('/');
    }
  }, [user, navigate, oauthLoading]);

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
          <AuthHeader mode={mode} fromAnalyze={fromAnalyze} />

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
