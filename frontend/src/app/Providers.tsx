'use client'

import { createContext, useContext, useState, useCallback, Dispatch, SetStateAction, useEffect } from "react";

type AuthInfo = {
  accessToken: string;
  refreshIn: number;
  refreshAt: number;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  setAuthInfo: Dispatch<SetStateAction<AuthInfo>>;
}

const initialAuthInfo: AuthInfo = {
  accessToken: "",
  refreshIn: 0,
  refreshAt: 0,
  isLoading: false,
  signIn: async () => { },
  signOut: async () => { },
  signUp: async () => { },
  setAuthInfo: () => { },
};

export const AuthContext = createContext<AuthInfo>(initialAuthInfo);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authInfo, setAuthInfo] = useState<AuthInfo>(initialAuthInfo);

  const signIn = useCallback(async (email: string, password: string) => {
    setAuthInfo(prev => ({
      ...prev,
      isLoading: true,
    }))
    const response = await fetch('http://localhost:8000/signin', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) throw new Error('Sign in failed');
    const data = await response.json();
    setAuthInfo(prev => {
      const newAuthInfo = {
        ...prev,
        accessToken: data.access_token,
        refreshAt: data.expires_at,
        refreshIn: data.expires_in,
        isLoading: false,
      }
      return newAuthInfo
    });
  }, []);

  const signOut = useCallback(async () => {
    try {
      await fetch('http://localhost:8000/signout', { method: 'POST', credentials: 'include' });
      setAuthInfo(initialAuthInfo);
    } catch (error) {
      console.log('Sign out error:', error);
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
      console.log('Sign up error:', error);
    }
  }, []);

  const refreshAuth = useCallback(async () => {
    const response = await fetch("http://localhost:8000/refresh", { method: "POST", credentials: 'include' });
    const json = await response.json();
    setAuthInfo((prev) => ({
      ...prev,
      accessToken: json.access_token,
      refreshAt: json.expires_at,
      refreshIn: json.expires_in,
    }));
  }, [setAuthInfo]);

  useEffect(() => {
    if (!authInfo.accessToken) {
      refreshAuth();
    }
  }, [authInfo.accessToken, refreshAuth]);

  useEffect(() => {
    if (authInfo.accessToken && authInfo.refreshAt) {
      const timeLeft = (authInfo.refreshAt * 1000) - Date.now(); // note supabase expires at is in seconds

      console.log("TIME LEFT", timeLeft)

      if (timeLeft > 0) {
        const timeoutId = setTimeout(() => {
          refreshAuth();
        }, timeLeft);

        return () => clearTimeout(timeoutId);
      } else {
        refreshAuth();
      }
    }
  }, [authInfo.accessToken, authInfo.refreshAt, refreshAuth]);

  return <AuthContext.Provider value={
    { ...authInfo, signIn, signOut, signUp, setAuthInfo }
  }>
    {children}
  </AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext);
