import { useState, useEffect, type JSX } from 'react';
import { 
  Card, 
  Title, 
  Container, 
  Group, 
  Button,
  TextInput,
  Alert,
  Stack,
  Select,
  Text,
  ActionIcon,
  Divider
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconAlertCircle, IconFileText, IconArrowLeft, IconX, IconArrowUp, IconArrowDown, IconUser } from '@tabler/icons-react';
import { authApi } from '../../auth/api';
import type { Player } from '../../types';

interface DraftCreateProps {
  onBack: () => void;
  onDraftCreated: (draftData: any) => void;
}

interface CreateDraftForm {
  name: string;
  date: string;
}

export const DraftCreate = ({ onBack, onDraftCreated }: DraftCreateProps): JSX.Element => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<number[]>([]);
  const [loadingPlayers, setLoadingPlayers] = useState<boolean>(true);

  const form = useForm<CreateDraftForm>({
    initialValues: {
      name: '',
      date: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
    },
    validate: {
      name: (value) => (value.trim().length > 0 ? null : 'Draft name is required'),
      date: (value) => (value ? null : 'Draft date is required'),
    },
  });

  // Fetch available players
  useEffect(() => {
    const fetchPlayers = async () => {
      setLoadingPlayers(true);
      try {
        const response = await authApi.get<Player[]>('/players');
        setPlayers(response.data);
      } catch (err: any) {
        console.error('Error fetching players:', err);
        setError('Failed to load players');
      } finally {
        setLoadingPlayers(false);
      }
    };

    fetchPlayers();
  }, []);

  const getPlayerName = (playerId: number): string => {
    const player = players.find(p => p.id === playerId);
    return player ? player.name : `Player ${playerId}`;
  };

  const getAvailablePlayers = () => {
    return players.filter(player => !selectedPlayerIds.includes(player.id));
  };

  const addPlayer = (playerId: string | null) => {
    if (playerId) {
      const playerIdNum = parseInt(playerId);
      setSelectedPlayerIds([...selectedPlayerIds, playerIdNum]);
    }
  };

  const removePlayer = (playerId: number) => {
    setSelectedPlayerIds(selectedPlayerIds.filter(id => id !== playerId));
  };

  const movePlayerUp = (index: number) => {
    if (index > 0) {
      const newPlayerIds = [...selectedPlayerIds];
      [newPlayerIds[index - 1], newPlayerIds[index]] = [newPlayerIds[index], newPlayerIds[index - 1]];
      setSelectedPlayerIds(newPlayerIds);
    }
  };

  const movePlayerDown = (index: number) => {
    if (index < selectedPlayerIds.length - 1) {
      const newPlayerIds = [...selectedPlayerIds];
      [newPlayerIds[index], newPlayerIds[index + 1]] = [newPlayerIds[index + 1], newPlayerIds[index]];
      setSelectedPlayerIds(newPlayerIds);
    }
  };

  const handleSubmit = async (values: CreateDraftForm) => {
    if (selectedPlayerIds.length === 0) {
      setError('At least one player must be selected');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await authApi.post<any>('/drafts', {
        name: values.name.trim(),
        date: values.date,
        player_ids: selectedPlayerIds
      });
      
      form.reset();
      setSelectedPlayerIds([]);
      
      // Navigate to draft detail immediately with the returned data
      onDraftCreated(response.data);
      
    } catch (err: any) {
      console.error('Error creating draft:', err);
      setError(err.response?.data?.detail || 'Failed to create draft');
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingPlayers) {
    return (
      <Container size="md" mt={40}>
        <Stack align="center" mt={50}>
          <Text>Loading players...</Text>
        </Stack>
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
          Back to Drafts
        </Button>
      </Group>

      <Title order={1} mb="xl">
        Add New Draft
      </Title>

      <Card shadow="sm" p="lg" radius="md" withBorder>
        <Stack gap="md">
          <Group mb="md">
            <IconFileText size={24} stroke={1.5} />
            <Title order={3}>Draft Information</Title>
          </Group>

          {error && (
            <Alert icon={<IconAlertCircle size={16} />} color="red" title="Error">
              {error}
            </Alert>
          )}

          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
              <TextInput
                label="Draft Name"
                placeholder="Enter draft name"
                required
                {...form.getInputProps('name')}
                disabled={isLoading}
              />

              <TextInput
                label="Draft Date"
                type="date"
                required
                {...form.getInputProps('date')}
                disabled={isLoading}
              />

              <Divider my="md" />

              {/* Player Selection */}
              <Stack gap="sm">
                <Title order={4}>Players</Title>
                <Text size="sm" c="dimmed">
                  Select players for this draft. The order matters and can be adjusted using the arrow buttons.
                </Text>

                <Select
                  placeholder="Select a player to add"
                  data={getAvailablePlayers().map(player => ({
                    value: player.id.toString(),
                    label: player.name
                  }))}
                  value={null}
                  onChange={addPlayer}
                  disabled={isLoading || getAvailablePlayers().length === 0}
                  clearable={false}
                />

                {selectedPlayerIds.length === 0 ? (
                  <Text c="dimmed" ta="center" py="md">
                    No players selected yet
                  </Text>
                ) : (
                  <Stack gap="xs">
                    <Text fw={500} size="sm">
                      Selected Players ({selectedPlayerIds.length}):
                    </Text>
                    {selectedPlayerIds.map((playerId, index) => (
                      <Card key={playerId} withBorder p="sm" radius="sm">
                        <Group justify="space-between" align="center">
                          <Group>
                            <Text size="sm" c="dimmed" fw={500}>
                              #{index + 1}
                            </Text>
                            <IconUser size={16} />
                            <Text fw={500}>{getPlayerName(playerId)}</Text>
                          </Group>
                          <Group gap="xs">
                            <ActionIcon
                              variant="subtle"
                              size="sm"
                              onClick={() => movePlayerUp(index)}
                              disabled={index === 0 || isLoading}
                            >
                              <IconArrowUp size={14} />
                            </ActionIcon>
                            <ActionIcon
                              variant="subtle"
                              size="sm"
                              onClick={() => movePlayerDown(index)}
                              disabled={index === selectedPlayerIds.length - 1 || isLoading}
                            >
                              <IconArrowDown size={14} />
                            </ActionIcon>
                            <ActionIcon
                              variant="subtle"
                              color="red"
                              size="sm"
                              onClick={() => removePlayer(playerId)}
                              disabled={isLoading}
                            >
                              <IconX size={14} />
                            </ActionIcon>
                          </Group>
                        </Group>
                      </Card>
                    ))}
                  </Stack>
                )}

                {getAvailablePlayers().length === 0 && selectedPlayerIds.length < players.length && (
                  <Text size="sm" c="dimmed">
                    All available players have been selected.
                  </Text>
                )}
              </Stack>

              <Group justify="flex-end" mt="md">
                <Button 
                  variant="outline" 
                  onClick={onBack}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  loading={isLoading}
                  disabled={selectedPlayerIds.length === 0}
                  leftSection={<IconFileText size={16} />}
                >
                  Create Draft
                </Button>
              </Group>
            </Stack>
          </form>
        </Stack>
      </Card>
    </Container>
  );
}; 