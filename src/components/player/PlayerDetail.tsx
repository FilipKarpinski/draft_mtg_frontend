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
  Badge,
  SimpleGrid,
} from '@mantine/core';
import {
  IconAlertCircle,
  IconUser,
  IconArrowLeft,
  IconTrophy,
  IconTrash,
} from '@tabler/icons-react';
import { authApi } from '../../auth/api';
import type { Player } from '../../types';

interface PlayerDetailProps {
  playerId: number;
  onBack: () => void;
  onPlayerDeleted?: () => void;
}

interface PlayerPlacements {
  [place: string]: number;
}

export const PlayerDetail = ({
  playerId,
  onBack,
  onPlayerDeleted,
}: PlayerDetailProps): JSX.Element => {
  const [player, setPlayer] = useState<Player | null>(null);
  const [placements, setPlacements] = useState<PlayerPlacements | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingPlacements, setIsLoadingPlacements] = useState<boolean>(true);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [placementsError, setPlacementsError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlayerDetail = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await authApi.get<Player>(`/players/${playerId}`);
        setPlayer(response.data);
      } catch (err: any) {
        console.error('Error fetching player detail:', err);
        setError(err.response?.data?.detail || 'Failed to load player details');
      } finally {
        setIsLoading(false);
      }
    };

    const fetchPlayerPlacements = async () => {
      setIsLoadingPlacements(true);
      setPlacementsError(null);

      try {
        const response = await authApi.get<PlayerPlacements>(`/players/${playerId}/placements`);
        setPlacements(response.data);
      } catch (err: any) {
        console.error('Error fetching player lacements:', err);
        setPlacementsError(err.response?.data?.detail || 'Failed to load player statistics');
      } finally {
        setIsLoadingPlacements(false);
      }
    };

    fetchPlayerDetail();
    fetchPlayerPlacements();
  }, [playerId]);

  const deletePlayer = async () => {
    if (
      !window.confirm(
        `Are you sure you want to delete player "${player?.name}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      await authApi.delete(`/players/${playerId}`);
      onPlayerDeleted?.();
      onBack();
    } catch (err: any) {
      console.error('Error deleting player:', err);
      const errorMessage = err.response?.data?.detail || 'Failed to delete player';
      setError(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const renderPlacementsCards = () => {
    if (isLoadingPlacements) {
      return (
        <Card shadow="sm" p="lg" radius="md" withBorder>
          <Group>
            <IconTrophy size={24} />
            <Title order={3}>Draft Statistics</Title>
          </Group>
          <Stack align="center" mt="md">
            <Loader size="md" />
            <Text size="sm" c="dimmed">
              Loading statistics...
            </Text>
          </Stack>
        </Card>
      );
    }

    if (placementsError) {
      return (
        <Alert icon={<IconAlertCircle size={16} />} color="orange" title="Statistics Unavailable">
          {placementsError}
        </Alert>
      );
    }

    if (!placements || Object.keys(placements).length === 0) {
      return (
        <Card shadow="sm" p="lg" radius="md" withBorder>
          <Group mb="md">
            <IconTrophy size={24} />
            <Title order={3}>Draft Statistics</Title>
          </Group>
          <Text c="dimmed" ta="center">
            No draft results yet
          </Text>
        </Card>
      );
    }

    const getPlaceColor = (place: string) => {
      switch (place) {
        case '1':
          return 'yellow';
        case '2':
          return 'gray';
        case '3':
          return 'orange';
        default:
          return 'blue';
      }
    };

    const getPlaceSuffix = (place: string) => {
      switch (place) {
        case '1':
          return 'st';
        case '2':
          return 'nd';
        case '3':
          return 'rd';
        default:
          return 'th';
      }
    };

    return (
      <Card shadow="sm" p="lg" radius="md" withBorder>
        <Group mb="md">
          <IconTrophy size={24} />
          <Title order={3}>Draft Statistics</Title>
        </Group>
        <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }} spacing="md">
          {Object.entries(placements)
            .sort(([a], [b]) => parseInt(a) - parseInt(b))
            .map(([place, count]) => (
              <Card key={place} shadow="xs" p="md" radius="md" withBorder>
                <Stack align="center" gap="xs">
                  <Badge
                    variant="filled"
                    color={getPlaceColor(place)}
                    size="lg"
                    style={{ fontSize: '0.9rem' }}
                  >
                    {place}
                    {getPlaceSuffix(place)}
                  </Badge>
                  <Text fw={600} size="xl">
                    {count}
                  </Text>
                  <Text size="sm" c="dimmed">
                    {count === 1 ? 'time' : 'times'}
                  </Text>
                </Stack>
              </Card>
            ))}
        </SimpleGrid>
      </Card>
    );
  };

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
        <Alert
          icon={<IconAlertCircle size={16} />}
          color="red"
          title="Error loading player details"
        >
          {error}
        </Alert>
        <Group justify="flex-start" mt="md">
          <Button variant="outline" leftSection={<IconArrowLeft size={16} />} onClick={onBack}>
            Back to Players
          </Button>
        </Group>
      </Container>
    );
  }

  return (
    <Container size="md" mt={40}>
      <Group mb="xl">
        <Button variant="subtle" leftSection={<IconArrowLeft size={16} />} onClick={onBack}>
          Back to Players
        </Button>
      </Group>

      <Group justify="space-between" align="center" mb="xl">
        <Title order={1}>Player Details</Title>
        <Button
          color="red"
          variant="outline"
          leftSection={<IconTrash size={16} />}
          onClick={deletePlayer}
          loading={isDeleting}
          disabled={isDeleting}
        >
          Delete Player
        </Button>
      </Group>

      <Stack gap="xl">
        {player && (
          <Card shadow="sm" p="lg" radius="md" withBorder>
            <Group>
              <ThemeIcon size={50} radius="xl" variant="light" color="blue">
                <IconUser size={30} />
              </ThemeIcon>
              <div>
                <Text fw={600} size="xl">
                  {player.name}
                </Text>
                <Badge variant="light" color="blue" size="sm" mt="xs">
                  Player Profile
                </Badge>
              </div>
            </Group>
          </Card>
        )}

        {renderPlacementsCards()}
      </Stack>
    </Container>
  );
};
