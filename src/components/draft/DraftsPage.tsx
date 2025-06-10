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
  Badge,
} from '@mantine/core';
import { IconAlertCircle, IconFileText, IconPlus } from '@tabler/icons-react';
import { authApi } from '../../auth/api';
import { DraftDetail } from './DraftDetail';
import { DraftCreate } from './DraftCreate';
import { AuthContext } from '../../auth/AuthContext';
import type { Draft } from '../../types';

export const DraftsPage = (): JSX.Element => {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [selectedDraftId, setSelectedDraftId] = useState<number | null>(null);
  const [selectedDraftData, setSelectedDraftData] = useState<any | null>(null);
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const { isAuthenticated } = useContext(AuthContext);

  const fetchDrafts = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authApi.get<Draft[]>('/drafts');
      setDrafts(response.data);
    } catch (err: any) {
      console.error('Error fetching drafts:', err);
      setError(err.response?.data?.detail || 'Failed to load drafts');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDrafts();
  }, []);

  // Reset selected draft on any navigation to this route (including same-route clicks)
  useEffect(() => {
    setSelectedDraftId(null);
    setSelectedDraftData(null);
    setShowCreateForm(false);
  }, [location.key]);

  const handleDraftClick = (draftId: number) => {
    setSelectedDraftId(draftId);
    setSelectedDraftData(null); // Clear any pre-loaded data when navigating normally
  };

  const handleBackToList = () => {
    setSelectedDraftId(null);
    setSelectedDraftData(null);
    setShowCreateForm(false);
  };

  const handleAddDraftClick = () => {
    setShowCreateForm(true);
  };

  const handleDraftCreated = (draftData: any) => {
    setShowCreateForm(false);
    setSelectedDraftId(draftData.id);
    setSelectedDraftData(draftData); // Use the returned data
    // Refresh the drafts list in the background
    fetchDrafts();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Show draft create form
  if (showCreateForm) {
    return <DraftCreate onBack={handleBackToList} onDraftCreated={handleDraftCreated} />;
  }

  // Show draft detail view if a draft is selected
  if (selectedDraftId) {
    return (
      <DraftDetail
        draftId={selectedDraftId}
        draftData={selectedDraftData}
        onBack={handleBackToList}
      />
    );
  }

  if (isLoading) {
    return (
      <Container size="md" mt={40}>
        <Stack align="center" mt={50}>
          <Loader size="lg" />
          <Text>Loading drafts...</Text>
        </Stack>
      </Container>
    );
  }

  if (error) {
    return (
      <Container size="md" mt={40}>
        <Alert icon={<IconAlertCircle size={16} />} color="red" title="Error loading drafts">
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="md" mt={40}>
      <Group justify="space-between" align="center" mb="xl">
        <Title order={1}>Drafts</Title>
        {isAuthenticated && (
          <Button leftSection={<IconPlus size={16} />} onClick={handleAddDraftClick}>
            Add Draft
          </Button>
        )}
      </Group>

      {drafts.length === 0 ? (
        <Card shadow="sm" p="lg" radius="md" withBorder>
          <Text c="dimmed" ta="center">
            No drafts found
          </Text>
        </Card>
      ) : (
        <Card shadow="sm" p="lg" radius="md" withBorder>
          <Stack gap="xs">
            {drafts.map((draft) => (
              <div
                key={draft.id}
                style={{
                  cursor: 'pointer',
                  padding: '12px',
                  borderRadius: '6px',
                  transition: 'background-color 0.2s ease',
                }}
                onClick={() => handleDraftClick(draft.id)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--mantine-color-gray-1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <Group align="center" justify="space-between">
                  <Group align="center">
                    <ThemeIcon size={24} radius="xl" variant="light" color="green">
                      <IconFileText size={16} />
                    </ThemeIcon>
                    <div>
                      <Text fw={500}>{draft.name}</Text>
                    </div>
                  </Group>
                  <Badge variant="light" color="gray" size="sm">
                    {formatDate(draft.date)}
                  </Badge>
                </Group>
              </div>
            ))}
          </Stack>
        </Card>
      )}
    </Container>
  );
};
