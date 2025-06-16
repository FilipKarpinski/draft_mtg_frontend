import { createContext, useState, useEffect, type ReactNode } from 'react';
import { authApi } from './api';
import { AxiosError } from 'axios';

// Define interface for the context value
interface AuthContextType {
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  refreshAccessToken: () => Promise<string>;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => Promise<void>;
}

// Define interface for login credentials
interface LoginCredentials {
  email: string;
  password: string;
  // Add any other fields that might be in your credentials
}

// Create context with initial value
export const AuthContext = createContext<AuthContextType>({
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  refreshAccessToken: async () => '',
  login: async () => false,
  logout: async () => {},
});

// Define props interface for AuthProvider
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Use useEffect to update isAuthenticated when accessToken changes
  useEffect(() => {
    setIsAuthenticated(accessToken !== null);
  }, [accessToken]);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      // Use URLSearchParams instead of FormData for proper encoding
      const params = new URLSearchParams();
      params.append('username', credentials.email);
      params.append('password', credentials.password);

      const response = await authApi.post<{ access_token: string; refresh_token: string }>(
        '/login',
        params,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          withCredentials: true,
        }
      );

      setAccessToken(response.data.access_token);
      setError(null);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      if (error instanceof AxiosError) {
        setError(error.response?.data.detail || 'Authentication failed');
      } else {
        setError('Authentication failed');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Make logout API call to invalidate refresh token on server
      await authApi.post('/logout', {}, { withCredentials: true });
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout API call failed:', error);
    } finally {
      // Clear local state
      setAccessToken(null);
      setError(null);

      // Clear Authorization header from axios defaults
      delete authApi.defaults.headers.common['Authorization'];
    }
  };

  const refreshAccessToken = async () => {
    setIsLoading(true);
    try {
      const response = await authApi.post<{ access_token: string }>('/refresh', {});

      const newToken = response.data.access_token;
      setAccessToken(newToken);
      authApi.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      return newToken;
    } catch (error) {
      await logout();
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        isAuthenticated,
        isLoading,
        error,
        refreshAccessToken,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
