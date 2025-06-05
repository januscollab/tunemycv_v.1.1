
import { useEffect } from 'react';

const EnhancedSecurityHeaders = () => {
  useEffect(() => {
    // Enhanced Content Security Policy with stricter controls
    const cspMeta = document.createElement('meta');
    cspMeta.httpEquiv = 'Content-Security-Policy';
    cspMeta.content = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://apis.google.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://aohrfehhyjdebaatzqdl.supabase.co wss://aohrfehhyjdebaatzqdl.supabase.co https://accounts.google.com https://api.openai.com",
      "frame-src 'self' https://accounts.google.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests",
      "block-all-mixed-content"
    ].join('; ');
    document.head.appendChild(cspMeta);

    // X-Frame-Options
    const frameMeta = document.createElement('meta');
    frameMeta.httpEquiv = 'X-Frame-Options';
    frameMeta.content = 'DENY';
    document.head.appendChild(frameMeta);

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

    // Strict Transport Security (HSTS)
    const hstsMeta = document.createElement('meta');
    hstsMeta.httpEquiv = 'Strict-Transport-Security';
    hstsMeta.content = 'max-age=31536000; includeSubDomains; preload';
    document.head.appendChild(hstsMeta);

    // Cross-Origin Embedder Policy
    const coepMeta = document.createElement('meta');
    coepMeta.httpEquiv = 'Cross-Origin-Embedder-Policy';
    coepMeta.content = 'require-corp';
    document.head.appendChild(coepMeta);

    // Cross-Origin Opener Policy
    const coopMeta = document.createElement('meta');
    coopMeta.httpEquiv = 'Cross-Origin-Opener-Policy';
    coopMeta.content = 'same-origin';
    document.head.appendChild(coopMeta);

    // Additional security meta tags (removed robots as this should be public)
    const featurePolicyMeta = document.createElement('meta');
    featurePolicyMeta.httpEquiv = 'Feature-Policy';
    featurePolicyMeta.content = 'vibrate none; speaker none; sync-xhr none';
    document.head.appendChild(featurePolicyMeta);

    return () => {
      // Cleanup function to remove meta tags if component unmounts
      try {
        if (document.head.contains(cspMeta)) document.head.removeChild(cspMeta);
        if (document.head.contains(frameMeta)) document.head.removeChild(frameMeta);
        if (document.head.contains(contentTypeMeta)) document.head.removeChild(contentTypeMeta);
        if (document.head.contains(xssProtectionMeta)) document.head.removeChild(xssProtectionMeta);
        if (document.head.contains(referrerMeta)) document.head.removeChild(referrerMeta);
        if (document.head.contains(permissionsMeta)) document.head.removeChild(permissionsMeta);
        if (document.head.contains(hstsMeta)) document.head.removeChild(hstsMeta);
        if (document.head.contains(coepMeta)) document.head.removeChild(coepMeta);
        if (document.head.contains(coopMeta)) document.head.removeChild(coopMeta);
        if (document.head.contains(featurePolicyMeta)) document.head.removeChild(featurePolicyMeta);
      } catch (error) {
        // Silently handle cleanup errors
        console.warn('Security headers cleanup error:', error);
      }
    };
  }, []);

  return null;
};

export default EnhancedSecurityHeaders;
