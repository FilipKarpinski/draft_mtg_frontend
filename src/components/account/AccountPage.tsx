import { useEffect, useState, type JSX } from 'react';
import { Card, Text, Title, Container, Group, Badge, Loader, Alert, Stack } from '@mantine/core';
import { IconAlertCircle, IconMail, IconUser, IconShieldCheck } from '@tabler/icons-react';
import { authApi } from '../../auth/api';
import type { UserData } from '../../types';

export const AccountPage = (): JSX.Element => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await authApi.get<UserData>('/users/me');
        setUserData(response.data);
      } catch (err: any) {
        console.error('Error fetching user data:', err);
        setError(err.response?.data?.detail || 'Failed to load account information');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (isLoading) {
    return (
      <Container size="sm" mt={40}>
        <Stack align="center" mt={50}>
          <Loader size="lg" />
          <Text>Loading account information...</Text>
        </Stack>
      </Container>
    );
  }

  if (error) {
    return (
      <Container size="sm" mt={40}>
        <Alert icon={<IconAlertCircle size={16} />} color="red" title="Error loading account">
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="sm" mt={40}>
      <Title order={1} mb="xl">
        My Account
      </Title>
      
      {userData && (
        <Card shadow="sm" p="lg" radius="md" withBorder>
          <Group mb="md">
            <IconUser size={24} stroke={1.5} />
            <Title order={3}>Account Information</Title>
          </Group>

          <Group mb="md" align="center">
            <IconMail size={20} stroke={1.5} style={{ opacity: 0.7 }} />
            <Text fw={500}>Email:</Text>
            <Text>{userData.email}</Text>
          </Group>

          <Group mb="md" align="center">
            <IconShieldCheck size={20} stroke={1.5} style={{ opacity: 0.7 }} />
            <Text fw={500}>Account Status:</Text>
            <Badge 
              color={userData.is_active ? 'green' : 'red'}
              variant="filled"
            >
              {userData.is_active ? 'Active' : 'Inactive'}
            </Badge>
          </Group>

          {userData.is_admin && (
            <Group mb="md" align="center">
              <IconShieldCheck size={20} stroke={1.5} style={{ opacity: 0.7 }} />
              <Text fw={500}>Admin Status:</Text>
              <Badge color="blue" variant="filled">
                Administrator
              </Badge>
            </Group>
          )}
        </Card>
      )}
    </Container>
  );
}; 