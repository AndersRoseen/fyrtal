import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../components/Button';
import type { GameState } from '../game/engine';
import { formatLongDate } from '../lib/date';
import { colors, spacing, typography } from '../theme/tokens';

interface HomeScreenProps {
  date: string;
  /** Antal dagar i rad, redan justerat för missade dagar (§7). */
  streak: number;
  status: GameState['status'];
  /** Sant om dagens spel är påbörjat men inte avslutat. */
  started: boolean;
  onPlay: () => void;
  onSeeResult: () => void;
}

export function HomeScreen({
  date,
  streak,
  status,
  started,
  onPlay,
  onSeeResult,
}: HomeScreenProps) {
  const finished = status !== 'playing';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Fyrtal</Text>
        <Text style={styles.tagline}>Hitta de fyra grupperna om fyra.</Text>
      </View>

      <View style={styles.meta}>
        <Text style={styles.date}>{formatLongDate(date)}</Text>
        <Text style={styles.streak}>{streakLabel(streak)}</Text>
      </View>

      <View style={styles.actions}>
        <Button
          label={finished ? 'Se dagens resultat' : started ? 'Fortsätt spela' : 'Spela dagens'}
          variant="primary"
          onPress={finished ? onSeeResult : onPlay}
        />
      </View>
    </View>
  );
}

function streakLabel(streak: number): string {
  if (streak === 0) {
    return 'Ingen streak än';
  }
  return streak === 1 ? '1 dag i rad' : `${streak} dagar i rad`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: spacing.xl,
  },
  header: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    ...typography.display,
    color: colors.ink,
    letterSpacing: 2,
  },
  tagline: {
    ...typography.body,
    color: colors.inkMuted,
    textAlign: 'center',
  },
  meta: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  date: {
    ...typography.title,
    color: colors.ink,
  },
  streak: {
    ...typography.label,
    color: colors.inkMuted,
  },
  actions: {
    gap: spacing.md,
  },
});
