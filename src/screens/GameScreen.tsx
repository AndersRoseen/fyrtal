import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../components/Button';
import { MistakeDots } from '../components/MistakeDots';
import { SolvedGroupCard } from '../components/SolvedGroupCard';
import { WordTile } from '../components/WordTile';
import type { GameState, GuessOutcome } from '../game/engine';
import { canSubmit, solvedGroups } from '../game/engine';
import type { Puzzle } from '../types/puzzle';
import { colors, spacing, typography } from '../theme/tokens';

interface GameScreenProps {
  puzzle: Puzzle;
  state: GameState;
  /** Senaste gissningens utfall – underlag för feedback-raden. */
  outcome: GuessOutcome | null;
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
  onToggleWord,
  onShuffle,
  onClear,
  onSubmit,
  onBack,
}: GameScreenProps) {
  const rows = chunk(state.order, 4);
  const feedback = outcome ? FEEDBACK[outcome] : undefined;

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Button label="Tillbaka" onPress={onBack} />
      </View>

      <View style={styles.board}>
        {solvedGroups(state, puzzle).map(({ level, revealed, group }) => (
          <SolvedGroupCard key={level} group={group} revealed={revealed} />
        ))}

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
      </View>

      <Text style={styles.feedback}>{feedback ?? ' '}</Text>

      <MistakeDots remaining={state.mistakesRemaining} />

      <View style={styles.controls}>
        <Button label="Blanda" onPress={onShuffle} disabled={state.status !== 'playing'} />
        <Button
          label="Avmarkera"
          onPress={onClear}
          disabled={state.selected.length === 0}
        />
        <Button
          label="Gissa"
          variant="primary"
          onPress={onSubmit}
          disabled={!canSubmit(state)}
        />
      </View>
    </View>
  );
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
    paddingVertical: spacing.lg,
  },
  topBar: {
    flexDirection: 'row',
  },
  board: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
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
