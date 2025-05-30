
import React from 'react';
import FormDivider from './FormDivider';
import NameFields from './NameFields';
import EmailField from './EmailField';
import PasswordFields from './PasswordFields';
import LoginOptions from './LoginOptions';
import TermsAcceptance from './TermsAcceptance';
import AuthSubmitButton from './AuthSubmitButton';

type AuthMode = 'login' | 'register' | 'forgot-password';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

interface AuthFormProps {
  mode: AuthMode;
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  rememberMe: boolean;
  setRememberMe: React.Dispatch<React.SetStateAction<boolean>>;
  switchMode: (mode: AuthMode) => void;
}

const AuthForm: React.FC<AuthFormProps> = ({
  mode,
  formData,
  setFormData,
  onSubmit,
  loading,
  rememberMe,
  setRememberMe,
  switchMode
}) => {
  const handleInputChange = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = field === 'acceptTerms' ? e.target.checked : e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="mt-8">
      <FormDivider />

      <form className="mt-6 space-y-6" onSubmit={onSubmit}>
        {mode === 'register' && (
          <NameFields
            firstName={formData.firstName}
            lastName={formData.lastName}
            onFirstNameChange={handleInputChange('firstName')}
            onLastNameChange={handleInputChange('lastName')}
          />
        )}

        <EmailField
          email={formData.email}
          onChange={handleInputChange('email')}
        />

        <PasswordFields
          mode={mode}
          password={formData.password}
          confirmPassword={formData.confirmPassword}
          onPasswordChange={handleInputChange('password')}
          onConfirmPasswordChange={handleInputChange('confirmPassword')}
        />

        {mode === 'login' && (
          <LoginOptions
            rememberMe={rememberMe}
            setRememberMe={setRememberMe}
            switchMode={switchMode}
          />
        )}

        {mode === 'register' && (
          <TermsAcceptance
            acceptTerms={formData.acceptTerms}
            setFormData={setFormData}
          />
        )}

        <AuthSubmitButton mode={mode} loading={loading} />
      </form>
    </div>
  );
};

export default AuthForm;
