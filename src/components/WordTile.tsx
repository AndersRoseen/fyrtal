import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, radius, typography } from '../theme/tokens';

interface WordTileProps {
  word: string;
  selected: boolean;
  disabled?: boolean;
  onPress: (word: string) => void;
}

export function WordTile({ word, selected, disabled, onPress }: WordTileProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected, disabled: !!disabled }}
      accessibilityLabel={word}
      disabled={disabled}
      onPress={() => onPress(word)}
      style={({ pressed }) => [
        styles.tile,
        selected && styles.tileSelected,
        pressed && styles.tilePressed,
      ]}
    >
      <Text
        numberOfLines={2}
        adjustsFontSizeToFit
        style={[styles.word, selected && styles.wordSelected]}
      >
        {word.toUpperCase()}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    aspectRatio: 1,
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
    opacity: 0.75,
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
