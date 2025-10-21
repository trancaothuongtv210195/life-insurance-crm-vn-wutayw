
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = '@auth_user';
const USERS_KEY = '@users_data';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEY);
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.log('Error checking auth status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getUsers = async (): Promise<User[]> => {
    try {
      const usersData = await AsyncStorage.getItem(USERS_KEY);
      if (usersData) {
        return JSON.parse(usersData);
      }
      // Initialize with default admin account
      const defaultUsers: User[] = [
        {
          id: 'admin-1',
          email: 'admin@insurance.vn',
          password: 'admin123',
          fullName: 'Quản Trị Viên',
          role: 'Admin',
          phoneNumber: '0900000000',
          createdAt: new Date(),
        },
      ];
      await AsyncStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
      return defaultUsers;
    } catch (error) {
      console.log('Error getting users:', error);
      return [];
    }
  };

  const saveUsers = async (users: User[]) => {
    try {
      await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
    } catch (error) {
      console.log('Error saving users:', error);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const users = await getUsers();
      const foundUser = users.find(u => u.email === email && u.password === password);
      
      if (!foundUser) {
        throw new Error('Email hoặc mật khẩu không đúng');
      }

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(foundUser));
      setUser(foundUser);
    } catch (error) {
      console.log('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setUser(null);
    } catch (error) {
      console.log('Logout error:', error);
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;
    
    try {
      const users = await getUsers();
      const updatedUsers = users.map(u => 
        u.id === user.id ? { ...u, ...updates, updatedAt: new Date() } : u
      );
      await saveUsers(updatedUsers);
      
      const updatedUser = { ...user, ...updates, updatedAt: new Date() };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      console.log('Update profile error:', error);
      throw error;
    }
  };

  const changePassword = async (oldPassword: string, newPassword: string) => {
    if (!user) return;
    
    if (user.password !== oldPassword) {
      throw new Error('Mật khẩu cũ không đúng');
    }

    try {
      const users = await getUsers();
      const updatedUsers = users.map(u => 
        u.id === user.id ? { ...u, password: newPassword, updatedAt: new Date() } : u
      );
      await saveUsers(updatedUsers);
      
      const updatedUser = { ...user, password: newPassword, updatedAt: new Date() };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      console.log('Change password error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        updateProfile,
        changePassword,
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
