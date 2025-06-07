
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

interface TermsAcceptanceProps {
  acceptTerms: boolean;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}

const TermsAcceptance: React.FC<TermsAcceptanceProps> = ({
  acceptTerms,
  setFormData
}) => {
  return (
    <div className="flex items-center">
      <Checkbox
        id="accept-terms"
        checked={acceptTerms}
        onCheckedChange={(checked) => 
          setFormData(prev => ({ ...prev, acceptTerms: checked === true }))
        }
        required
      />
      <Label htmlFor="accept-terms" className="ml-2 text-caption text-blueberry">
        I agree to the{' '}
        <a href="/terms" className="text-apricot hover:text-apricot/80">
          Terms of Service
        </a>{' '}
        and{' '}
        <a href="/privacy" className="text-apricot hover:text-apricot/80">
          Privacy Policy
        </a>
      </Label>
    </div>
  );
};

export default TermsAcceptance;
