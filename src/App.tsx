import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { MainLayout } from './layouts/MainLayout';
import { type JSX } from 'react';

function App(): JSX.Element {
  return (
    <MantineProvider defaultColorScheme="dark">
      <BrowserRouter>
        <AuthProvider>
          <MainLayout />
        </AuthProvider>
      </BrowserRouter>
    </MantineProvider>
  );
}

export default App;
