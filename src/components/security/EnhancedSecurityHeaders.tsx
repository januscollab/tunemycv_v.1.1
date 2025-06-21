
import { useEffect } from 'react';

const EnhancedSecurityHeaders = () => {
  useEffect(() => {
    // Enhanced Content Security Policy with stricter controls
    const cspMeta = document.createElement('meta');
    cspMeta.httpEquiv = 'Content-Security-Policy';
    cspMeta.content = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://apis.google.com https://cdnjs.cloudflare.com",
      "script-src-elem 'self' 'unsafe-inline' https://accounts.google.com https://apis.google.com https://cdnjs.cloudflare.com",
      "worker-src 'self' blob: https://cdnjs.cloudflare.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://aohrfehhyjdebaatzqdl.supabase.co wss://aohrfehhyjdebaatzqdl.supabase.co https://accounts.google.com https://api.openai.com https://cdnjs.cloudflare.com",
      "frame-src 'self' https://accounts.google.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests",
      "block-all-mixed-content"
    ].join('; ');
    document.head.appendChild(cspMeta);

    // X-Content-Type-Options
    const contentTypeMeta = document.createElement('meta');
    contentTypeMeta.httpEquiv = 'X-Content-Type-Options';
    contentTypeMeta.content = 'nosniff';
    document.head.appendChild(contentTypeMeta);

    // X-XSS-Protection
    const xssProtectionMeta = document.createElement('meta');
    xssProtectionMeta.httpEquiv = 'X-XSS-Protection';
    xssProtectionMeta.content = '1; mode=block';
    document.head.appendChild(xssProtectionMeta);

    // Referrer Policy
    const referrerMeta = document.createElement('meta');
    referrerMeta.name = 'referrer';
    referrerMeta.content = 'strict-origin-when-cross-origin';
    document.head.appendChild(referrerMeta);

    // Enhanced Permissions Policy
    const permissionsMeta = document.createElement('meta');
    permissionsMeta.httpEquiv = 'Permissions-Policy';
    permissionsMeta.content = [
      'camera=()',
      'microphone=()',
      'geolocation=()',
      'payment=()',
      'usb=()',
      'bluetooth=()',
      'magnetometer=()',
      'accelerometer=()',
      'gyroscope=()',
      'ambient-light-sensor=()',
      'autoplay=()',
      'encrypted-media=()',
      'fullscreen=(self)',
      'picture-in-picture=()'
    ].join(', ');
    document.head.appendChild(permissionsMeta);

    return () => {
      // Cleanup function to remove meta tags if component unmounts
      try {
        if (document.head.contains(cspMeta)) document.head.removeChild(cspMeta);
        if (document.head.contains(contentTypeMeta)) document.head.removeChild(contentTypeMeta);
        if (document.head.contains(xssProtectionMeta)) document.head.removeChild(xssProtectionMeta);
        if (document.head.contains(referrerMeta)) document.head.removeChild(referrerMeta);
        if (document.head.contains(permissionsMeta)) document.head.removeChild(permissionsMeta);
      } catch (error) {
        // Silently handle cleanup errors
        console.warn('Security headers cleanup error:', error);
      }
    };
  }, []);

  return null;
};

export default EnhancedSecurityHeaders;
