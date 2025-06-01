interface FeatureFlags {
  DEV_BYPASS_AUTH: boolean;
  DEV_AUTO_LOGIN: boolean;
  DEV_SHOW_DEBUG_INFO: boolean;
}

const isDevelopment = import.meta.env.DEV;

export const featureFlags: FeatureFlags = {
  // Bypass authentication checks in development
  DEV_BYPASS_AUTH: isDevelopment && import.meta.env.VITE_DEV_BYPASS_AUTH === 'true',
  
  // Auto-login with a test user in development
  DEV_AUTO_LOGIN: isDevelopment && import.meta.env.VITE_DEV_AUTO_LOGIN === 'true',
  
  // Show debug information in development
  DEV_SHOW_DEBUG_INFO: isDevelopment && import.meta.env.VITE_DEV_DEBUG === 'true',
};

export const getFeatureFlag = (flag: keyof FeatureFlags): boolean => {
  return featureFlags[flag];
};