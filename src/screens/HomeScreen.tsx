import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../components/Button';
import type { GameState } from '../game/engine';
import { formatLongDate } from '../lib/date';
import { colors, levelColors, radius, spacing, typography } from '../theme/tokens';
import { LEVELS } from '../types/puzzle';

interface HomeScreenProps {
  date: string;
  /** Antal dagar i rad, redan justerat för missade dagar (§7). */
  streak: number;
  longest: number;
  status: GameState['status'];
  /** Sant om dagens spel är påbörjat men inte avslutat. */
  started: boolean;
  onPlay: () => void;
  onSeeResult: () => void;
}

export function HomeScreen({
  date,
  streak,
  longest,
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
        {/* Paletten som signatur – visar spelets fyra nivåer utan att förklara. */}
        <View style={styles.swatches}>
          {LEVELS.map((level) => (
            <View
              key={level}
              style={[styles.swatch, { backgroundColor: levelColors[level] }]}
            />
          ))}
        </View>
        <Text style={styles.tagline}>Hitta alla grupper om fyra</Text>
      </View>

      <View style={styles.meta}>
        <Text style={styles.date}>{formatLongDate(date)}</Text>
        <View style={styles.stats}>
          <Stat value={streak} label="I RAD" />
          <View style={styles.divider} />
          <Stat value={longest} label="LÄNGSTA" />
        </View>
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

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: spacing.xl,
  },
  header: {
    alignItems: 'center',
    gap: spacing.md,
  },
  title: {
    ...typography.display,
    color: colors.ink,
  },
  swatches: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  swatch: {
    width: 26,
    height: 6,
    borderRadius: 3,
  },
  tagline: {
    ...typography.body,
    color: colors.inkMuted,
    textAlign: 'center',
  },
  meta: {
    alignItems: 'center',
    gap: spacing.lg,
  },
  date: {
    ...typography.title,
    color: colors.ink,
    textAlign: 'center',
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.card,
    backgroundColor: colors.tile,
  },
  stat: {
    alignItems: 'center',
    gap: 2,
    minWidth: 64,
  },
  statValue: {
    ...typography.numeric,
    color: colors.ink,
  },
  statLabel: {
    ...typography.label,
    color: colors.inkFaint,
  },
  divider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: colors.border,
  },
  actions: {
    gap: spacing.md,
  },
});
