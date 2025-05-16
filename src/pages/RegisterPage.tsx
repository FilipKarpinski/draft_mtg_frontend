import { RegisterForm } from '../auth/RegisterForm';

export const RegisterPage = (): JSX.Element => {
  const handleRegisterSuccess = () => {
    window.location.href = '/login';
  };
  
  return <RegisterForm onRegisterSuccess={handleRegisterSuccess} />;
}; 