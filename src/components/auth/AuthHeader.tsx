
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
        return 'Sign In';
      case 'register':
        return 'Create your account';
      case 'forgot-password':
        return 'Reset your password';
      default:
        return 'Sign In';
    }
  };

  const getSubtitle = () => {
    switch (mode) {
      case 'login':
        return (
          <>
            Sign in to your <span className="text-zapier-orange">Tune</span>MyCV account
          </>
        );
      case 'register':
        return (
          <>
            Join <span className="text-zapier-orange">Tune</span>MyCV and optimize your career
          </>
        );
      case 'forgot-password':
        return 'Enter your email to receive reset instructions';
      default:
        return 'Sign in to your TuneMyCV account';
    }
  };

  return (
    <div className="text-center">
      
      {fromAnalyze && (
        <div className="bg-cream dark:bg-surface border border-cream dark:border-border rounded-lg p-4 mb-8">
          <div className="text-caption text-earth dark:text-white">
            <strong>Login Required:</strong> You need to sign in to analyze your CV and access personalized insights.
          </div>
        </div>
      )}
      
      {mode !== 'login' && (
        <h2 className="text-display font-bold text-foreground">
          {getTitle()}
        </h2>
      )}
      <p className="mt-3 text-earth/70 dark:text-white/70 font-normal text-subheading">
        {getSubtitle()}
      </p>
    </div>
  );
};

export default AuthHeader;
