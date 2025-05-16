import { RegisterForm } from '../auth/RegisterForm';
import { type JSX } from 'react';
export const RegisterPage = (): JSX.Element => {
  const handleRegisterSuccess = () => {
    window.location.href = '/login';
  };
  
  return <RegisterForm onRegisterSuccess={handleRegisterSuccess} />;
}; 