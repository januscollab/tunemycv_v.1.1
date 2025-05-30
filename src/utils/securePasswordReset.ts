
import { supabase } from '@/integrations/supabase/client';

interface PasswordResetOptions {
  email: string;
  allowedDomains?: string[];
}

export const securePasswordReset = async ({ email, allowedDomains }: PasswordResetOptions) => {
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Invalid email format');
  }

  // Generate secure redirect URL
  const baseUrl = window.location.origin;
  const redirectUrl = `${baseUrl}/auth?mode=reset-password`;

  // Validate redirect domain if allowedDomains is provided
  if (allowedDomains && allowedDomains.length > 0) {
    const url = new URL(redirectUrl);
    const isAllowedDomain = allowedDomains.some(domain => 
      url.hostname === domain || url.hostname.endsWith(`.${domain}`)
    );
    
    if (!isAllowedDomain) {
      throw new Error('Invalid redirect domain');
    }
  }

  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectUrl
  });

  return { data, error };
};
