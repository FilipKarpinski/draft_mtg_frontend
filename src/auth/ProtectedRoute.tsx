import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from './AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated, isLoading, isInitializing } = useContext(AuthContext);

  // Show loading state while initializing or checking authentication
  if (isInitializing || isLoading) {
    return <div>Loading...</div>;
  }

  // Pass the current location to Navigate so user can be redirected back after login
  return isAuthenticated ? (
    <>{children}</>
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
};
