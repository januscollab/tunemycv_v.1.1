
import React from 'react';
import { validatePassword } from '@/utils/passwordValidation';

interface PasswordStrengthMeterProps {
  password: string;
}

const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password }) => {
  const validation = validatePassword(password);
  
  const getStrengthColor = () => {
    switch (validation.strength) {
      case 'weak':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'strong':
        return 'bg-green-500';
      default:
        return 'bg-gray-300';
    }
  };

  const getStrengthWidth = () => {
    switch (validation.strength) {
      case 'weak':
        return 'w-1/3';
      case 'medium':
        return 'w-2/3';
      case 'strong':
        return 'w-full';
      default:
        return 'w-0';
    }
  };

  const getStrengthText = () => {
    if (!password) return '';
    switch (validation.strength) {
      case 'weak':
        return 'Weak';
      case 'medium':
        return 'Medium';
      case 'strong':
        return 'Strong';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-2">
      {password && (
        <>
          <div className="flex items-center space-x-2">
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${getStrengthColor()} ${getStrengthWidth()}`}
              />
            </div>
            <span className={`text-sm font-medium ${
              validation.strength === 'weak' ? 'text-red-600' :
              validation.strength === 'medium' ? 'text-yellow-600' :
              'text-green-600'
            }`}>
              {getStrengthText()}
            </span>
          </div>
          
          {validation.errors.length > 0 && (
            <div className="space-y-1">
              {validation.errors.map((error, index) => (
                <p key={index} className="text-xs text-red-600 flex items-center">
                  <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                  {error}
                </p>
              ))}
            </div>
          )}
          
          {validation.isValid && (
            <p className="text-xs text-green-600 flex items-center">
              <span className="w-1 h-1 bg-green-600 rounded-full mr-2"></span>
              Password meets all requirements
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default PasswordStrengthMeter;
