import { type JSX } from 'react';
import { ChangePasswordForm } from '../../auth/ChangePasswordForm';
import { useNavigate } from 'react-router-dom';

export const ChangePasswordPage = (): JSX.Element => {
  const navigate = useNavigate();
  
  const handleSuccess = () => {
    // Wait 2 seconds to let the user see the success message, then redirect
    setTimeout(() => {
      navigate('/account');
    }, 1000);
  };
  
  return <ChangePasswordForm onSuccess={handleSuccess} />;
}; 