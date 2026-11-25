/**
 * FILE: lib/auth.tsx
 * PURPOSE:
 *   Authentication & Session State Context (`AuthProvider` and `useAuth`).
 *   Manages JWT token storage, automatic session restoration via `/auth/me`,
 *   email/password login, candidate registration, company registration, logout,
 *   and role-based default route resolution (`homeFor`).
 */

'use client';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from './api';
import { Role, User } from './types';

interface AuthCtx {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  registerCandidate: (b: { name: string; email: string; password: string }) => Promise<User>;
  registerCompany: (b: Record<string, string | undefined>) => Promise<User>;
  logout: () => void;
}

const Ctx = createContext<AuthCtx>(null as unknown as AuthCtx);
export const useAuth = () => useContext(Ctx);

/** Determines the default landing route after login based on user role */
export const homeFor = (r: Role) =>
  r === 'super_admin' ? '/superadmin' : r === 'candidate' ? '/' : '/dashboard';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      setLoading(false);
      return;
    }
    api<{ user: User }>('/auth/me')
      .then((r) => setUser(r.user))
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false));
  }, []);

  const save = useCallback((r: { token: string; user: User }) => {
    localStorage.setItem('token', r.token);
    setUser(r.user);
    return r.user;
  }, []);

  const login = (email: string, password: string) =>
    api<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: { email, password },
    }).then(save);

  const registerCandidate = (b: { name: string; email: string; password: string }) =>
    api<{ token: string; user: User }>('/auth/register', { method: 'POST', body: b }).then(save);

  const registerCompany = (b: Record<string, string | undefined>) =>
    api<{ token: string; user: User }>('/auth/register-company', {
      method: 'POST',
      body: b,
    }).then(save);

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <Ctx.Provider value={{ user, loading, login, registerCandidate, registerCompany, logout }}>
      {children}
    </Ctx.Provider>
  );
}
