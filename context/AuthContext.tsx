import React, { createContext, useState, useEffect, useContext } from 'react';
import { User, Cleaner, mockUsers, mockCleaners } from '../mock/data';
import { config } from '../env';

interface AuthContextType {
  user: User | null;
  cleaner: Cleaner | null;
  role: 'user' | 'cleaner' | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  switchRole: () => void;
  loadMockData: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [cleaner, setCleaner] = useState<Cleaner | null>(null);
  const [role, setRole] = useState<'user' | 'cleaner' | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedCleaner = localStorage.getItem('cleaner');
    const storedRole = localStorage.getItem('role');

    if (storedUser && storedRole) {
      setUser(JSON.parse(storedUser));
      setRole(storedRole as 'user' | 'cleaner');
    }
    if (storedCleaner && storedRole === 'cleaner') {
      setCleaner(JSON.parse(storedCleaner));
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    if (config.useMockData) {
      if (username === 'mockUser') {
        const mockUser = mockUsers.find(u => u.username === 'mockUser');
        if (mockUser) {
          setUser(mockUser);
          setRole('user');
          localStorage.setItem('user', JSON.stringify(mockUser));
          localStorage.setItem('role', 'user');
          loadMockData();
          return true;
        }
      } else if (username === 'mockCleaner') {
        const mockCleaner = mockCleaners.find(c => c.username === 'mockCleaner');
        if (mockCleaner) {
          setCleaner(mockCleaner);
          setRole('cleaner');
          localStorage.setItem('cleaner', JSON.stringify(mockCleaner));
          localStorage.setItem('role', 'cleaner');
          loadMockData();
          return true;
        }
      }
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    setCleaner(null);
    setRole(null);
    localStorage.removeItem('user');
    localStorage.removeItem('cleaner');
    localStorage.removeItem('role');
    localStorage.removeItem('mockTasks');
    localStorage.removeItem('mockOrders');
  };

  const switchRole = () => {
    if (role === 'user') {
      setRole('cleaner');
      localStorage.setItem('role', 'cleaner');
    } else if (role === 'cleaner') {
      setRole('user');
      localStorage.setItem('role', 'user');
    }
  };

  const loadMockData = () => {
    if (config.useMockData) {
      const { mockTasks, mockOrders } = require('../mock/data');
      localStorage.setItem('mockTasks', JSON.stringify(mockTasks));
      localStorage.setItem('mockOrders', JSON.stringify(mockOrders));
    }
  };

  const value: AuthContextType = {
    user,
    cleaner,
    role,
    isAuthenticated: !!role,
    login,
    logout,
    switchRole,
    loadMockData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};