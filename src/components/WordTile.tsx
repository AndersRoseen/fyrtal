import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text } from 'react-native';

import { colors, motion, radius, typography } from '../theme/tokens';

interface WordTileProps {
  word: string;
  selected: boolean;
  disabled?: boolean;
  onPress: (word: string) => void;
}

export function WordTile({ word, selected, disabled, onPress }: WordTileProps) {
  // Markeringen kvitteras med en liten nedskalning – tydligt att trycket tog.
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: selected ? 0.94 : 1,
      useNativeDriver: true,
      speed: 40,
      bounciness: 6,
    }).start();
  }, [selected, scale]);

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ scale }] }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected, disabled: !!disabled }}
        accessibilityLabel={word}
        disabled={disabled}
        onPress={() => onPress(word)}
        style={({ pressed }) => [
          styles.tile,
          selected && styles.tileSelected,
          pressed && !selected && styles.tilePressed,
        ]}
      >
        <Text
          numberOfLines={2}
          adjustsFontSizeToFit
          minimumFontScale={0.6}
          style={[styles.word, selected && styles.wordSelected]}
        >
          {word.toUpperCase()}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    aspectRatio: 1,
  },
  tile: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderRadius: radius.tile,
    backgroundColor: colors.tile,
  },
  tileSelected: {
    backgroundColor: colors.tileSelected,
  },
  tilePressed: {
    backgroundColor: colors.tilePressed,
  },
  word: {
    ...typography.word,
    color: colors.ink,
    textAlign: 'center',
  },
  wordSelected: {
    color: colors.inkInverse,
  },
});

export const TILE_ANIMATION_MS = motion.tile;
