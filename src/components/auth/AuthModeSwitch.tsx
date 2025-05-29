
import React from 'react';

type AuthMode = 'login' | 'register' | 'forgot-password';

interface AuthModeSwitchProps {
  mode: AuthMode;
  switchMode: (mode: AuthMode) => void;
}

const AuthModeSwitch: React.FC<AuthModeSwitchProps> = ({ mode, switchMode }) => {
  return (
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
  );
};

export default AuthModeSwitch;
