'use client';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from './api';
import { Role, User } from './types';

interface AuthCtx {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, portal?: 'public' | 'admin' | 'super_admin') => Promise<User>;
  registerCandidate: (b: { name: string; email: string; password: string }) => Promise<User>;
  registerCompany: (b: Record<string, unknown>) => Promise<User>;
  refreshUser: () => Promise<void>;
  logout: () => void;
}

const Ctx = createContext<AuthCtx>(null as unknown as AuthCtx);
export const useAuth = () => useContext(Ctx);

export const homeFor = (r: Role) => {
  if (r === 'super_admin') return '/superadmin';
  if (r === 'admin') return '/admin';
  if (r === 'company') return '/dashboard';
  return '/';
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    if (!localStorage.getItem('token')) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const r = await api<{ user: User }>('/auth/me');
      setUser(r.user);
    } catch {
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const save = useCallback((r: { token: string; user: User }) => {
    localStorage.setItem('token', r.token);
    setUser(r.user);
    return r.user;
  }, []);

  const login = (email: string, password: string, portal?: 'public' | 'admin' | 'super_admin') =>
    api<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: { email, password, portal },
    }).then(save);

  const registerCandidate = (b: { name: string; email: string; password: string }) =>
    api<{ token: string; user: User }>('/auth/register', { method: 'POST', body: b }).then(save);

  const registerCompany = (b: Record<string, unknown>) =>
    api<{ token: string; user: User }>('/auth/register-company', {
      method: 'POST',
      body: b,
    }).then(save);

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <Ctx.Provider value={{ user, loading, login, registerCandidate, registerCompany, refreshUser, logout }}>
      {children}
    </Ctx.Provider>
  );
}
