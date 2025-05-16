import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { LoginForm } from '../auth/LoginForm';
import { type JSX } from 'react';

export const LoginPage = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading } = useAuth();
  
  const handleLogin = async (values: { email: string; password: string }) => {
    const success = await login(values.email, values.password);
    
    // Only redirect if login was successful
    if (success) {
      const from = (location.state as any)?.from?.pathname || '/drafts';
      navigate(from, { replace: true });
    }
    // If not successful, the error will be displayed in the form
  };
  
  return <LoginForm onLogin={handleLogin} isLoading={isLoading} />;
}; 