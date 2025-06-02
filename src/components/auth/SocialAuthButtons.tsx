
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SocialAuthButtonsProps {
  isAnyLoading: boolean;
}

const SocialAuthButtons: React.FC<SocialAuthButtonsProps> = ({ isAnyLoading }) => {
  const [googleLoading, setGoogleLoading] = useState(false);
  const [linkedinLoading, setLinkedinLoading] = useState(false);
  const { toast } = useToast();

  const getRedirectUrl = () => {
    const origin = window.location.origin;
    console.log('Current origin:', origin);
    
    // Handle production domains
    if (origin.includes('tunemycv.com')) {
      return 'https://www.tunemycv.com/auth';
    }
    
    // Handle Lovable preview domains (both .lovable.app and .lovableproject.com)
    if (origin.includes('.lovable.app') || origin.includes('.lovableproject.com')) {
      return `${origin}/auth`;
    }
    
    // Handle localhost and other development environments
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return `${origin}/auth`;
    }
    
    // Default fallback
    return `${origin}/auth`;
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const redirectUrl = getRedirectUrl();
      console.log('Google OAuth redirect URL:', redirectUrl);
      console.log('Current domain:', window.location.hostname);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });
      
      if (error) {
        console.error('Google OAuth error:', error);
        
        // Provide specific error messages for common issues
        if (error.message?.includes('refused to connect') || error.message?.includes('X-Frame-Options')) {
          toast({ 
            title: 'Configuration Error', 
            description: 'Google OAuth is not configured for this domain. Please check the Google Cloud Console configuration.', 
            variant: 'destructive' 
          });
        } else {
          toast({ 
            title: 'Error', 
            description: error.message || 'Failed to sign in with Google', 
            variant: 'destructive' 
          });
        }
        throw error;
      }
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      
      // Only show toast if we haven't already shown one
      if (!error.message?.includes('refused to connect')) {
        toast({ 
          title: 'Error', 
          description: 'Failed to initiate Google sign-in. Please try again or contact support.', 
          variant: 'destructive' 
        });
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleLinkedInSignIn = async () => {
    setLinkedinLoading(true);
    try {
      const redirectUrl = getRedirectUrl();
      console.log('LinkedIn OAuth redirect URL:', redirectUrl);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'linkedin_oidc',
        options: {
          redirectTo: redirectUrl
        }
      });
      
      if (error) {
        console.error('LinkedIn OAuth error:', error);
        toast({ 
          title: 'Error', 
          description: error.message || 'Failed to sign in with LinkedIn', 
          variant: 'destructive' 
        });
        throw error;
      }
    } catch (error: any) {
      console.error('LinkedIn sign-in error:', error);
      toast({ 
        title: 'Error', 
        description: 'Failed to initiate LinkedIn sign-in. Please try again.', 
        variant: 'destructive' 
      });
    } finally {
      setLinkedinLoading(false);
    }
  };

  return (
    <div className="mb-6 space-y-3">
      {/* Development notice for OAuth configuration */}
      {(window.location.hostname.includes('lovableproject.com') || window.location.hostname.includes('lovable.app')) && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> If Google sign-in doesn't work, the current domain needs to be added to your Google Cloud Console OAuth configuration.
          </p>
        </div>
      )}

      {/* Google Sign In Button */}
      <button
        onClick={handleGoogleSignIn}
        disabled={isAnyLoading}
        className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        {googleLoading ? 'Signing in...' : 'Continue with Google'}
      </button>

      {/* LinkedIn Sign In Button */}
      <button
        onClick={handleLinkedInSignIn}
        disabled={isAnyLoading}
        className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-white bg-[#0077B5] hover:bg-[#006399] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
        {linkedinLoading ? 'Signing in...' : 'Continue with LinkedIn'}
      </button>
      
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with email</span>
        </div>
      </div>
    </div>
  );
};

export default SocialAuthButtons;
