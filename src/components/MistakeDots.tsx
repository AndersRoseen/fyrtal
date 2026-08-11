import { StyleSheet, Text, View } from 'react-native';

import { MAX_MISTAKES } from '../game/engine';
import { colors, spacing, typography } from '../theme/tokens';

export function MistakeDots({ remaining }: { remaining: number }) {
  return (
    <View
      style={styles.row}
      accessibilityRole="text"
      accessibilityLabel={`${remaining} försök kvar`}
    >
      <Text style={styles.label}>FÖRSÖK KVAR</Text>
      <View style={styles.dots}>
        {Array.from({ length: MAX_MISTAKES }, (_, index) => (
          <View key={index} style={[styles.dot, index >= remaining && styles.dotSpent]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  label: {
    ...typography.label,
    color: colors.inkMuted,
  },
  dots: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.ink,
  },
  dotSpent: {
    backgroundColor: colors.border,
  },
});
