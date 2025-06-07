
import React from 'react';
import { UnifiedInput } from '@/components/ui/unified-input';
import { Label } from '@/components/ui/label';
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
        <Label htmlFor="password" className="text-blueberry">
          Password
        </Label>
        <UnifiedInput
          id="password"
          name="password"
          type="password"
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          required
          value={password}
          onChange={onPasswordChange}
          className="mt-1"
          maxLength={128}
          secure={true}
        />
        {mode === 'register' && password && (
          <div className="mt-2">
            <PasswordStrengthMeter password={password} />
          </div>
        )}
      </div>

      {mode === 'register' && (
        <div>
          <Label htmlFor="confirmPassword" className="text-blueberry">
            Confirm password
          </Label>
          <UnifiedInput
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={onConfirmPasswordChange}
            className="mt-1"
            maxLength={128}
            secure={true}
          />
        </div>
      )}
    </>
  );
};

export default PasswordFields;
