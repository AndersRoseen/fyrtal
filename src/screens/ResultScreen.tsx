import { useEffect, useState } from 'react';
import { Share, StyleSheet, Text, View } from 'react-native';

import { Button } from '../components/Button';
import { SolvedGroupCard } from '../components/SolvedGroupCard';
import type { GameState } from '../game/engine';
import { MAX_MISTAKES, mistakesUsed } from '../game/engine';
import { shareGrid, shareText } from '../game/share';
import { formatCountdown, msUntilNextStockholmMidnight } from '../lib/date';
import type { Puzzle } from '../types/puzzle';
import { LEVELS, groupForLevel } from '../types/puzzle';
import {
  colors,
  elevation,
  radius,
  spacing,
  typography,
} from '../theme/tokens';

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

      {/*
        Delningskortet ska tåla att skärmdumpas rakt av (§9): egen yta,
        datum och rutnät ihop, inget kringliggande skräp.
      */}
      <View style={styles.shareCard}>
        <Text style={styles.shareTitle}>Fyrtal</Text>
        <Text style={styles.shareDate}>{puzzle.date}</Text>
        <Text style={styles.grid}>{shareGrid(state)}</Text>
        <View style={styles.shareStats}>
          <Text style={styles.shareStat}>{streak} I RAD</Text>
          <Text style={styles.shareStat}>·</Text>
          <Text style={styles.shareStat}>LÄNGSTA {longest}</Text>
        </View>
      </View>

      <View style={styles.shareActions}>
        <Button
          label="Dela"
          fill
          variant="primary"
          onPress={() => {
            void Share.share({ message: shareText(state, puzzle.date) });
          }}
        />
        <Button label="Till start" fill onPress={onBack} />
      </View>

      <View style={styles.footer}>
        <Text style={styles.countdown}>Nästa pussel om {countdown}</Text>
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
    ...typography.title,
    color: colors.ink,
  },
  subtitle: {
    ...typography.body,
    color: colors.inkMuted,
  },
  groups: {
    gap: spacing.sm,
  },
  shareCard: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    ...elevation.card,
  },
  shareTitle: {
    ...typography.theme,
    color: colors.ink,
  },
  shareDate: {
    ...typography.label,
    color: colors.inkFaint,
  },
  grid: {
    fontSize: 20,
    lineHeight: 26,
    letterSpacing: 2,
    marginVertical: spacing.sm,
    textAlign: 'center',
  },
  shareStats: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  shareStat: {
    ...typography.label,
    color: colors.inkMuted,
  },
  shareActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  footer: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  countdown: {
    ...typography.label,
    color: colors.inkFaint,
  },
});
