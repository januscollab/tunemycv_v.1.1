
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
      <Link to="/" className="inline-flex items-center text-zapier-orange hover:text-zapier-orange/80 mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Home
      </Link>
      
      {fromAnalyze && (
        <div className="bg-cream dark:bg-surface border border-cream dark:border-border rounded-lg p-4 mb-8">
          <div className="text-sm text-earth dark:text-white">
            <strong>Login Required:</strong> You need to sign in to analyze your CV and access personalized insights.
          </div>
        </div>
      )}
      
      <h2 className="text-4xl font-bold text-earth dark:text-white">
        {getTitle()}
      </h2>
      <p className="mt-3 text-earth/70 dark:text-white/70 font-normal text-lg">
        {getSubtitle()}
      </p>
    </div>
  );
};

export default AuthHeader;
