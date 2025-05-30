
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

type AuthMode = 'login' | 'register' | 'forgot-password';

interface AuthHeaderProps {
  mode: AuthMode;
  fromAnalyze: boolean;
}

const AuthHeader: React.FC<AuthHeaderProps> = ({ mode, fromAnalyze }) => {
  const getTitle = () => {
    switch (mode) {
      case 'login':
        return 'Welcome back';
      case 'register':
        return 'Create your account';
      case 'forgot-password':
        return 'Reset your password';
      default:
        return 'Welcome back';
    }
  };

  const getSubtitle = () => {
    switch (mode) {
      case 'login':
        return 'Sign in to your TuneMyCV account';
      case 'register':
        return 'Join TuneMyCV and optimize your career';
      case 'forgot-password':
        return 'Enter your email to receive reset instructions';
      default:
        return 'Sign in to your TuneMyCV account';
    }
  };

  return (
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
        {getTitle()}
      </h2>
      <p className="mt-2 text-blueberry/70">
        {getSubtitle()}
      </p>
    </div>
  );
};

export default AuthHeader;
