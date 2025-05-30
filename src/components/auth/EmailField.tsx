
import React from 'react';
import { Label } from '@/components/ui/label';
import SecureInput from '@/components/security/SecureInput';

interface EmailFieldProps {
  email: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const EmailField: React.FC<EmailFieldProps> = ({ email, onChange }) => {
  return (
    <div>
      <Label htmlFor="email" className="text-blueberry">
        Email address
      </Label>
      <SecureInput
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={onChange}
        className="mt-1"
        maxLength={254}
        placeholder="Enter your email address"
      />
    </div>
  );
};

export default EmailField;
