import { StyleSheet, Text, View } from 'react-native';

import type { PuzzleGroup } from '../types/puzzle';
import { colors, levelColors, levelMarks, radius, spacing, typography } from '../theme/tokens';

interface SolvedGroupCardProps {
  group: PuzzleGroup;
  /** Avslöjad vid förlust snarare än löst av spelaren (§2). */
  revealed?: boolean;
}

export function SolvedGroupCard({ group, revealed }: SolvedGroupCardProps) {
  return (
    <View style={[styles.card, { backgroundColor: levelColors[group.level] }]}>
      <Text style={styles.theme}>
        <Text style={styles.mark}>{levelMarks[group.level]} </Text>
        {group.theme.toUpperCase()}
        {revealed ? ' (avslöjad)' : ''}
      </Text>
      <Text style={styles.words}>{group.words.join(', ')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.group,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  theme: {
    ...typography.label,
    color: colors.ink,
    textAlign: 'center',
  },
  mark: {
    ...typography.label,
    color: colors.ink,
  },
  words: {
    ...typography.body,
    color: colors.ink,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});
