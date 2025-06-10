import { useEffect, useState, useContext, type JSX } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Card,
  Text,
  Title,
  Container,
  Group,
  Loader,
  Alert,
  Stack,
  ThemeIcon,
  Button,
} from '@mantine/core';
import { IconAlertCircle, IconUser, IconPlus } from '@tabler/icons-react';
import { api } from '../../auth/api';
import { PlayerDetail } from './PlayerDetail';
import { PlayerCreate } from './PlayerCreate';
import { AuthContext } from '../../auth/AuthContext';
import type { Player } from '../../types';

export const PlayersPage = (): JSX.Element => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const { isAuthenticated } = useContext(AuthContext);

  const fetchPlayers = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get<Player[]>('/players');
      setPlayers(response.data);
    } catch (err: any) {
      console.error('Error fetching players:', err);
      setError(err.response?.data?.detail || 'Failed to load players');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  // Reset selected player on any navigation to this route (including same-route clicks)
  useEffect(() => {
    setSelectedPlayerId(null);
    setShowCreateForm(false);
  }, [location.key]);

  const handlePlayerClick = (playerId: number) => {
    setSelectedPlayerId(playerId);
  };

  const handleBackToList = () => {
    setSelectedPlayerId(null);
    setShowCreateForm(false);
  };

  const handleAddPlayerClick = () => {
    setShowCreateForm(true);
  };

  const handlePlayerCreated = () => {
    setShowCreateForm(false);
    // Refresh the players list
    fetchPlayers();
  };

  // Show player create form
  if (showCreateForm) {
    return <PlayerCreate onBack={handleBackToList} onPlayerCreated={handlePlayerCreated} />;
  }

  // Show player detail view if a player is selected
  if (selectedPlayerId) {
    return <PlayerDetail playerId={selectedPlayerId} onBack={handleBackToList} />;
  }

  if (isLoading) {
    return (
      <Container size="md" mt={40}>
        <Stack align="center" mt={50}>
          <Loader size="lg" />
          <Text>Loading players...</Text>
        </Stack>
      </Container>
    );
  }

  if (error) {
    return (
      <Container size="md" mt={40}>
        <Alert icon={<IconAlertCircle size={16} />} color="red" title="Error loading players">
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="md" mt={40}>
      <Group justify="space-between" align="center" mb="xl">
        <Title order={1}>Players</Title>
        {isAuthenticated && (
          <Button leftSection={<IconPlus size={16} />} onClick={handleAddPlayerClick}>
            Add Player
          </Button>
        )}
      </Group>

      {players.length === 0 ? (
        <Card shadow="sm" p="lg" radius="md" withBorder>
          <Text c="dimmed" ta="center">
            No players found
          </Text>
        </Card>
      ) : (
        <Card shadow="sm" p="lg" radius="md" withBorder>
          <Stack gap="xs">
            {players.map((player) => (
              <div
                key={player.id}
                style={{
                  cursor: 'pointer',
                  padding: '12px',
                  borderRadius: '6px',
                  transition: 'background-color 0.2s ease',
                }}
                onClick={() => handlePlayerClick(player.id)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--mantine-color-gray-1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <Group align="center">
                  <ThemeIcon size={24} radius="xl" variant="light">
                    <IconUser size={16} />
                  </ThemeIcon>
                  <div>
                    <Text fw={500}>{player.name}</Text>
                  </div>
                </Group>
              </div>
            ))}
          </Stack>
        </Card>
      )}
    </Container>
  );
};
