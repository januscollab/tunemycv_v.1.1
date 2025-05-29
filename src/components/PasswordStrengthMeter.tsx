
import React from 'react';

interface PasswordStrengthMeterProps {
  password: string;
}

const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password }) => {
  const calculateStrength = (password: string): number => {
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return score;
  };

  const getStrengthText = (score: number): string => {
    if (score === 0) return 'Enter a password';
    if (score <= 2) return 'Weak';
    if (score <= 3) return 'Fair';
    if (score <= 4) return 'Good';
    return 'Strong';
  };

  const getStrengthColor = (score: number): string => {
    if (score === 0) return 'bg-gray-200';
    if (score <= 2) return 'bg-red-500';
    if (score <= 3) return 'bg-yellow-500';
    if (score <= 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const strength = calculateStrength(password);
  const strengthText = getStrengthText(strength);
  const strengthColor = getStrengthColor(strength);

  return (
    <div className="mt-2">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm text-gray-600">Password strength:</span>
        <span className={`text-sm font-medium ${
          strength <= 2 ? 'text-red-600' : 
          strength <= 3 ? 'text-yellow-600' : 
          strength <= 4 ? 'text-blue-600' : 'text-green-600'
        }`}>
          {strengthText}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${strengthColor}`}
          style={{ width: `${(strength / 5) * 100}%` }}
        ></div>
      </div>
      {password && (
        <div className="mt-2 text-xs text-gray-600">
          <p>Password should contain:</p>
          <ul className="list-disc list-inside">
            <li className={password.length >= 8 ? 'text-green-600' : 'text-gray-400'}>
              At least 8 characters
            </li>
            <li className={/[a-z]/.test(password) ? 'text-green-600' : 'text-gray-400'}>
              Lowercase letter
            </li>
            <li className={/[A-Z]/.test(password) ? 'text-green-600' : 'text-gray-400'}>
              Uppercase letter
            </li>
            <li className={/[0-9]/.test(password) ? 'text-green-600' : 'text-gray-400'}>
              Number
            </li>
            <li className={/[^A-Za-z0-9]/.test(password) ? 'text-green-600' : 'text-gray-400'}>
              Special character
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default PasswordStrengthMeter;
