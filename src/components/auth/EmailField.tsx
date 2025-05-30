
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
      <Input
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={onChange}
        className="mt-1"
        maxLength={254}
      />
    </div>
  );
};

export default EmailField;
