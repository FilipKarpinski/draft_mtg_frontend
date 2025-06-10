import { useState, useEffect, type JSX } from 'react';
import {
  Container,
  Group,
  Button,
  TextInput,
  Alert,
  Stack,
  Select,
  Text,
  ActionIcon,
  Divider,
  Card,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useListState } from '@mantine/hooks';
import {
  IconAlertCircle,
  IconFileText,
  IconArrowLeft,
  IconX,
  IconUser,
  IconGripVertical,
} from '@tabler/icons-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import cx from 'clsx';
import { authApi } from '../../auth/api';
import type { Player } from '../../types';
import classes from './DraftCreate.module.css';

interface DraftCreateProps {
  onBack: () => void;
  onDraftCreated: (draftData: any) => void;
}

interface CreateDraftForm {
  name: string;
  date: string;
}

interface SelectedPlayer {
  id: number;
  name: string;
}

export const DraftCreate = ({ onBack, onDraftCreated }: DraftCreateProps): JSX.Element => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loadingPlayers, setLoadingPlayers] = useState<boolean>(true);
  const [selectedPlayers, selectedPlayersHandlers] = useListState<SelectedPlayer>([]);

  const form = useForm<CreateDraftForm>({
    initialValues: {
      name: '',
      date: new Date().toISOString().split('T')[0],
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

  const getAvailablePlayers = () => {
    return players.filter((player) => !selectedPlayers.some((sp) => sp.id === player.id));
  };

  const addPlayer = (playerId: string | null) => {
    if (playerId) {
      const player = players.find((p) => p.id === parseInt(playerId));
      if (player) {
        selectedPlayersHandlers.append({ id: player.id, name: player.name });
      }
    }
  };

  const removePlayer = (playerId: number) => {
    const index = selectedPlayers.findIndex((sp) => sp.id === playerId);
    if (index !== -1) {
      selectedPlayersHandlers.remove(index);
    }
  };

  const handleSubmit = async (values: CreateDraftForm) => {
    if (selectedPlayers.length < 2) {
      setError('At least two players must be selected');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await authApi.post<any>('/drafts', {
        name: values.name.trim(),
        date: values.date,
        player_ids: selectedPlayers.map((sp) => sp.id),
      });

      form.reset();
      selectedPlayersHandlers.setState([]);

      onDraftCreated(response.data);
    } catch (err: any) {
      console.error('Error creating draft:', err);
      setError(err.response?.data?.detail || 'Failed to create draft');
    } finally {
      setIsLoading(false);
    }
  };

  const items = selectedPlayers.map((player, index) => (
    <Draggable key={player.id.toString()} index={index} draggableId={player.id.toString()}>
      {(provided, snapshot) => (
        <div
          className={cx(classes.item, { [classes.itemDragging]: snapshot.isDragging })}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
        >
          <div className={classes.playerInfo}>
            <IconGripVertical size={16} color="var(--mantine-color-gray-6)" />
            <Text className={classes.playerOrder}>#{index + 1}</Text>
            <IconUser size={16} />
            <Text fw={500}>{player.name}</Text>
          </div>
          <ActionIcon
            variant="subtle"
            color="red"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              removePlayer(player.id);
            }}
            disabled={isLoading}
            className={classes.removeButton}
          >
            <IconX size={14} />
          </ActionIcon>
        </div>
      )}
    </Draggable>
  ));

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
        <Button variant="subtle" leftSection={<IconArrowLeft size={16} />} onClick={onBack}>
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

              <Stack gap="sm">
                <Title order={4}>Players</Title>
                <Text size="sm" c="dimmed">
                  Select players for this draft. The order matters and can be adjusted by dragging
                  and dropping.
                </Text>

                <Select
                  placeholder="Select a player to add"
                  data={getAvailablePlayers().map((player) => ({
                    value: player.id.toString(),
                    label: player.name,
                  }))}
                  value={null}
                  onChange={addPlayer}
                  disabled={isLoading || getAvailablePlayers().length === 0}
                  clearable={false}
                />

                {selectedPlayers.length === 0 ? (
                  <Text c="dimmed" ta="center" py="md">
                    No players selected yet
                  </Text>
                ) : (
                  <Stack gap="xs">
                    <Text fw={500} size="sm">
                      Selected Players ({selectedPlayers.length}):
                    </Text>

                    <DragDropContext
                      onDragEnd={({ destination, source }) =>
                        selectedPlayersHandlers.reorder({
                          from: source.index,
                          to: destination?.index || 0,
                        })
                      }
                    >
                      <Droppable droppableId="players-list" direction="vertical">
                        {(provided) => (
                          <div {...provided.droppableProps} ref={provided.innerRef}>
                            {items}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>
                  </Stack>
                )}

                {getAvailablePlayers().length === 0 && selectedPlayers.length < players.length && (
                  <Text size="sm" c="dimmed">
                    All available players have been selected.
                  </Text>
                )}
              </Stack>

              <Group justify="flex-end" mt="md">
                <Button variant="outline" onClick={onBack} disabled={isLoading}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={isLoading}
                  disabled={selectedPlayers.length === 0}
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
