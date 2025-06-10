import { RegisterForm } from '../../auth/RegisterForm';
import { type JSX } from 'react';
import { useNavigate } from 'react-router-dom';

export const RegisterPage = (): JSX.Element => {
  const navigate = useNavigate();

  const handleRegisterSuccess = () => {
    navigate('/login');
  };

  return <RegisterForm onRegisterSuccess={handleRegisterSuccess} />;
};
