import { PasswordInput, Button, Group, Title, Alert, Paper, Container } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconLock, IconAlertCircle } from '@tabler/icons-react';
import { useState } from 'react';
import { authApi } from './api';

interface ChangePasswordFormValues {
  current_password: string;
  new_password: string;
}

interface ChangePasswordFormProps {
  onSuccess?: () => void;
}

export function ChangePasswordForm({ onSuccess }: ChangePasswordFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const form = useForm<ChangePasswordFormValues>({
    initialValues: {
      current_password: '',
      new_password: '',
    },
    validate: {
      current_password: (value) =>
        value.length >= 6 ? null : 'Password should be at least 6 characters',
      new_password: (value) =>
        value.length >= 6 ? null : 'Password should be at least 6 characters',
    },
  });

  const handleSubmit = async (values: ChangePasswordFormValues) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await authApi.post<void>('/change-password', values);

      // Password change successful
      setSuccess(true);
      form.reset();

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container size="xs" mt={40}>
      <Paper shadow="md" p={30} radius="md" withBorder>
        <Title order={2} ta="center" mb="md">
          Change Password
        </Title>

        {error && (
          <Alert icon={<IconAlertCircle size={16} />} color="red" mb="md">
            {error}
          </Alert>
        )}

        {success && (
          <Alert color="green" mb="md">
            Password changed successfully!
          </Alert>
        )}

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <PasswordInput
            withAsterisk
            label="Current Password"
            placeholder="Your current password"
            leftSection={<IconLock size={16} />}
            {...form.getInputProps('current_password')}
            mb="md"
          />

          <PasswordInput
            withAsterisk
            label="New Password"
            placeholder="Your new password"
            leftSection={<IconLock size={16} />}
            {...form.getInputProps('new_password')}
            mb="xl"
          />

          <Group justify="flex-end">
            <Button type="submit" loading={isLoading}>
              Change Password
            </Button>
          </Group>
        </form>
      </Paper>
    </Container>
  );
}
