import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { authApi, setUnauthorizedHandler, TOKEN_KEY, USER_KEY } from '../api';
import type { User } from '../types';
import { useToast } from './ToastContext';

interface AuthState {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

function readStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw && localStorage.getItem(TOKEN_KEY) ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(readStoredUser);
  const { notify } = useToast();

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  // A 401 on any protected call means the token expired or is invalid.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      logout();
      notify('error', 'Your session expired. Log in again.');
    });
  }, [logout, notify]);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await authApi.login({ email, password });
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    setUser(data.user);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    await authApi.register({ name, email, password });
    await login(email, password);
  }, [login]);

  return <AuthContext.Provider value={{ user, login, register, logout }}>{children}</AuthContext.Provider>;
}
