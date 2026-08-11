import { useEffect, useState } from 'react';
import { Share, StyleSheet, Text, View } from 'react-native';

import { Button } from '../components/Button';
import { SolvedGroupCard } from '../components/SolvedGroupCard';
import type { GameState } from '../game/engine';
import { MAX_MISTAKES, mistakesUsed } from '../game/engine';
import { shareGrid, shareText } from '../game/share';
import { formatCountdown, msUntilNextStockholmMidnight } from '../lib/date';
import { LEVELS, groupForLevel } from '../types/puzzle';
import type { Puzzle } from '../types/puzzle';
import { colors, spacing, typography } from '../theme/tokens';

interface ResultScreenProps {
  puzzle: Puzzle;
  state: GameState;
  streak: number;
  longest: number;
  onBack: () => void;
}

export function ResultScreen({ puzzle, state, streak, longest, onBack }: ResultScreenProps) {
  const countdown = useCountdown();
  const won = state.status === 'won';
  const revealedLevels = new Set(
    state.solved.filter((entry) => entry.revealed).map((entry) => entry.level),
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{won ? 'Snyggt löst!' : 'Nästa gång!'}</Text>
        <Text style={styles.subtitle}>
          {mistakesUsed(state)} av {MAX_MISTAKES} försök använda
        </Text>
        <Text style={styles.streak}>
          {streak > 0 ? `${streak} I RAD` : 'INGEN STREAK'}
          {longest > 0 ? `  ·  LÄNGSTA ${longest}` : ''}
        </Text>
      </View>

      {/* Grupperna visas i svårighetsordning, inte lösningsordning (§3). */}
      <View style={styles.groups}>
        {LEVELS.map((level) => (
          <SolvedGroupCard
            key={level}
            group={groupForLevel(puzzle, level)}
            revealed={revealedLevels.has(level)}
          />
        ))}
      </View>

      <View style={styles.share}>
        <Text style={styles.grid}>{shareGrid(state)}</Text>
        <Button
          label="Dela"
          variant="primary"
          onPress={() => Share.share({ message: shareText(state, puzzle.date) })}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.countdown}>Nästa pussel om {countdown}</Text>
        <Button label="Till start" onPress={onBack} />
      </View>
    </View>
  );
}

function useCountdown(): string {
  const [remaining, setRemaining] = useState(() => msUntilNextStockholmMidnight());

  useEffect(() => {
    const timer = setInterval(() => setRemaining(msUntilNextStockholmMidnight()), 1000);
    return () => clearInterval(timer);
  }, []);

  return formatCountdown(remaining);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    gap: spacing.lg,
    paddingVertical: spacing.lg,
  },
  header: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  title: {
    ...typography.display,
    color: colors.ink,
  },
  subtitle: {
    ...typography.body,
    color: colors.inkMuted,
  },
  streak: {
    ...typography.label,
    color: colors.inkMuted,
  },
  groups: {
    gap: spacing.sm,
  },
  share: {
    alignItems: 'center',
    gap: spacing.md,
  },
  grid: {
    fontSize: 22,
    lineHeight: 28,
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    gap: spacing.md,
  },
  countdown: {
    ...typography.label,
    color: colors.inkMuted,
  },
});
