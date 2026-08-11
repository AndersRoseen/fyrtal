import * as Haptics from 'expo-haptics';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { Button } from '../components/Button';
import { MistakeDots } from '../components/MistakeDots';
import { SolvedGroupCard } from '../components/SolvedGroupCard';
import { WordTile } from '../components/WordTile';
import type { GameState, GuessOutcome } from '../game/engine';
import { canSubmit, solvedGroups } from '../game/engine';
import type { Puzzle } from '../types/puzzle';
import { colors, motion, spacing, typography } from '../theme/tokens';

interface GameScreenProps {
  puzzle: Puzzle;
  state: GameState;
  /** Senaste gissningens utfall. Ändras vid varje gissning, även samma utfall. */
  outcome: GuessOutcome | null;
  /** Räknare som ökar per gissning, så återkopplingen kan spelas om. */
  guessCount: number;
  onToggleWord: (word: string) => void;
  onShuffle: () => void;
  onClear: () => void;
  onSubmit: () => void;
  onBack: () => void;
}

const FEEDBACK: Partial<Record<GuessOutcome, string>> = {
  'one-away': 'En bort …',
  wrong: 'Inte riktigt.',
  'already-guessed': 'Den gissningen är redan gjord.',
};

export function GameScreen({
  puzzle,
  state,
  outcome,
  guessCount,
  onToggleWord,
  onShuffle,
  onClear,
  onSubmit,
  onBack,
}: GameScreenProps) {
  const rows = chunk(state.order, 4);
  const feedback = outcome === null ? undefined : FEEDBACK[outcome];
  const shake = useGuessFeedback(outcome, guessCount);

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Button label="Tillbaka" variant="quiet" onPress={onBack} />
        <MistakeDots remaining={state.mistakesRemaining} />
      </View>

      <View style={styles.board}>
        {solvedGroups(state, puzzle).map(({ level, revealed, group }) => (
          <SolvedGroupCard key={level} group={group} revealed={revealed} animate />
        ))}

        <Animated.View style={[styles.grid, { transform: [{ translateX: shake }] }]}>
          {rows.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.row}>
              {row.map((word) => (
                <WordTile
                  key={word}
                  word={word}
                  selected={state.selected.includes(word)}
                  disabled={state.status !== 'playing'}
                  onPress={onToggleWord}
                />
              ))}
            </View>
          ))}
        </Animated.View>
      </View>

      {/* Fast höjd, annars hoppar brädet när återkopplingen dyker upp. */}
      <View style={styles.feedbackSlot}>
        {feedback !== undefined && <Text style={styles.feedback}>{feedback}</Text>}
      </View>

      <View style={styles.controls}>
        <Button
          label="Blanda"
          fill
          onPress={onShuffle}
          disabled={state.status !== 'playing'}
        />
        <Button label="Avmarkera" fill onPress={onClear} disabled={state.selected.length === 0} />
        <Button
          label="Gissa"
          fill
          variant="primary"
          onPress={onSubmit}
          disabled={!canSubmit(state)}
        />
      </View>
    </View>
  );
}

/**
 * Skakar brädet vid en felgissning och lägger på en haptisk knuff. Körs på
 * `guessCount` snarare än `outcome`, så att två likadana utfall i rad båda
 * ger återkoppling.
 */
function useGuessFeedback(outcome: GuessOutcome | null, guessCount: number) {
  const shake = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (guessCount === 0 || outcome === null) {
      return;
    }

    if (outcome === 'correct') {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      return;
    }

    if (outcome === 'wrong' || outcome === 'one-away') {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      const step = (toValue: number, duration: number) =>
        Animated.timing(shake, { toValue, duration, useNativeDriver: true });
      Animated.sequence([
        step(-8, motion.shake / 4),
        step(8, motion.shake / 4),
        step(-4, motion.shake / 4),
        step(0, motion.shake / 4),
      ]).start();
    }
  }, [guessCount, outcome, shake]);

  return shake;
}

function chunk<T>(items: readonly T[], size: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    rows.push(items.slice(i, i + size));
  }
  return rows;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.md,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  board: {
    gap: spacing.sm,
  },
  grid: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  feedbackSlot: {
    height: 22,
    justifyContent: 'center',
  },
  feedback: {
    ...typography.body,
    color: colors.inkMuted,
    textAlign: 'center',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
  },
});
