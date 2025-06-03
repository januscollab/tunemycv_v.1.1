
import React from 'react';
import { Button } from '@/components/ui/button';

type AuthMode = 'login' | 'register' | 'forgot-password';

interface AuthSubmitButtonProps {
  mode: AuthMode;
  loading: boolean;
}

const AuthSubmitButton: React.FC<AuthSubmitButtonProps> = ({ mode, loading }) => {
  const getButtonText = () => {
    if (loading) return 'Processing...';
    
    switch (mode) {
      case 'login':
        return 'Sign in';
      case 'register':
        return 'Create account';
      case 'forgot-password':
        return 'Send reset email';
      default:
        return 'Submit';
    }
  };

  return (
    <div>
      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-zapier-orange hover:bg-zapier-orange/90 text-white"
      >
        {getButtonText()}
      </Button>
    </div>
  );
};

export default AuthSubmitButton;
