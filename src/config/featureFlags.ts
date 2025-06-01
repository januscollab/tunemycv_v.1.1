interface FeatureFlags {
  DEV_BYPASS_AUTH: boolean;
  DEV_AUTO_LOGIN: boolean;
  DEV_SHOW_DEBUG_INFO: boolean;
  DEV_DEFAULT_USER_EMAIL: string;
}

const isDevelopment = import.meta.env.DEV;

export const featureFlags: FeatureFlags = {
  // Bypass authentication checks in development
  DEV_BYPASS_AUTH: isDevelopment,
  
  // Auto-login with a test user in development
  DEV_AUTO_LOGIN: isDevelopment,
  
  // Show debug information in development
  DEV_SHOW_DEBUG_INFO: true,
  
  // Default user email for development
  DEV_DEFAULT_USER_EMAIL: 'alanmahon@gmail.com',
};

export const getFeatureFlag = (flag: keyof FeatureFlags): boolean => {
  return featureFlags[flag];
};

export const getDevUserEmail = (): string => {
  return featureFlags.DEV_DEFAULT_USER_EMAIL;
};
