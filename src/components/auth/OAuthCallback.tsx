
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface OAuthCallbackProps {
  onLoadingChange: (loading: boolean) => void;
}

const OAuthCallback: React.FC<OAuthCallbackProps> = ({ onLoadingChange }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [oauthLoading, setOauthLoading] = useState(false);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      // Check if we're in an OAuth callback (tokens in URL hash)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      
      if (accessToken && refreshToken) {
        console.log('OAuth callback detected, processing tokens...');
        setOauthLoading(true);
        onLoadingChange(true);
        
        try {
          // Let Supabase handle the session from the URL
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Error getting session from OAuth callback:', error);
            toast({ 
              title: 'Authentication Error', 
              description: 'Failed to complete sign-in. Please try again.', 
              variant: 'destructive' 
            });
          } else if (data.session) {
            console.log('OAuth session established successfully');
            toast({ 
              title: 'Success', 
              description: 'Successfully signed in!' 
            });
            
            // Clean up the URL by removing the hash
            window.history.replaceState({}, document.title, window.location.pathname);
            
            // Redirect to home page
            navigate('/');
          }
        } catch (error) {
          console.error('Unexpected error during OAuth callback:', error);
          toast({ 
            title: 'Error', 
            description: 'An unexpected error occurred during sign-in', 
            variant: 'destructive' 
          });
        } finally {
          setOauthLoading(false);
          onLoadingChange(false);
        }
      }
    };

    handleOAuthCallback();
  }, [navigate, toast, onLoadingChange]);

  if (oauthLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Completing sign-in...</h2>
          <p className="text-gray-600">Please wait while we finalize your authentication.</p>
        </div>
      </div>
    );
  }

  return null;
};

export default OAuthCallback;
