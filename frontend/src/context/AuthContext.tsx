import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../lib/api';
import { clearTokens, getAccessToken, setAccessToken } from '../lib/auth';
import type { User } from '../lib/types';

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    birthDate: string,
    phone: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = getAccessToken();
        if (!token) {
          const refreshResponse = await api.post('/auth/refresh');
          setAccessToken(refreshResponse.data.accessToken);
        }

        const response = await api.get('/users/me');
        setUser(response.data);
      } catch {
        clearTokens();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    setAccessToken(response.data.accessToken);
    setUser(response.data.user);
  };

  const register = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    birthDate: string,
    phone: string,
  ) => {
    const response = await api.post('/auth/register', {
      email,
      password,
      firstName,
      lastName,
      birthDate,
      phone,
    });
    setAccessToken(response.data.accessToken);
    setUser(response.data.user);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      clearTokens();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
