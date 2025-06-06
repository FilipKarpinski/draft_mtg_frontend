import { useEffect, useState, type JSX } from 'react';
import { 
  Card, 
  Text, 
  Title, 
  Container, 
  Group, 
  Loader, 
  Alert, 
  Stack, 
  Button,
  ThemeIcon,
  Badge
} from '@mantine/core';
import { IconAlertCircle, IconUser, IconArrowLeft } from '@tabler/icons-react';
import { api } from '../../auth/api';
import type { Player } from '../../types';

interface PlayerDetailProps {
  playerId: number;
  onBack: () => void;
}

export const PlayerDetail = ({ playerId, onBack }: PlayerDetailProps): JSX.Element => {
  const [player, setPlayer] = useState<Player | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlayerDetail = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await api.get<Player>(`/players/${playerId}`);
        setPlayer(response.data);
      } catch (err: any) {
        console.error('Error fetching player detail:', err);
        setError(err.response?.data?.detail || 'Failed to load player details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlayerDetail();
  }, [playerId]);

  if (isLoading) {
    return (
      <Container size="md" mt={40}>
        <Stack align="center" mt={50}>
          <Loader size="lg" />
          <Text>Loading player details...</Text>
        </Stack>
      </Container>
    );
  }

  if (error) {
    return (
      <Container size="md" mt={40}>
        <Alert icon={<IconAlertCircle size={16} />} color="red" title="Error loading player details">
          {error}
        </Alert>
        <Group justify="flex-start" mt="md">
          <Button 
            variant="outline" 
            leftSection={<IconArrowLeft size={16} />}
            onClick={onBack}
          >
            Back to Players
          </Button>
        </Group>
      </Container>
    );
  }

  return (
    <Container size="md" mt={40}>
      <Group mb="xl">
        <Button 
          variant="subtle" 
          leftSection={<IconArrowLeft size={16} />}
          onClick={onBack}
        >
          Back to Players
        </Button>
      </Group>

      <Title order={1} mb="xl">
        Player Details
      </Title>

      {player && (
        <Card shadow="sm" p="lg" radius="md" withBorder>
          <Group>
            <ThemeIcon size={50} radius="xl" variant="light" color="blue">
              <IconUser size={30} />
            </ThemeIcon>
            <div>
              <Text fw={600} size="xl">{player.name}</Text>
              <Badge variant="light" color="blue" size="sm" mt="xs">
                Player Profile
              </Badge>
            </div>
          </Group>
        </Card>
      )}
    </Container>
  );
}; 