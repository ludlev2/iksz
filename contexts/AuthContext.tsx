'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  role: 'student' | 'provider' | 'teacher';
  name: string;
  [key: string]: any;
}

interface LoginResult {
  success: boolean;
  user?: User;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  school: string;
  grade: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<LoginResult>;
  register: (data: RegisterData) => Promise<LoginResult>;
  logout: () => void;
  setGuestMode: (enabled: boolean) => void;
  isLoading: boolean;
  isGuestMode: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGuestMode, setIsGuestMode] = useState(false);

  useEffect(() => {
    // Check for stored auth on mount
    const storedUser = localStorage.getItem('iksz-user');
    const guestMode = localStorage.getItem('iksz-guest-mode');
    
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else if (guestMode === 'true') {
      setIsGuestMode(true);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<LoginResult> => {
    try {
      // Mock authentication - in real app this would be an API call
      const response = await fetch('/data/mock-users.json');
      const users = await response.json();
      
      const foundUser = users.find((u: any) => 
        u.email === email && u.password === password
      );

      if (foundUser) {
        const { password: _, ...userWithoutPassword } = foundUser;
        setUser(userWithoutPassword);
        setIsGuestMode(false);
        localStorage.setItem('iksz-user', JSON.stringify(userWithoutPassword));
        localStorage.removeItem('iksz-guest-mode');
        return { success: true, user: userWithoutPassword };
      }
      return { success: false };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false };
    }
  };

  const register = async (data: RegisterData): Promise<LoginResult> => {
    try {
      // In a real app, this would be an API call to register the user
      // For now, we'll create a new user and store it
      const newUser: User = {
        id: Date.now().toString(),
        email: data.email,
        role: 'student',
        name: data.name,
        school: data.school,
        grade: data.grade,
        completedHours: 0,
        pendingHours: 0
      };
      
      // Store the user
      setUser(newUser);
      setIsGuestMode(false);
      localStorage.setItem('iksz-user', JSON.stringify(newUser));
      localStorage.removeItem('iksz-guest-mode');
      
      return { success: true, user: newUser };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false };
    }
  };

  const logout = () => {
    setUser(null);
    setIsGuestMode(false);
    localStorage.removeItem('iksz-user');
    localStorage.removeItem('iksz-guest-mode');
  };

  const setGuestModeHandler = (enabled: boolean) => {
    setIsGuestMode(enabled);
    if (enabled) {
      localStorage.setItem('iksz-guest-mode', 'true');
    } else {
      localStorage.removeItem('iksz-guest-mode');
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, setGuestMode: setGuestModeHandler, isLoading, isGuestMode }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}