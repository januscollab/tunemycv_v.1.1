
import React from 'react';
import { FloatingLabelInput } from '@/components/common/FloatingLabelInput';

interface NameFieldsProps {
  firstName: string;
  lastName: string;
  onFirstNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLastNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const NameFields: React.FC<NameFieldsProps> = ({
  firstName,
  lastName,
  onFirstNameChange,
  onLastNameChange
}) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <FloatingLabelInput
        id="firstName"
        name="firstName"
        type="text"
        label="First name"
        required
        value={firstName}
        onChange={onFirstNameChange}
        maxLength={50}
      />
      <FloatingLabelInput
        id="lastName"
        name="lastName"
        type="text"
        label="Last name"
        required
        value={lastName}
        onChange={onLastNameChange}
        maxLength={50}
      />
    </div>
  );
};

export default NameFields;
