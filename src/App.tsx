import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { MainLayout } from './layouts/MainLayout';

function App(): JSX.Element {
  return (
    <MantineProvider>
      <BrowserRouter>
        <AuthProvider>
          <MainLayout />
        </AuthProvider>
      </BrowserRouter>
    </MantineProvider>
  );
}

export default App;
