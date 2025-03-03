'use client'

import { createContext, useContext, useState, useCallback } from "react";

type AuthInfo = {
  accessToken: string;
  refreshToken: string;
  refreshIn: number;
  refreshAt: number;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
}

const initialAuthInfo: AuthInfo = {
  accessToken: "",
  refreshToken: "",
  refreshIn: 0,
  refreshAt: 0,
  signIn: async () => { },
  signOut: async () => { },
  signUp: async () => { },
};

export const AuthContext = createContext<AuthInfo>(initialAuthInfo);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authInfo, setAuthInfo] = useState<AuthInfo>(initialAuthInfo);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const response = await fetch('http://localhost:8000/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) throw new Error('Sign in failed');
      const data = await response.json();
      setAuthInfo(prev => {
        const newAuthInfo = {
          ...prev,
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_oken,
          refreshAt: data.session.expires_at,
          refreshIn: data.session.expires_in,
        }
        return newAuthInfo
      });
    } catch (error) {
      console.error('Sign in error:', error);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await fetch('http://localhost:8000/signout', { method: 'POST' });
      setAuthInfo(initialAuthInfo);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    try {
      const response = await fetch('localhost:8000/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) throw new Error('Sign up failed');
      // Handle successful sign up
    } catch (error) {
      console.error('Sign up error:', error);
    }
  }, []);

  return <AuthContext.Provider value={
    { ...authInfo, signIn, signOut, signUp }
  }>
    {children}
  </AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext);
