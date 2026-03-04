import { createContext, useContext, useState, useCallback } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

type AuthContextType = {
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('nxclaw_token'));
  const login = useCallback(async (username: string, password: string) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      throw new Error(d.error || 'Login failed');
    }
    const data = await res.json();
    setToken(data.token);
    localStorage.setItem('nxclaw_token', data.token);
  }, []);
  const logout = useCallback(() => {
    setToken(null);
    localStorage.removeItem('nxclaw_token');
  }, []);
  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const c = useContext(AuthContext);
  if (!c) throw new Error('useAuth must be used within AuthProvider');
  return c;
}

export function apiFetch(path: string, init?: RequestInit) {
  const token = localStorage.getItem('nxclaw_token');
  return fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      ...init?.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}
