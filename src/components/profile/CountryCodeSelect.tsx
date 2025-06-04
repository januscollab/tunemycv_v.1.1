import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CountryCodeSelectProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const COUNTRY_CODES = [
  { code: '+1', country: 'US/CA', name: 'United States / Canada' },
  { code: '+44', country: 'GB', name: 'United Kingdom' },
  { code: '+33', country: 'FR', name: 'France' },
  { code: '+49', country: 'DE', name: 'Germany' },
  { code: '+39', country: 'IT', name: 'Italy' },
  { code: '+34', country: 'ES', name: 'Spain' },
  { code: '+31', country: 'NL', name: 'Netherlands' },
  { code: '+32', country: 'BE', name: 'Belgium' },
  { code: '+41', country: 'CH', name: 'Switzerland' },
  { code: '+43', country: 'AT', name: 'Austria' },
  { code: '+45', country: 'DK', name: 'Denmark' },
  { code: '+46', country: 'SE', name: 'Sweden' },
  { code: '+47', country: 'NO', name: 'Norway' },
  { code: '+358', country: 'FI', name: 'Finland' },
  { code: '+353', country: 'IE', name: 'Ireland' },
  { code: '+351', country: 'PT', name: 'Portugal' },
  { code: '+30', country: 'GR', name: 'Greece' },
  { code: '+48', country: 'PL', name: 'Poland' },
  { code: '+420', country: 'CZ', name: 'Czech Republic' },
  { code: '+36', country: 'HU', name: 'Hungary' },
  { code: '+91', country: 'IN', name: 'India' },
  { code: '+86', country: 'CN', name: 'China' },
  { code: '+81', country: 'JP', name: 'Japan' },
  { code: '+82', country: 'KR', name: 'South Korea' },
  { code: '+65', country: 'SG', name: 'Singapore' },
  { code: '+61', country: 'AU', name: 'Australia' },
  { code: '+64', country: 'NZ', name: 'New Zealand' },
  { code: '+27', country: 'ZA', name: 'South Africa' },
  { code: '+52', country: 'MX', name: 'Mexico' },
  { code: '+55', country: 'BR', name: 'Brazil' },
  { code: '+54', country: 'AR', name: 'Argentina' },
  { code: '+56', country: 'CL', name: 'Chile' },
  { code: '+57', country: 'CO', name: 'Colombia' },
  { code: '+51', country: 'PE', name: 'Peru' },
];

const CountryCodeSelect: React.FC<CountryCodeSelectProps> = ({ value, onChange, className }) => {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder="Select country code" />
      </SelectTrigger>
      <SelectContent>
        {COUNTRY_CODES.map((country) => (
          <SelectItem key={country.code} value={country.code}>
            <span className="flex items-center">
              <span className="font-mono text-sm mr-2">{country.code}</span>
              <span className="text-xs text-gray-500">{country.country}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default CountryCodeSelect;