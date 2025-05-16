import React, { createContext, useState, useContext, useEffect, type ReactNode } from 'react';
import api, { setAccessToken } from '../api/axiosInstance';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Helper function to format error messages
const formatErrorMessage = (error: any): string => {
  // If it's already a string, return it
  if (typeof error === 'string') return error;
  
  try {
    // If it's a JSON string, parse it
    if (typeof error === 'string' && (error.startsWith('[') || error.startsWith('{'))) {
      const parsedError = JSON.parse(error);
      
      // Handle array of validation errors
      if (Array.isArray(parsedError)) {
        // Check if these are field validation errors
        const fieldErrors = parsedError.filter(err => err.type === 'missing' || err.type === 'value_error');
        
        if (fieldErrors.length > 0) {
          // Create a more descriptive message about which fields have errors
          return fieldErrors.map(err => {
            const fieldName = err.loc[err.loc.length - 1];
            return `${err.msg} for ${fieldName}`;
          }).join(', ');
        }
        
        return parsedError.map(err => err.msg || 'Unknown error').join(', ');
      }
      
      // Handle object errors
      if (parsedError.detail) return parsedError.detail;
      if (parsedError.message) return parsedError.message;
      
      return JSON.stringify(parsedError);
    }
    
    // Handle direct object errors
    if (error && typeof error === 'object') {
      if (Array.isArray(error)) {
        // Check if these are field validation errors
        const fieldErrors = error.filter(err => err.type === 'missing' || err.type === 'value_error');
        
        if (fieldErrors.length > 0) {
          // Create a more descriptive message about which fields have errors
          return fieldErrors.map(err => {
            const fieldName = err.loc[err.loc.length - 1];
            return `${err.msg} for ${fieldName}`;
          }).join(', ');
        }
        
        return error.map(err => err.msg || 'Unknown error').join(', ');
      }
      if (error.detail) return error.detail;
      if (error.message) return error.message;
      
      return JSON.stringify(error);
    }
  } catch (e) {
    // If JSON parsing fails, return a default message
    console.error('Error parsing error message:', e);
  }
  
  return 'An unknown error occurred';
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already authenticated on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Try to get user info with existing cookie
        const response = await api.get('/me');
        if (response.status === 200) {
          setIsAuthenticated(true);
        }
      } catch (err) {
        // If error, user is not authenticated
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Create URLSearchParams instead of FormData for proper OAuth2 format
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);
      
      const response = await api.post('/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      
      // Store access token in memory (not localStorage)
      if (response.data.access_token) {
        setAccessToken(response.data.access_token);
        setIsAuthenticated(true);
        return true; // Indicate success
      } else {
        throw new Error('No access token received');
      }
    } catch (err: any) {
      // Format the error message properly
      const errorDetail = err.response?.data?.detail || err.message || 'Login failed';
      setError(formatErrorMessage(errorDetail));
      return false; // Indicate failure
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    
    try {
      // Call logout endpoint to clear the HTTP-only cookie
      await api.post('/logout');
      
      // Clear access token from memory
      setAccessToken(null);
      setIsAuthenticated(false);
    } catch (err: any) {
      // Format the error message properly
      const errorDetail = err.response?.data?.detail || err.message || 'Logout failed';
      setError(formatErrorMessage(errorDetail));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 