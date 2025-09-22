import { useState } from 'react';

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'user' | 'admin';
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: false
  });

  const login = async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, loading: true }));
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUser: User = {
        id: '1',
        name: 'Traveler',
        email: email,
        role: 'user'
      };
      
      setAuthState({
        isAuthenticated: true,
        user: mockUser,
        loading: false
      });
      
      // Store in localStorage
      localStorage.setItem('auth_token', 'mock_token');
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      return { success: true };
    } catch (error) {
      setAuthState(prev => ({ ...prev, loading: false }));
      return { success: false, error: 'Login failed' };
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setAuthState(prev => ({ ...prev, loading: true }));
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUser: User = {
        id: '1',
        name: name,
        email: email,
        role: 'user'
      };
      
      setAuthState({
        isAuthenticated: true,
        user: mockUser,
        loading: false
      });
      
      // Store in localStorage
      localStorage.setItem('auth_token', 'mock_token');
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      return { success: true };
    } catch (error) {
      setAuthState(prev => ({ ...prev, loading: false }));
      return { success: false, error: 'Registration failed' };
    }
  };

  const logout = () => {
    setAuthState({
      isAuthenticated: false,
      user: null,
      loading: false
    });
    
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  };

  const checkAuth = () => {
    const token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        setAuthState({
          isAuthenticated: true,
          user: user,
          loading: false
        });
      } catch (error) {
        logout();
      }
    }
  };

  return {
    ...authState,
    login,
    register,
    logout,
    checkAuth
  };
};
