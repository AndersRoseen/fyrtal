import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { puzzleForDate } from './src/data/samplePuzzle';
import type { GameState, GuessOutcome } from './src/game/engine';
import {
  clearSelection,
  createGame,
  shuffleTiles,
  submitGuess,
  toggleWord,
} from './src/game/engine';
import type { StreakState } from './src/game/streak';
import { applyResult, currentStreak, emptyStreak } from './src/game/streak';
import { stockholmIsoDate } from './src/lib/date';
import { GameScreen } from './src/screens/GameScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { ResultScreen } from './src/screens/ResultScreen';
import { loadGame, loadStreak, saveGame, saveStreak } from './src/storage/storage';
import { colors, spacing } from './src/theme/tokens';

type Screen = 'home' | 'game' | 'result';

/**
 * Dagens pussel är hårdkodat tills hämtningen finns (§4), men allt runt
 * omkring är på riktigt: dagen bestäms av Europe/Stockholm (§7), spelet
 * sparas lokalt och kan återupptas (§6).
 */
export default function App() {
  const today = useMemo(() => stockholmIsoDate(), []);
  const puzzle = useMemo(() => puzzleForDate(today), [today]);

  const [screen, setScreen] = useState<Screen>('home');
  const [state, setState] = useState<GameState | null>(null);
  const [streak, setStreak] = useState<StreakState>(emptyStreak);
  const [outcome, setOutcome] = useState<GuessOutcome | null>(null);

  // Läs upp ett pågående spel och streaken innan något ritas ut.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [saved, savedStreak] = await Promise.all([loadGame(puzzle.id), loadStreak()]);
      if (cancelled) {
        return;
      }
      setState(saved ?? createGame(puzzle));
      setStreak(savedStreak);
    })();
    return () => {
      cancelled = true;
    };
  }, [puzzle]);

  // Spara vid varje ändring, så man kan stänga appen mitt i en gissning.
  useEffect(() => {
    if (state !== null) {
      void saveGame(state);
    }
  }, [state]);

  // Avslutat spel uppdaterar streaken. `applyResult` är idempotent per dag,
  // så det gör ingen skada att effekten kör om.
  useEffect(() => {
    if (state === null || state.status === 'playing') {
      return;
    }
    setStreak((current) => {
      const next = applyResult(current, puzzle.date, state.status === 'won');
      if (next !== current) {
        void saveStreak(next);
      }
      return next;
    });
  }, [state, puzzle.date]);

  // Spelet tog slut → visa resultatet.
  useEffect(() => {
    if (screen === 'game' && state !== null && state.status !== 'playing') {
      setScreen('result');
    }
  }, [screen, state]);

  const handleToggle = useCallback((word: string) => {
    setOutcome(null);
    setState((current) => (current === null ? current : toggleWord(current, word)));
  }, []);

  const handleSubmit = useCallback(() => {
    if (state === null) {
      return;
    }
    const result = submitGuess(state, puzzle);
    setState(result.state);
    setOutcome(result.outcome);
  }, [state, puzzle]);

  const handleShuffle = useCallback(() => {
    setState((current) => (current === null ? current : shuffleTiles(current)));
  }, []);

  const handleClear = useCallback(() => {
    setOutcome(null);
    setState((current) => (current === null ? current : clearSelection(current)));
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        {state === null ? (
          <View style={styles.loading}>
            <ActivityIndicator color={colors.ink} />
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.content}>
            {screen === 'home' && (
              <HomeScreen
                date={puzzle.date}
                streak={currentStreak(streak, today)}
                status={state.status}
                started={state.guesses.length > 0}
                onPlay={() => setScreen('game')}
                onSeeResult={() => setScreen('result')}
              />
            )}
            {screen === 'game' && (
              <GameScreen
                puzzle={puzzle}
                state={state}
                outcome={outcome}
                onToggleWord={handleToggle}
                onShuffle={handleShuffle}
                onClear={handleClear}
                onSubmit={handleSubmit}
                onBack={() => setScreen('home')}
              />
            )}
            {screen === 'result' && (
              <ResultScreen
                puzzle={puzzle}
                state={state}
                streak={currentStreak(streak, today)}
                longest={streak.longest}
                onBack={() => setScreen('home')}
              />
            )}
          </ScrollView>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
  },
});
