import { useState, type JSX } from 'react';
import { Card, Title, Container, Group, Button, TextInput, Alert, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconAlertCircle, IconUser, IconArrowLeft, IconCheck } from '@tabler/icons-react';
import { authApi } from '../../auth/api';
import type { Player } from '../../types';

interface PlayerCreateProps {
  onBack: () => void;
  onPlayerCreated: () => void;
}

interface CreatePlayerForm {
  name: string;
}

export const PlayerCreate = ({ onBack, onPlayerCreated }: PlayerCreateProps): JSX.Element => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const form = useForm<CreatePlayerForm>({
    initialValues: {
      name: '',
    },
    validate: {
      name: (value) => (value.trim().length > 0 ? null : 'Player name is required'),
    },
  });

  const handleSubmit = async (values: CreatePlayerForm) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await authApi.post<Player>('/players', {
        name: values.name.trim(),
      });

      setSuccess(true);
      form.reset();

      // Show success message briefly, then call onPlayerCreated
      setTimeout(() => {
        onPlayerCreated();
      }, 1500);
    } catch (err: any) {
      console.error('Error creating player:', err);
      setError(err.response?.data?.detail || 'Failed to create player');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container size="md" mt={40}>
      <Group mb="xl">
        <Button variant="subtle" leftSection={<IconArrowLeft size={16} />} onClick={onBack}>
          Back to Players
        </Button>
      </Group>

      <Title order={1} mb="xl">
        Add New Player
      </Title>

      <Card shadow="sm" p="lg" radius="md" withBorder>
        <Stack gap="md">
          <Group mb="md">
            <IconUser size={24} stroke={1.5} />
            <Title order={3}>Player Information</Title>
          </Group>

          {error && (
            <Alert icon={<IconAlertCircle size={16} />} color="red" title="Error">
              {error}
            </Alert>
          )}

          {success && (
            <Alert icon={<IconCheck size={16} />} color="green" title="Success">
              Player created successfully! Returning to players list...
            </Alert>
          )}

          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
              <TextInput
                label="Player Name"
                placeholder="Enter player name"
                required
                maxLength={40}
                {...form.getInputProps('name')}
                disabled={isLoading || success}
              />

              <Group justify="flex-end" mt="md">
                <Button variant="outline" onClick={onBack} disabled={isLoading || success}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={isLoading}
                  disabled={success}
                  leftSection={<IconUser size={16} />}
                >
                  Create Player
                </Button>
              </Group>
            </Stack>
          </form>
        </Stack>
      </Card>
    </Container>
  );
};
