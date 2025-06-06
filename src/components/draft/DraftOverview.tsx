import { Card, Group, ThemeIcon, Text, Badge } from '@mantine/core';
import { IconFileText } from '@tabler/icons-react';
import type { DraftDetailData } from '../../types';
import type { JSX } from 'react';

interface DraftOverviewProps {
  draft: DraftDetailData;
}

export const DraftOverview = ({ draft }: DraftOverviewProps): JSX.Element => {
  return (
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
  );
}; 