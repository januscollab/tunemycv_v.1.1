
import React from 'react';
import { Input } from '@/components/ui/input';
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
        <Input
          id="firstName"
          name="firstName"
          type="text"
          required
          value={firstName}
          onChange={onFirstNameChange}
          className="mt-1"
          maxLength={50}
        />
      </div>
      <div>
        <Label htmlFor="lastName" className="text-blueberry">
          Last name
        </Label>
        <Input
          id="lastName"
          name="lastName"
          type="text"
          required
          value={lastName}
          onChange={onLastNameChange}
          className="mt-1"
          maxLength={50}
        />
      </div>
    </div>
  );
};

export default NameFields;
