
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in (from AsyncStorage in real app)
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // In a real app, check AsyncStorage for saved user session
      // For demo, we'll set a default user after a short delay
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.log('Error checking auth status:', error);
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // Demo login - in real app, this would call your backend/Supabase
      // For now, determine role based on email
      let role: UserRole = 'Staff';
      if (email.includes('admin')) {
        role = 'Admin';
      } else if (email.includes('manager')) {
        role = 'Manager';
      }

      const demoUser: User = {
        id: '1',
        email,
        fullName: email.split('@')[0].replace('.', ' ').toUpperCase(),
        role,
        createdAt: new Date(),
      };

      setUser(demoUser);
      setIsLoading(false);
    } catch (error) {
      console.log('Login error:', error);
      setIsLoading(false);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        isLoading,
      }}
    >
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
