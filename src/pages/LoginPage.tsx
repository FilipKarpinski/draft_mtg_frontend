import { useNavigate, useLocation } from 'react-router-dom';
import { LoginForm } from '../auth/LoginForm';
import { useContext, type JSX } from 'react';
import { AuthContext } from '../auth/AuthContext';

export const LoginPage = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading } = useContext(AuthContext);
  
  const handleLogin = async (values: { email: string; password: string }) => {
    const success = await login({ email: values.email, password: values.password });
    
    // Navigate only if login was successful
    if (success) {
      const from = (location.state as any)?.from?.pathname || '/drafts';
      navigate(from, { replace: true });
    }
    // If not successful, the error will be displayed in the form
  };
  
  return <LoginForm onLogin={handleLogin} isLoading={isLoading} />;
}; 