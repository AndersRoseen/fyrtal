import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { MAX_MISTAKES } from '../game/engine';
import { colors, motion, spacing, typography } from '../theme/tokens';

interface MistakeDotsProps {
  remaining: number;
}

/**
 * Kvarvarande försök. Prickarna pulsar när en går förlorad, så att man
 * märker kostnaden även om blicken ligger på brädet.
 */
export function MistakeDots({ remaining }: MistakeDotsProps) {
  const pulse = useRef(new Animated.Value(1)).current;
  const previous = useRef(remaining);

  useEffect(() => {
    if (remaining < previous.current) {
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.35,
          duration: motion.tile,
          useNativeDriver: true,
        }),
        Animated.spring(pulse, { toValue: 1, useNativeDriver: true, speed: 20 }),
      ]).start();
    }
    previous.current = remaining;
  }, [remaining, pulse]);

  return (
    <View
      style={styles.row}
      accessibilityRole="text"
      accessibilityLabel={`${remaining} försök kvar`}
    >
      <Text style={styles.label}>FÖRSÖK</Text>
      <Animated.View style={[styles.dots, { transform: [{ scale: pulse }] }]}>
        {Array.from({ length: MAX_MISTAKES }, (_, index) => (
          <View key={index} style={[styles.dot, index >= remaining && styles.dotSpent]} />
        ))}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  label: {
    ...typography.label,
    color: colors.inkFaint,
  },
  dots: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: colors.ink,
  },
  dotSpent: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.border,
  },
});
