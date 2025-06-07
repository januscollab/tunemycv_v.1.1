
import React from 'react';
import { UnifiedInput } from '@/components/ui/unified-input';
import { Label } from '@/components/ui/label';

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
      <div>
        <Label htmlFor="firstName" className="text-blueberry">
          First name
        </Label>
        <UnifiedInput
          id="firstName"
          name="firstName"
          type="text"
          required
          value={firstName}
          onChange={onFirstNameChange}
          className="mt-1"
          maxLength={50}
          secure={true}
        />
      </div>
      <div>
        <Label htmlFor="lastName" className="text-blueberry">
          Last name
        </Label>
        <UnifiedInput
          id="lastName"
          name="lastName"
          type="text"
          required
          value={lastName}
          onChange={onLastNameChange}
          className="mt-1"
          maxLength={50}
          secure={true}
        />
      </div>
    </div>
  );
};

export default NameFields;
