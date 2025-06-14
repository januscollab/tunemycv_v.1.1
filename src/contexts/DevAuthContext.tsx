import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface DevAuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
}

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

  const DEV_SESSION_KEY = 'dev-auth-session';

  const clearDevAuthState = () => {
    console.log('Clearing dev auth state');
    setSession(null);
    setUser(null);
    localStorage.removeItem(DEV_SESSION_KEY);
  };

  useEffect(() => {
    // Load dev session from localStorage
    const savedSession = localStorage.getItem(DEV_SESSION_KEY);
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        setSession(parsed);
        setUser(parsed.user);
      } catch (error) {
        console.error('Failed to parse dev session:', error);
        clearDevAuthState();
      }
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.session && data.user) {
        // Check if user is admin
        const { data: adminCheck, error: adminError } = await supabase
          .rpc('has_role', { _user_id: data.user.id, _role: 'admin' });
        
        if (adminError || !adminCheck) {
          throw new Error('Admin privileges required for dev suite access');
        }

        // Store session in localStorage for dev suite
        localStorage.setItem(DEV_SESSION_KEY, JSON.stringify(data.session));
        setSession(data.session);
        setUser(data.user);
      }

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      clearDevAuthState();
    } catch (error) {
      console.error('Dev logout error:', error);
      clearDevAuthState();
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signOut,
  };

  return <DevAuthContext.Provider value={value}>{children}</DevAuthContext.Provider>;
};