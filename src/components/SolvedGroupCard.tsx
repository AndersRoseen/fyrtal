import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';

import type { PuzzleGroup } from '../types/puzzle';
import {
  levelColors,
  levelInk,
  levelMarks,
  motion,
  radius,
  spacing,
  typography,
} from '../theme/tokens';

interface SolvedGroupCardProps {
  group: PuzzleGroup;
  /** Avslöjad vid förlust snarare än löst av spelaren (§2). */
  revealed?: boolean;
  /** Kör låsanimationen. Av på resultatvyn, där allt redan är löst. */
  animate?: boolean;
}

/**
 * En löst grupp. Låsningen animeras diskret (§9): kortet växer fram och
 * tonar in, så att man ser *att* något låstes utan att spelet stannar upp.
 */
export function SolvedGroupCard({ group, revealed, animate = false }: SolvedGroupCardProps) {
  const progress = useRef(new Animated.Value(animate ? 0 : 1)).current;

  useEffect(() => {
    if (!animate) {
      return;
    }
    Animated.timing(progress, {
      toValue: 1,
      duration: motion.lock,
      useNativeDriver: true,
    }).start();
  }, [animate, progress]);

  const ink = levelInk[group.level];

  return (
    <Animated.View
      accessibilityRole="text"
      accessibilityLabel={`${group.theme}: ${group.words.join(', ')}`}
      style={[
        styles.card,
        { backgroundColor: levelColors[group.level] },
        {
          opacity: progress,
          transform: [
            {
              scale: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0.92, 1],
              }),
            },
          ],
        },
      ]}
    >
      <Text style={[styles.theme, { color: ink }]}>
        <Text style={styles.mark}>{levelMarks[group.level]}</Text>
        {'  '}
        {group.theme}
        {revealed ? '  (avslöjad)' : ''}
      </Text>
      <Text style={[styles.words, { color: ink }]}>
        {group.words.map((word) => word.toUpperCase()).join(' · ')}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.group,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 74,
  },
  theme: {
    ...typography.theme,
    textAlign: 'center',
  },
  mark: {
    fontSize: 11,
  },
  words: {
    ...typography.label,
    marginTop: spacing.xs,
    textAlign: 'center',
    opacity: 0.85,
  },
});
