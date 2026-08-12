import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserResponse, LoginInput } from '@temple/shared';
import { apiClient } from '../api/client';

interface AuthContextType {
  user: UserResponse | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (input: LoginInput) => Promise<any>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserResponse | null>(() => {
    const savedUser = localStorage.getItem('temple_user_info');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('temple_jwt_token');
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (token) {
        try {
          const res = await apiClient.get('/auth/me');
          setUser(res.data.user);
          localStorage.setItem('temple_user_info', JSON.stringify(res.data.user));
        } catch (err) {
          console.error('Failed to verify session token:', err);
          logout();
        }
      }
      setIsLoading(false);
    };

    fetchCurrentUser();
  }, [token]);

  const login = async (input: LoginInput): Promise<any> => {
    const response = await apiClient.post('/auth/login', input);
    const { token: newToken, user: newUser, isFirstTimeLogin } = response.data;

    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('temple_jwt_token', newToken);
    localStorage.setItem('temple_user_info', JSON.stringify(newUser));

    return { user: newUser, token: newToken, isFirstTimeLogin };
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('temple_jwt_token');
    localStorage.removeItem('temple_user_info');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
