import { AppShell, Burger, Group, NavLink, Button, Menu, Avatar } from '@mantine/core';
import { useState, type JSX, useContext } from 'react';
import { IconFileText, IconUsers, IconLogin, IconLogout, IconUserCircle, IconUserPlus, IconChartBar } from '@tabler/icons-react';
import { Routes, Route, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { StatsPage } from '../pages/StatsPage';
import { AccountPage } from '../pages/AccountPage';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage';
import { ProtectedRoute } from '../auth/ProtectedRoute';
import { DraftsPage } from '../pages/DraftsPage';
import { PlayersPage } from '../pages/PlayersPage';
import { AuthContext } from '../auth/AuthContext';
import useAxiosInterceptors from '../auth/useAxiosInterceptors';

export function MainLayout(): JSX.Element {
  useAxiosInterceptors();
  
  const [opened, setOpened] = useState<boolean>(false);
  const location = useLocation();
  const { isAuthenticated, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: { mobile: !opened }
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Burger
            opened={opened}
            onClick={() => setOpened((o) => !o)}
            size="sm"
            hiddenFrom="sm"
          />
          <h3>MTG Draft App</h3>

          {isAuthenticated ? (
            <Menu position="bottom-end" withArrow>
              <Menu.Target>
                <Avatar radius="xl" size="md" color="blue" style={{ cursor: 'pointer' }} />
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item
                  leftSection={<IconUserCircle size={14} />}
                  component={Link}
                  to="/account"
                >
                  My Account
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconLogout size={14} />}
                  onClick={handleLogout}
                >
                  Log Out
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          ) : (
            <Group gap="xs">
              <Button
                variant={location.pathname === '/login' ? "filled" : "subtle"}
                leftSection={<IconLogin size={16} />}
                component={Link}
                to="/login"
              >
                Log In
              </Button>
              <Button
                variant={location.pathname === '/register' ? "filled" : "subtle"}
                leftSection={<IconUserPlus size={16} />}
                component={Link}
                to="/register"
              >
                Register
              </Button>
            </Group>
          )}
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <NavLink
          label="Drafts"
          leftSection={<IconFileText size={16} />}
          component={Link}
          to="/drafts"
          active={location.pathname === '/drafts'}
          variant="filled"
          color="blue"
        />
        <NavLink
          label="Players"
          leftSection={<IconUsers size={16} />}
          component={Link}
          to="/players"
          active={location.pathname === '/players'}
          variant="filled"
          color="blue"
        />
        <NavLink
          label="Stats"
          leftSection={<IconChartBar size={16} />}
          component={Link}
          to="/stats"
          active={location.pathname === '/stats'}
          variant="filled"
          color="blue"
        />
      </AppShell.Navbar>

      <AppShell.Main>
        <Routes>
          <Route path="/" element={<Navigate to="/drafts" />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          
          {/* Protected routes */}
          <Route
            path="/drafts"
            element={
              <ProtectedRoute>
                <DraftsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/players"
            element={
              <ProtectedRoute>
                <PlayersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/stats"
            element={
              <ProtectedRoute>
                <StatsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <AccountPage />
              </ProtectedRoute>
            }
          />
          
          {/* Catch-all route for any undefined routes */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </AppShell.Main>
    </AppShell>
  );
} 