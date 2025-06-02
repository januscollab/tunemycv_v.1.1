
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from 'lucide-react';
import SocialAuthButtons from './SocialAuthButtons';
import AuthForm from './AuthForm';
import AuthModeSwitch from './AuthModeSwitch';
import { useAuthForm } from '@/hooks/useAuthForm';
import { useAuthSubmit } from '@/hooks/useAuthSubmit';

type AuthMode = 'login' | 'register' | 'forgot-password';

interface EmbeddedAuthProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

const EmbeddedAuth: React.FC<EmbeddedAuthProps> = ({ title, description, icon }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [rememberMe, setRememberMe] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  
  const { formData, setFormData, resetForm } = useAuthForm();
  const { handleSubmit, loading } = useAuthSubmit(mode, formData, setMode);

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    resetForm();
  };

  const isAnyLoading = loading || oauthLoading;

  return (
    <Card className="max-w-sm w-full border border-border">
      <CardHeader className="py-4 px-6">
        <CardTitle className="flex items-center justify-center text-xl font-bold">
          {icon || <User className="h-5 w-5 text-zapier-orange mr-2" />}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 px-6 pb-6">
        <p className="text-earth/70 text-center text-sm font-normal mb-4">
          {description}
        </p>
        
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
      </CardContent>
    </Card>
  );
};

export default EmbeddedAuth;
