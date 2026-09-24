import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: 'citizen' | 'admin';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (data: { name: string; email: string; password: string; phone?: string }) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  switchRoleDemo: (role: 'citizen' | 'admin') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('fixmycity_token'));
  const [loading, setLoading] = useState(true);

  // Initialize session
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('fixmycity_token');
      if (storedToken) {
        try {
          const res = await authService.getMe();
          if (res.success && res.user) {
            setUser(res.user);
          } else {
            localStorage.removeItem('fixmycity_token');
            setUser(null);
          }
        } catch (err) {
          console.warn('Session verification failed, logging in default citizen demo.');
          await loginDemo('citizen');
        }
      } else {
        // Auto-login default demo citizen so the user can immediately test without barriers
        await loginDemo('citizen');
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const loginDemo = async (role: 'citizen' | 'admin') => {
    try {
      const email = role === 'admin' ? 'admin@fixmycity.org' : 'citizen@fixmycity.org';
      const password = 'password123';
      const res = await authService.login({ email, password });
      if (res.success && res.token) {
        localStorage.setItem('fixmycity_token', res.token);
        setToken(res.token);
        setUser(res.user);
      }
    } catch (err) {
      console.error('Demo login error:', err);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const res = await authService.login({ email, password });
      if (res.success && res.token) {
        localStorage.setItem('fixmycity_token', res.token);
        setToken(res.token);
        setUser(res.user);
        return { success: true };
      }
      return { success: false, message: res.message || 'Login failed' };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || 'Login failed. Please check credentials.',
      };
    }
  };

  const register = async (data: { name: string; email: string; password: string; phone?: string }) => {
    try {
      const res = await authService.register(data);
      if (res.success && res.token) {
        localStorage.setItem('fixmycity_token', res.token);
        setToken(res.token);
        setUser(res.user);
        return { success: true };
      }
      return { success: false, message: res.message || 'Registration failed' };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || 'Registration failed. Please try again.',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('fixmycity_token');
    setToken(null);
    setUser(null);
  };

  const switchRoleDemo = async (targetRole: 'citizen' | 'admin') => {
    setLoading(true);
    await loginDemo(targetRole);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, switchRoleDemo }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
