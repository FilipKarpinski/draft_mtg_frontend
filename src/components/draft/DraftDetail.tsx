import { useEffect, useState, type JSX } from 'react';
import { 
  Container, 
  Group, 
  Loader, 
  Alert, 
  Stack, 
  Button,
  Title,
  Text
} from '@mantine/core';
import { IconAlertCircle, IconArrowLeft } from '@tabler/icons-react';
import { authApi } from '../../auth/api';
import { useContext } from 'react';
import { AuthContext } from '../../auth/AuthContext';
import type { Match, DraftDetailData } from '../../types';
import { DraftOverview } from './DraftOverview';
import { DraftPlayersTable } from './DraftPlayersTable';
import { DraftRounds } from './DraftRounds';

interface DraftDetailProps {
  draftId: number;
  draftData?: any; // Optional pre-loaded draft data
  onBack: () => void;
}

export const DraftDetail = ({ draftId, draftData, onBack }: DraftDetailProps): JSX.Element => {
  const [draft, setDraft] = useState<DraftDetailData | null>(draftData || null);
  const [isLoading, setIsLoading] = useState<boolean>(!draftData); // Don't load if we already have data
  const [error, setError] = useState<string | null>(null);
  const [updatingMatches, setUpdatingMatches] = useState<Set<number>>(new Set());
  const [updatingPlayers, setUpdatingPlayers] = useState<Set<number>>(new Set());
  const [calculatingResults, setCalculatingResults] = useState<boolean>(false);
  const { isAuthenticated } = useContext(AuthContext);

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
          draftPlayer.player.id === playerId 
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
    
    const winningPlayer = draft?.draft_players.find(dp => dp.player.id === winningPlayerId);
    return winningPlayer?.deck_colors || [];
  };

  const addDeckColor = async (playerId: number, newColor: string) => {
    const currentPlayer = draft?.draft_players.find(p => p.player.id === playerId);
    if (!currentPlayer || currentPlayer.deck_colors.includes(newColor)) return;
    
    const updatedColors = [...currentPlayer.deck_colors, newColor];
    await updateDeckColors(playerId, updatedColors);
  };

  const removeDeckColor = async (playerId: number, colorToRemove: string) => {
    const currentPlayer = draft?.draft_players.find(p => p.player.id === playerId);
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

  const hasUnfinishedMatches = (): boolean => {
    if (!draft) return false;
    return draft.rounds.some(round => 
      round.matches.some(match => !match.score || match.score === '0-0')
    );
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
          <DraftOverview draft={draft} />
          
          <DraftPlayersTable
            draft={draft}
            isAuthenticated={isAuthenticated}
            hasUnfinishedMatches={hasUnfinishedMatches()}
            calculatingResults={calculatingResults}
            updatingPlayers={updatingPlayers}
            addDeckColor={addDeckColor}
            removeDeckColor={removeDeckColor}
            calculateResults={calculateResults}
          />

          <DraftRounds
            draft={draft}
            isAuthenticated={isAuthenticated}
            updatingMatches={updatingMatches}
            updateMatchScore={updateMatchScore}
            getWinningPlayerColors={getWinningPlayerColors}
          />
        </Stack>
      )}
    </Container>
  );
}; 