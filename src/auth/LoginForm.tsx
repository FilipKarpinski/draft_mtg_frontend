import { TextInput, PasswordInput, Button, Group, Title, Text, Anchor, Paper, Container, Alert } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconAt, IconLock, IconAlertCircle } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from './AuthContext';

interface LoginFormValues {
  email: string;
  password: string;
}

interface LoginFormProps {
  onLogin: (values: LoginFormValues) => void;
  isLoading?: boolean;
}

export function LoginForm({ onLogin, isLoading: externalLoading = false }: LoginFormProps) {
  const { error: authError } = useAuth();
  const [error, setError] = useState<string | null>(null);
  
  const form = useForm<LoginFormValues>({
    initialValues: {
      email: '',
      password: '',
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      password: (value) => (value.length >= 6 ? null : 'Password should be at least 6 characters'),
    },
  });

  const handleSubmit = (values: LoginFormValues) => {
    setError(null);
    onLogin(values);
  };

  // Format the error message to be more user-friendly
  let displayError = error || authError;
  
  // If the error contains "Field required" messages, make them more specific
  if (displayError && displayError.includes('Field required')) {
    if (displayError.includes('username') && displayError.includes('password')) {
      displayError = 'Email and password are required';
    } else if (displayError.includes('username')) {
      displayError = 'Email is required';
    } else if (displayError.includes('password')) {
      displayError = 'Password is required';
    }
  }
  
  // Handle specific error messages from backend
  if (displayError === 'Incorrect email or password') {
    displayError = 'Incorrect email or password. Please try again.';
  }

  return (
    <Container size="xs" mt={40}>
      <Paper shadow="md" p={30} radius="md" withBorder>
        <Title order={2} ta="center" mb="md">
          Welcome back!
        </Title>
        <Text c="dimmed" size="sm" ta="center" mb={30}>
          Don't have an account yet?{' '}
          <Anchor component={Link} to="/register" size="sm">
            Create account
          </Anchor>
        </Text>

        {displayError && (
          <Alert icon={<IconAlertCircle size={16} />} color="red" mb="md">
            {displayError}
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
            placeholder="Your password"
            leftSection={<IconLock size={16} />}
            {...form.getInputProps('password')}
            mb="xl"
          />

          <Group justify="space-between" mb="md">
            <Anchor component={Link} to="/forgot-password" size="sm">
              Forgot password?
            </Anchor>
          </Group>

          <Button type="submit" fullWidth loading={externalLoading}>
            Sign in
          </Button>
        </form>
      </Paper>
    </Container>
  );
} 