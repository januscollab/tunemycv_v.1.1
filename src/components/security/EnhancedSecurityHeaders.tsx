
import { Helmet } from 'react-helmet-async';

const EnhancedSecurityHeaders = () => {
  return (
    <Helmet>
      <meta
        httpEquiv="Content-Security-Policy"
        content={`
          default-src 'self';
          script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com;
          style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
          font-src 'self' https://fonts.gstatic.com https://unpkg.com;
          img-src 'self' data: blob: https:;
          connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.openai.com https://fonts.googleapis.com https://unpkg.com;
          frame-src 'self' blob:;
          worker-src 'self' blob: https://unpkg.com;
          object-src 'none';
          base-uri 'self';
          form-action 'self';
          frame-ancestors 'none';
          upgrade-insecure-requests;
        `.replace(/\s+/g, ' ').trim()}
      />
      <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
      <meta httpEquiv="X-Frame-Options" content="DENY" />
      <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
      <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
      <meta
        httpEquiv="Permissions-Policy"
        content="camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()"
      />
    </Helmet>
  );
};

export default EnhancedSecurityHeaders;
