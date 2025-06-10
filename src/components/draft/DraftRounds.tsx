import { Card, Group, Title, Accordion, Stack, Text, Badge, Select } from '@mantine/core';
import { useRef } from 'react';
import { IconSwords } from '@tabler/icons-react';
import type { DraftDetailData, Match } from '../../types';
import { SCORE_OPTIONS, createColorGradient } from './constants';
import type { JSX } from 'react';

interface DraftRoundsProps {
  draft: DraftDetailData;
  isAuthenticated: boolean;
  updatingMatches: Set<number>;
  updateMatchScore: (matchId: number, score: string) => Promise<void>;
  getWinningPlayerColors: (match: Match, score: string | null) => string[];
}

export const DraftRounds = ({
  draft,
  isAuthenticated,
  updatingMatches,
  updateMatchScore,
  getWinningPlayerColors,
}: DraftRoundsProps): JSX.Element => {
  const accordionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const handleAccordionChange = (value: string[]) => {
    // Small delay to allow accordion animation to complete
    setTimeout(() => {
      value.forEach((roundValue) => {
        const element = accordionRefs.current[roundValue];
        if (element) {
          // Scroll to the bottom of the expanded accordion item
          const rect = element.getBoundingClientRect();
          const elementBottom = window.scrollY + rect.bottom;
          window.scrollTo({
            top: elementBottom - window.innerHeight + 200, // px padding from bottom
            behavior: 'smooth',
          });
        }
      });
    }, 300); // Increased delay to wait for accordion animation
  };

  return (
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
              ref={(el) => {
                accordionRefs.current[`round-${round.id}`] = el;
              }}
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
                                background: createColorGradient(
                                  getWinningPlayerColors(match, match.score)
                                ),
                                borderColor:
                                  match.score && match.score !== '0-0'
                                    ? 'var(--mantine-color-gray-5)'
                                    : 'var(--mantine-color-gray-3)',
                                fontWeight: 700,
                                fontSize: '14px',
                                textAlign: 'center',
                                color:
                                  match.score && match.score !== '0-0'
                                    ? 'white'
                                    : 'var(--mantine-color-gray-7)',
                                textShadow:
                                  match.score && match.score !== '0-0'
                                    ? '0 1px 3px rgba(0,0,0,0.6), 0 2px 6px rgba(0,0,0,0.4), 0 0 1px rgba(0,0,0,0.9)'
                                    : 'none',
                              },
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
  );
};
