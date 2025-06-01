
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { featureFlags } from '@/config/featureFlags';

interface DevAuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<any>;
  updatePassword: (password: string) => Promise<any>;
}

// Mock user for development
const createMockUser = (): User => ({
  id: 'dev-user-123',
  aud: 'authenticated',
  role: 'authenticated',
  email: 'dev@example.com',
  email_confirmed_at: new Date().toISOString(),
  phone: '',
  confirmed_at: new Date().toISOString(),
  last_sign_in_at: new Date().toISOString(),
  app_metadata: {},
  user_metadata: {
    first_name: 'Dev',
    last_name: 'User',
  },
  identities: [],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
});

const createMockSession = (user: User): Session => ({
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  token_type: 'bearer',
  user: user,
});

const DevAuthContext = createContext<DevAuthContextType | undefined>(undefined);

export const useDevAuth = () => {
  const context = useContext(DevAuthContext);
  if (context === undefined) {
    throw new Error('useDevAuth must be used within a DevAuthProvider');
  }
  return context;
};

export const DevAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (featureFlags.DEV_AUTO_LOGIN) {
      const mockUser = createMockUser();
      const mockSession = createMockSession(mockUser);
      setUser(mockUser);
      setSession(mockSession);
      console.log('🔧 DEV: Auto-logged in with mock user');
    }
    setLoading(false);
  }, []);

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    if (featureFlags.DEV_BYPASS_AUTH) {
      const mockUser = createMockUser();
      mockUser.email = email;
      mockUser.user_metadata = { first_name: firstName, last_name: lastName };
      const mockSession = createMockSession(mockUser);
      
      setUser(mockUser);
      setSession(mockSession);
      console.log('🔧 DEV: Mock sign up successful');
      return { data: { user: mockUser, session: mockSession }, error: null };
    }
    
    // In development without bypass, you might want to still use real auth
    throw new Error('Dev auth bypass not enabled');
  };

  const signIn = async (email: string, password: string) => {
    if (featureFlags.DEV_BYPASS_AUTH) {
      const mockUser = createMockUser();
      mockUser.email = email;
      const mockSession = createMockSession(mockUser);
      
      setUser(mockUser);
      setSession(mockSession);
      console.log('🔧 DEV: Mock sign in successful');
      return { data: { user: mockUser, session: mockSession }, error: null };
    }
    
    throw new Error('Dev auth bypass not enabled');
  };

  const signOut = async () => {
    setUser(null);
    setSession(null);
    console.log('🔧 DEV: Mock sign out');
  };

  const resetPassword = async (email: string) => {
    if (featureFlags.DEV_BYPASS_AUTH) {
      console.log('🔧 DEV: Mock password reset for:', email);
      return { data: {}, error: null };
    }
    throw new Error('Dev auth bypass not enabled');
  };

  const updatePassword = async (password: string) => {
    if (featureFlags.DEV_BYPASS_AUTH) {
      console.log('🔧 DEV: Mock password update');
      return { data: { user }, error: null };
    }
    throw new Error('Dev auth bypass not enabled');
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
  };

  return <DevAuthContext.Provider value={value}>{children}</DevAuthContext.Provider>;
};
