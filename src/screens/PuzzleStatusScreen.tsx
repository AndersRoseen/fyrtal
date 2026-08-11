import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../components/Button';
import type { DailyPuzzle } from '../puzzle/useDailyPuzzle';
import { colors, spacing, typography } from '../theme/tokens';

interface PuzzleStatusScreenProps {
  /** Allt utom `ok` – vyn visas bara när pusslet inte gick att få fram. */
  state: Exclude<DailyPuzzle, { status: 'ok' }>;
  onRetry: () => void;
}

/**
 * Fel ska förklara sig själva (plan.md §4). Ett saknat pussel är oftast
 * "det finns inte än", inte ett haveri – och ska inte se ut som ett.
 */
export function PuzzleStatusScreen({ state, onRetry }: PuzzleStatusScreenProps) {
  const { title, body, canRetry } = describe(state);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
      {canRetry && <Button label="Försök igen" variant="primary" onPress={onRetry} />}
    </View>
  );
}

function describe(state: PuzzleStatusScreenProps['state']): {
  title: string;
  body: string;
  canRetry: boolean;
} {
  switch (state.status) {
    case 'loading':
      return { title: 'Hämtar dagens pussel …', body: '', canRetry: false };

    case 'offline':
      return {
        title: 'Ingen anslutning',
        body: 'Dagens pussel kunde inte hämtas. Redan spelade pussel fungerar offline.',
        canRetry: true,
      };

    case 'unavailable':
      switch (state.reason) {
        case 'not-published':
          return {
            title: 'Inget pussel idag ännu',
            body: 'Dagens pussel är inte publicerat. Titta in igen om en stund.',
            canRetry: true,
          };
        case 'before-first':
          return {
            title: 'Du är i det förflutna',
            body: 'Det finns inget pussel för det här datumet. Kontrollera enhetens datum.',
            canRetry: true,
          };
        case 'missing':
          return {
            title: 'Pusslet saknas',
            body: 'Filen för dagens datum gick inte att hitta.',
            canRetry: true,
          };
      }

    case 'error':
      return {
        title: 'Något gick fel',
        body: state.message,
        canRetry: true,
      };
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  title: {
    ...typography.title,
    color: colors.ink,
    textAlign: 'center',
  },
  body: {
    ...typography.body,
    color: colors.inkMuted,
    textAlign: 'center',
  },
});
