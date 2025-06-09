
import React from 'react';
import { FloatingLabelInput } from '@/components/common/FloatingLabelInput';

interface EmailFieldProps {
  email: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const EmailField: React.FC<EmailFieldProps> = ({ email, onChange }) => {
  return (
    <FloatingLabelInput
      id="email"
      name="email"
      type="email"
      label="Email address"
      autoComplete="email"
      required
      value={email}
      onChange={onChange}
      maxLength={254}
    />
  );
};

export default EmailField;
