import { Card, Group, Title, Button, Table, Text, Select, Badge, ActionIcon } from '@mantine/core';
import { IconUsers, IconX } from '@tabler/icons-react';
import confetti from 'canvas-confetti';
import type { DraftDetailData } from '../../types';
import { DECK_COLOR_OPTIONS, COLOR_MAP } from './constants';
import type { JSX } from 'react';

interface DraftPlayersTableProps {
  draft: DraftDetailData;
  isAuthenticated: boolean;
  hasUnfinishedMatches: boolean;
  calculatingResults: boolean;
  updatingPlayers: Set<number>;
  addDeckColor: (playerId: number, color: string) => Promise<void>;
  removeDeckColor: (playerId: number, color: string) => Promise<void>;
  calculateResults: () => Promise<void>;
}

export const DraftPlayersTable = ({
  draft,
  isAuthenticated,
  hasUnfinishedMatches,
  calculatingResults,
  updatingPlayers,
  addDeckColor,
  removeDeckColor,
  calculateResults,
}: DraftPlayersTableProps): JSX.Element => {
  const getColorAbbreviation = (color: string): string => {
    if (color === 'blue') return 'U';
    return color.charAt(0).toUpperCase();
  };

  const handleCalculateResults = async () => {
    try {
      await calculateResults();

      // Trigger confetti animation after successful calculation
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57'],
      });

      // Additional confetti burst for extra celebration
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
        });
      }, 250);

      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
        });
      }, 400);
    } catch (error) {
      console.error('Error calculating results:', error);
      // Don't show confetti if there was an error
    }
  };

  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <Group mb="md" justify="space-between">
        <Group>
          <IconUsers size={24} stroke={1.5} />
          <Title order={3}>Players</Title>
        </Group>

        {!hasUnfinishedMatches && isAuthenticated && (
          <Button
            onClick={handleCalculateResults}
            loading={calculatingResults}
            color="green"
            size="sm"
            variant="filled"
          >
            Calculate Results
          </Button>
        )}
      </Group>

      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Player</Table.Th>
            <Table.Th>Deck Colors</Table.Th>
            <Table.Th>Points</Table.Th>
            <Table.Th>Final Place</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {draft.draft_players
            .sort((a, b) => {
              // Check if any player has null points
              const hasNullPoints = draft.draft_players.some((player) => player.points === null);

              if (hasNullPoints) {
                // Sort by order if any player has null points
                return a.order - b.order;
              } else {
                // Sort by points (descending) if all players have points
                return (a.final_place || 0) - (b.final_place || 0);
              }
            })
            .map((draftPlayer) => (
              <Table.Tr key={draftPlayer.player.id}>
                <Table.Td>
                  <Text fw={500}>{draftPlayer.player.name}</Text>
                </Table.Td>
                <Table.Td>
                  <Group gap="xs" align="center">
                    {/* Add Color Dropdown */}
                    <Select
                      data={DECK_COLOR_OPTIONS.filter(
                        (option) => !draftPlayer.deck_colors.includes(option.value)
                      )}
                      value=""
                      onChange={(value) => value && addDeckColor(draftPlayer.player.id, value)}
                      placeholder="+"
                      size="xs"
                      w={60}
                      disabled={updatingPlayers.has(draftPlayer.player.id) || !isAuthenticated}
                      clearable={false}
                      searchable={false}
                      styles={{
                        input: {
                          borderRadius: '8px',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          textAlign: 'center',
                          paddingRight: '8px',
                        },
                        dropdown: {
                          borderRadius: '8px',
                        },
                        section: {
                          display: 'none',
                        },
                      }}
                      style={{ flexShrink: 0 }}
                    />
                    {/* Selected Colors */}
                    <Group gap={4}>
                      {draftPlayer.deck_colors.map((color) => (
                        <Badge
                          key={color}
                          variant="filled"
                          size="sm"
                          style={{
                            backgroundColor: COLOR_MAP[color as keyof typeof COLOR_MAP]?.bg,
                            color: color === 'white' ? COLOR_MAP.white.textColor : 'white',
                            border: (COLOR_MAP[color as keyof typeof COLOR_MAP] as any)?.border,
                            cursor: 'pointer',
                            fontWeight: 600,
                            width: '40px',
                            textAlign: 'center',
                            display: 'inline-block',
                          }}
                          onClick={() =>
                            !updatingPlayers.has(draftPlayer.player.id) &&
                            isAuthenticated &&
                            removeDeckColor(draftPlayer.player.id, color)
                          }
                        >
                          {getColorAbbreviation(color)}
                        </Badge>
                      ))}
                    </Group>
                  </Group>
                </Table.Td>
                <Table.Td>
                  <Text
                    fw={600}
                    size="sm"
                    c="white"
                    style={{
                      backgroundColor: 'var(--mantine-color-blue-6)',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      display: 'inline-block',
                      fontSize: '0.75rem',
                    }}
                  >
                    {draftPlayer.points} pts
                  </Text>
                </Table.Td>
                <Table.Td>
                  {draftPlayer.final_place ? (
                    <Text
                      fw={600}
                      size="sm"
                      c="white"
                      style={{
                        backgroundColor: 'var(--mantine-color-yellow-9)',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        display: 'inline-block',
                        fontSize: '0.75rem',
                      }}
                    >
                      #{draftPlayer.final_place}
                    </Text>
                  ) : (
                    <Text c="dimmed" size="sm">
                      TBD
                    </Text>
                  )}
                </Table.Td>
              </Table.Tr>
            ))}
        </Table.Tbody>
      </Table>
    </Card>
  );
};
