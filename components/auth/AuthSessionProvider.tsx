'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { AUTH_CHANGE_EVENT, auth, clearAuthToken, getAuthToken } from '@/lib/auth';
import type { AuthUserDto } from '@/types';

interface AuthSessionValue {
  token: string | null;
  user: AuthUserDto | null;
  loading: boolean;
  refresh: () => Promise<void>;
  signOut: () => void;
}

const AuthSessionContext = createContext<AuthSessionValue | null>(null);

export function AuthSessionProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUserDto | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const nextToken = getAuthToken();
    setToken(nextToken);

    if (!nextToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const currentUser = await auth.me(nextToken);
      setUser(currentUser);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    const sync = async () => {
      if (!active) return;
      setLoading(true);
      await refresh();
    };

    void sync();

    const handleAuthChange = () => {
      void sync();
    };

    window.addEventListener(AUTH_CHANGE_EVENT, handleAuthChange);
    window.addEventListener('storage', handleAuthChange);

    return () => {
      active = false;
      window.removeEventListener(AUTH_CHANGE_EVENT, handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, [refresh]);

  const signOut = useCallback(() => {
    clearAuthToken();
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo<AuthSessionValue>(
    () => ({
      token,
      user,
      loading,
      refresh,
      signOut,
    }),
    [loading, refresh, signOut, token, user],
  );

  return <AuthSessionContext.Provider value={value}>{children}</AuthSessionContext.Provider>;
}

export function useAuthSession() {
  const context = useContext(AuthSessionContext);

  if (!context) {
    throw new Error('useAuthSession must be used within AuthSessionProvider.');
  }

  return context;
}
