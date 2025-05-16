import { TextInput, PasswordInput, Button, Group, Title, Text, Anchor, Paper, Container, Alert } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconAt, IconLock, IconAlertCircle } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import api from '../api/axiosInstance';

interface RegisterFormValues {
  email: string;
  password: string;
}

interface RegisterFormProps {
  onRegisterSuccess?: () => void;
}

export function RegisterForm({ onRegisterSuccess }: RegisterFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<RegisterFormValues>({
    initialValues: {
      email: '',
      password: '',
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      password: (value) => (value.length >= 6 ? null : 'Password should be at least 6 characters'),
    },
  });

  const handleSubmit = async (values: RegisterFormValues) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Use the api for registration
      const response = await api.post('/users', values);
      
      // Registration successful
      if (onRegisterSuccess) {
        onRegisterSuccess();
      } else {
        // Redirect to login page if no callback provided
        window.location.href = '/login';
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container size="xs" mt={40}>
      <Paper shadow="md" p={30} radius="md" withBorder>
        <Title order={2} ta="center" mb="md">
          Create an account
        </Title>
        <Text c="dimmed" size="sm" ta="center" mb={30}>
          Already have an account?{' '}
          <Anchor component={Link} to="/login" size="sm">
            Log in
          </Anchor>
        </Text>

        {error && (
          <Alert icon={<IconAlertCircle size={16} />} color="red" mb="md">
            {error}
          </Alert>
        )}

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <TextInput
            withAsterisk
            label="Email"
            placeholder="your@email.com"
            leftSection={<IconAt size={16} />}
            {...form.getInputProps('email')}
            mb="md"
          />

          <PasswordInput
            withAsterisk
            label="Password"
            placeholder="Create a password"
            leftSection={<IconLock size={16} />}
            {...form.getInputProps('password')}
            mb="xl"
          />

          <Button type="submit" fullWidth loading={isLoading}>
            Register
          </Button>
        </form>
      </Paper>
    </Container>
  );
} 