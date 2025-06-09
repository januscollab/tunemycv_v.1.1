
import React from 'react';
import { FloatingLabelInput } from '@/components/common/FloatingLabelInput';
import PasswordStrengthMeter from '@/components/PasswordStrengthMeter';

type AuthMode = 'login' | 'register' | 'forgot-password';

interface PasswordFieldsProps {
  mode: AuthMode;
  password: string;
  confirmPassword: string;
  onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onConfirmPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const PasswordFields: React.FC<PasswordFieldsProps> = ({
  mode,
  password,
  confirmPassword,
  onPasswordChange,
  onConfirmPasswordChange
}) => {
  if (mode === 'forgot-password') return null;

  return (
    <>
      <div>
        <FloatingLabelInput
          id="password"
          name="password"
          type="password"
          label="Password"
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          required
          value={password}
          onChange={onPasswordChange}
          maxLength={128}
        />
        {mode === 'register' && password && (
          <div className="mt-2">
            <PasswordStrengthMeter password={password} />
          </div>
        )}
      </div>

      {mode === 'register' && (
        <FloatingLabelInput
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          label="Confirm password"
          autoComplete="new-password"
          required
          value={confirmPassword}
          onChange={onConfirmPasswordChange}
          maxLength={128}
        />
      )}
    </>
  );
};

export default PasswordFields;
