import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, radius, spacing, typography } from '../theme/tokens';

interface ButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'quiet';
  /** Låter knappen dela bredd jämnt med sina syskon i en rad. */
  fill?: boolean;
}

export function Button({
  label,
  onPress,
  disabled,
  variant = 'secondary',
  fill,
}: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        styles[variant],
        fill && styles.fill,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <Text numberOfLines={1} style={[styles.label, labelStyles[variant]]}>
        {label.toUpperCase()}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.button,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fill: {
    flex: 1,
    paddingHorizontal: spacing.sm,
  },
  primary: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderColor: colors.ink,
  },
  quiet: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    paddingVertical: spacing.sm,
  },
  disabled: {
    opacity: 0.3,
  },
  pressed: {
    opacity: 0.6,
  },
  label: {
    ...typography.label,
  },
});

const labelStyles = StyleSheet.create({
  primary: { color: colors.inkInverse },
  secondary: { color: colors.ink },
  quiet: { color: colors.inkMuted },
});
