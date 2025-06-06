import { useEffect, useState, type JSX, useRef } from 'react';
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
  Accordion,
  Table,
  Select,
  ActionIcon
} from '@mantine/core';
import { IconAlertCircle, IconFileText, IconArrowLeft, IconUsers, IconSwords, IconX } from '@tabler/icons-react';
import { authApi } from '../../auth/api';
import { useContext } from 'react';
import { AuthContext } from '../../auth/AuthContext';
import type { Match, DraftDetailData } from '../../types';

interface DraftDetailProps {
  draftId: number;
  draftData?: any; // Optional pre-loaded draft data
  onBack: () => void;
}

const SCORE_OPTIONS = [
  { value: '0-0', label: '0:0' },
  { value: '2-0', label: '2:0' },
  { value: '2-1', label: '2:1' },
  { value: '1-2', label: '1:2' },
  { value: '0-2', label: '0:2' },
];

const DECK_COLOR_OPTIONS = [
  { value: 'red', label: 'Red' },
  { value: 'blue', label: 'Blue' },
  { value: 'green', label: 'Green' },
  { value: 'black', label: 'Black' },
  { value: 'white', label: 'White' },
];

const COLOR_MAP = {
  red: { color: 'red', bg: '#ff6b6b' },
  blue: { color: 'blue', bg: '#4dabf7' },
  green: { color: 'green', bg: '#51cf66' },
  black: { color: 'dark', bg: '#495057' },
  white: { color: 'gray', bg: '#f8f9fa', border: '2px solid #dee2e6', textColor: '#212529' },
};

export const DraftDetail = ({ draftId, draftData, onBack }: DraftDetailProps): JSX.Element => {
  const [draft, setDraft] = useState<DraftDetailData | null>(draftData || null);
  const [isLoading, setIsLoading] = useState<boolean>(!draftData); // Don't load if we already have data
  const [error, setError] = useState<string | null>(null);
  const [updatingMatches, setUpdatingMatches] = useState<Set<number>>(new Set());
  const [updatingPlayers, setUpdatingPlayers] = useState<Set<number>>(new Set());
  const [calculatingResults, setCalculatingResults] = useState<boolean>(false);
  const { isAuthenticated } = useContext(AuthContext);
  const accordionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    // Only fetch if we don't already have the data
    if (draftData) {
      setDraft(draftData);
      setIsLoading(false);
      return;
    }

    const fetchDraftDetail = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await authApi.get<DraftDetailData>(`/drafts/${draftId}`);
        setDraft(response.data);
      } catch (err: any) {
        console.error('Error fetching draft detail:', err);
        setError(err.response?.data?.detail || 'Failed to load draft details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDraftDetail();
  }, [draftId, draftData]);

  const getPlayerById = (playerId: number): string => {
    const draftPlayer = draft?.draft_players.find(dp => dp.player_id === playerId);
    if (!draftPlayer) return 'Unknown Player';
    
    // Find player name from match data
    const match = draft?.rounds[0]?.matches.find(m => 
      m.player_1_id === playerId || m.player_2_id === playerId
    );
    
    if (match?.player_1_id === playerId) return match.player_1.name;
    if (match?.player_2_id === playerId) return match.player_2.name;
    
    return `Player ${playerId}`;
  };

  const updateMatchScore = async (matchId: number, score: string) => {
    if (!isAuthenticated) {
      setError('You must be logged in to update match scores');
      return;
    }

    setUpdatingMatches(prev => new Set(prev).add(matchId));
    
    try {
      await authApi.put<void>(`/matches/${matchId}`, { score });
      
      // Update local state
      setDraft(prev => {
        if (!prev) return prev;
        
        const updatedRounds = prev.rounds.map(round => ({
          ...round,
          matches: round.matches.map(match => 
            match.id === matchId ? { ...match, score } : match
          )
        }));
        
        return { ...prev, rounds: updatedRounds };
      });
      
    } catch (err: any) {
      console.error('Error updating match score:', err);
      setError(`Failed to update match score: ${err.response?.data?.detail || err.message}`);
    } finally {
      setUpdatingMatches(prev => {
        const updated = new Set(prev);
        updated.delete(matchId);
        return updated;
      });
    }
  };

  const updateDeckColors = async (playerId: number, deckColors: string[]) => {
    if (!isAuthenticated) {
      setError('You must be logged in to update deck colors');
      return;
    }

    setUpdatingPlayers(prev => new Set(prev).add(playerId));
    
    try {
      await authApi.patch<void>(`/draft-players/${draftId}/${playerId}`, { 
        deck_colors: deckColors 
      });
      
      // Update local state
      setDraft(prev => {
        if (!prev) return prev;
        
        const updatedDraftPlayers = prev.draft_players.map(draftPlayer => 
          draftPlayer.player_id === playerId 
            ? { ...draftPlayer, deck_colors: deckColors }
            : draftPlayer
        );
        
        return { ...prev, draft_players: updatedDraftPlayers };
      });
      
    } catch (err: any) {
      console.error('Error updating deck colors:', err);
      setError(`Failed to update deck colors: ${err.response?.data?.detail || err.message}`);
    } finally {
      setUpdatingPlayers(prev => {
        const updated = new Set(prev);
        updated.delete(playerId);
        return updated;
      });
    }
  };

  const getWinningPlayerColors = (match: Match, score: string | null): string[] => {
    if (!score || score === '0-0') return [];
    
    let winningPlayerId: number;
    if (score === '2-0' || score === '2-1') {
      winningPlayerId = match.player_1_id;
    } else if (score === '1-2' || score === '0-2') {
      winningPlayerId = match.player_2_id;
    } else {
      return [];
    }
    
    const winningPlayer = draft?.draft_players.find(dp => dp.player_id === winningPlayerId);
    return winningPlayer?.deck_colors || [];
  };

  const createColorGradient = (colors: string[]): string => {
    if (colors.length === 0) return 'var(--mantine-color-gray-1)';
    if (colors.length === 1) {
      const colorBg = COLOR_MAP[colors[0] as keyof typeof COLOR_MAP]?.bg;
      return colorBg || 'var(--mantine-color-gray-1)';
    }
    
    const gradientColors = colors.map(color => COLOR_MAP[color as keyof typeof COLOR_MAP]?.bg || '#ccc');
    return `linear-gradient(135deg, ${gradientColors.join(', ')})`;
  };

  const addDeckColor = async (playerId: number, newColor: string) => {
    const currentPlayer = draft?.draft_players.find(p => p.player_id === playerId);
    if (!currentPlayer || currentPlayer.deck_colors.includes(newColor)) return;
    
    const updatedColors = [...currentPlayer.deck_colors, newColor];
    await updateDeckColors(playerId, updatedColors);
  };

  const removeDeckColor = async (playerId: number, colorToRemove: string) => {
    const currentPlayer = draft?.draft_players.find(p => p.player_id === playerId);
    if (!currentPlayer) return;
    
    const updatedColors = currentPlayer.deck_colors.filter(color => color !== colorToRemove);
    await updateDeckColors(playerId, updatedColors);
  };

  const calculateResults = async () => {
    if (!isAuthenticated) {
      setError('You must be logged in to calculate results');
      return;
    }

    setCalculatingResults(true);
    setError(null);
    
    try {
      await authApi.post<void>(`/drafts/${draftId}/results`);
      
      // Refresh draft data after calculation
      const response = await authApi.get<DraftDetailData>(`/drafts/${draftId}`);
      setDraft(response.data);
      
    } catch (err: any) {
      console.error('Error calculating results:', err);
      setError(`Failed to calculate results: ${err.response?.data?.detail || err.message}`);
    } finally {
      setCalculatingResults(false);
    }
  };

  const hasUnfinishedMatches = () => {
    if (!draft) return false;
    return draft.rounds.some(round => 
      round.matches.some(match => !match.score || match.score === '0-0')
    );
  };

  const handleAccordionChange = (value: string[]) => {
    // Small delay to allow accordion animation to complete
    setTimeout(() => {
      value.forEach(roundValue => {
        const element = accordionRefs.current[roundValue];
        if (element) {
          // Scroll to the bottom of the expanded accordion item
          const rect = element.getBoundingClientRect();
          const elementBottom = window.scrollY + rect.bottom;
          window.scrollTo({ 
            top: elementBottom - window.innerHeight + 2000, // px padding from bottom
            behavior: 'smooth'
          });
        }
      });
    }, 300 ); // Increased delay to wait for accordion animation
  };

  if (isLoading) {
    return (
      <Container size="md" mt={40}>
        <Stack align="center" mt={50}>
          <Loader size="lg" />
          <Text>Loading draft details...</Text>
        </Stack>
      </Container>
    );
  }

  if (error) {
    return (
      <Container size="md" mt={40}>
        <Alert icon={<IconAlertCircle size={16} />} color="red" title="Error loading draft details">
          {error}
        </Alert>
        <Group justify="flex-start" mt="md">
          <Button 
            variant="outline" 
            leftSection={<IconArrowLeft size={16} />}
            onClick={onBack}
          >
            Back to Drafts
          </Button>
        </Group>
      </Container>
    );
  }

  return (
    <Container size="lg" mt={40}>
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
        Draft Details
      </Title>

      {draft && (
        <Stack gap="lg">
          {/* Draft Overview */}
          <Card shadow="sm" p="lg" radius="md" withBorder>
            <Group mb="md">
              <ThemeIcon size={40} radius="xl" variant="light" color="green">
                <IconFileText size={24} />
              </ThemeIcon>
              <div>
                <Text fw={600} size="xl">Draft #{draft.id}</Text>
                <Badge variant="light" color="green" size="sm" mt="xs">
                  {draft.rounds.length} Rounds • {draft.draft_players.length} Players
                </Badge>
              </div>
            </Group>
          </Card>

          {/* Players */}
          <Card shadow="sm" p="lg" radius="md" withBorder>
            <Group mb="md" justify="space-between">
              <Group>
                <IconUsers size={24} stroke={1.5} />
                <Title order={3}>Players</Title>
              </Group>
              
              {!hasUnfinishedMatches() && isAuthenticated && (
                <Button
                  onClick={calculateResults}
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
                    const hasNullPoints = draft.draft_players.some(player => player.points === null);
                    
                    if (hasNullPoints) {
                      // Sort by order if any player has null points
                      return a.order - b.order;
                    } else {
                      // Sort by points (descending) if all players have points
                      return b.points - a.points;
                    }
                  })
                  .map((draftPlayer) => (
                    <Table.Tr key={draftPlayer.player_id}>
                      <Table.Td>
                        <Text fw={500}>{getPlayerById(draftPlayer.player_id)}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs" align="center">
                          {/* Add Color Dropdown */}
                          <Select
                            data={DECK_COLOR_OPTIONS.filter(option => 
                              !draftPlayer.deck_colors.includes(option.value)
                            )}
                            value=""
                            onChange={(value) => value && addDeckColor(draftPlayer.player_id, value)}
                            placeholder="+ Add"
                            size="xs"
                            w={80}
                            disabled={updatingPlayers.has(draftPlayer.player_id) || !isAuthenticated}
                            clearable={false}
                            searchable={false}
                            style={{ flexShrink: 0 }}
                          />
                          {/* Selected Colors */}
                          <Group gap={4} style={{ width: '350px' }}>
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
                                  fontWeight: 600
                                }}
                                onClick={() => !updatingPlayers.has(draftPlayer.player_id) && isAuthenticated && removeDeckColor(draftPlayer.player_id, color)}
                                rightSection={
                                  !updatingPlayers.has(draftPlayer.player_id) && (
                                    <ActionIcon
                                      size="xs"
                                      color={color === 'white' ? 'dark' : 'white'}
                                      variant="transparent"
                                      style={{ opacity: 0.8 }}
                                    >
                                      <IconX size={10} />
                                    </ActionIcon>
                                  )
                                }
                              >
                                {color.charAt(0).toUpperCase()}
                              </Badge>
                            ))}
                            {draftPlayer.deck_colors.length === 0 && (
                              <Text c="dimmed" size="sm">No colors</Text>
                            )}
                          </Group>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Badge variant="light" color="blue">
                          {draftPlayer.points} pts
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        {draftPlayer.final_place ? (
                          <Badge variant="light" color="yellow">
                            #{draftPlayer.final_place}
                          </Badge>
                        ) : (
                          <Text c="dimmed" size="sm">TBD</Text>
                        )}
                      </Table.Td>
                    </Table.Tr>
                  ))}
              </Table.Tbody>
            </Table>
          </Card>

          {/* Rounds */}
          <Card shadow="sm" p="lg" radius="md" withBorder>
            <Group mb="md">
              <IconSwords size={24} stroke={1.5} />
              <Title order={3}>Rounds & Matches</Title>
            </Group>

            <Accordion variant="separated" multiple onChange={handleAccordionChange}>
              {draft.rounds
                .sort((a, b) => a.number - b.number)
                .map((round) => (
                  <Accordion.Item 
                    key={round.id} 
                    value={`round-${round.id}`}
                    ref={(el) => { accordionRefs.current[`round-${round.id}`] = el; }}
                  >
                    <Accordion.Control>
                      <Group>
                        <Text fw={500}>Round {round.number}</Text>
                        <Badge variant="light" color="gray" size="sm">
                          {round.matches.length} matches
                        </Badge>
                      </Group>
                    </Accordion.Control>
                    <Accordion.Panel>
                      <Stack gap="sm">
                        {round.matches.map((match) => (
                          <Card key={match.id} withBorder radius="sm" p="md">
                            <Group justify="space-between" align="center">
                              <Group>
                                <Text fw={500}>{match.player_1.name}</Text>
                                <Text c="dimmed">vs</Text>
                                <Text fw={500}>{match.player_2.name}</Text>
                              </Group>
                              <Group>
                                <Select
                                  data={SCORE_OPTIONS}
                                  value={match.score}
                                  onChange={(value) => value && updateMatchScore(match.id, value)}
                                  size="sm"
                                  w={100}
                                  disabled={updatingMatches.has(match.id) || !isAuthenticated}
                                  styles={{
                                    input: {
                                      background: createColorGradient(getWinningPlayerColors(match, match.score)),
                                      borderColor: match.score && match.score !== '0-0' ? 'var(--mantine-color-gray-5)' : 'var(--mantine-color-gray-3)',
                                      fontWeight: 700,
                                      fontSize: '14px',
                                      textAlign: 'center',
                                      color: match.score && match.score !== '0-0' ? 'white' : 'var(--mantine-color-gray-7)',
                                      textShadow: match.score && match.score !== '0-0' ? 
                                        '0 1px 3px rgba(0,0,0,0.6), 0 2px 6px rgba(0,0,0,0.4), 0 0 1px rgba(0,0,0,0.9)' : 'none'
                                    }
                                  }}
                                />
                              </Group>
                            </Group>
                          </Card>
                        ))}
                      </Stack>
                    </Accordion.Panel>
                  </Accordion.Item>
                ))}
            </Accordion>
          </Card>
        </Stack>
      )}
    </Container>
  );
}; 