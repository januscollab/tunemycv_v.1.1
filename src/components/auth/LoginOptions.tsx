
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

type AuthMode = 'login' | 'register' | 'forgot-password';

interface LoginOptionsProps {
  rememberMe: boolean;
  setRememberMe: React.Dispatch<React.SetStateAction<boolean>>;
  switchMode: (mode: AuthMode) => void;
}

const LoginOptions: React.FC<LoginOptionsProps> = ({
  rememberMe,
  setRememberMe,
  switchMode
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <Checkbox
          id="remember-me"
          checked={rememberMe}
          onCheckedChange={(checked) => setRememberMe(checked === true)}
        />
        <Label htmlFor="remember-me" className="ml-2 text-caption text-blueberry">
          Remember me
        </Label>
      </div>
      <button
        type="button"
        onClick={() => switchMode('forgot-password')}
        className="text-caption text-apricot hover:text-apricot/80"
      >
        Forgot password?
      </button>
    </div>
  );
};

export default LoginOptions;
