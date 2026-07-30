import { createContext, useEffect, useState, type ReactNode } from 'react';
import { authApi } from '@/api';
import type { AuthResponse } from '@/api/auth';
import type { User } from '@/types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, instituteName: string, phone: string) => Promise<void>;
  completeSignup: (response: AuthResponse) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() =>
    typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
  );
  const [isLoading, setIsLoading] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('authToken');
  });

  useEffect(() => {
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (!storedToken) return;

    let cancelled = false;
    authApi
      .me()
      .then((u) => {
        if (!cancelled) setUser(u);
      })
      .catch(() => {
        if (!cancelled) {
          localStorage.removeItem('authToken');
          setToken(null);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authApi.login({ email, password });
    localStorage.setItem('authToken', response.token);
    setToken(response.token);
    setUser(response.user);
  };

  const signup = async (email: string, password: string, instituteName: string, phone: string) => {
    const response = await authApi.signup({ email, password, instituteName, phone });
    localStorage.setItem('authToken', response.token);
    setToken(response.token);
    setUser(response.user);
  };

  const completeSignup = (response: AuthResponse) => {
    localStorage.setItem('authToken', response.token);
    setToken(response.token);
    setUser(response.user);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !!token,
        login,
        signup,
        completeSignup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}


