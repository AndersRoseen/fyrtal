import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { samplePuzzle } from './src/data/samplePuzzle';
import type { GameState, GuessOutcome } from './src/game/engine';
import { clearSelection, createGame, shuffleTiles, submitGuess, toggleWord } from './src/game/engine';
import { GameScreen } from './src/screens/GameScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { ResultScreen } from './src/screens/ResultScreen';
import { colors, spacing } from './src/theme/tokens';

type Screen = 'home' | 'game' | 'result';

/**
 * Fas 1 (plan.md §11): tre vyer, hårdkodat pussel och spel-logiken.
 *
 * Tillståndet bor här i minnet. Fas 2 lyfter ut det till lokal lagring så
 * man kan återuppta ett pågående spel (§6) och räkna streak (§7); fas 2
 * byter också `samplePuzzle` mot hämtning + dekryptering (§4).
 */
export default function App() {
  const puzzle = samplePuzzle;
  const [screen, setScreen] = useState<Screen>('home');
  const [state, setState] = useState<GameState>(() => createGame(puzzle));
  const [outcome, setOutcome] = useState<GuessOutcome | null>(null);

  // Ingen lagring än, så streaken är alltid 0 tills §7 är byggd.
  const streak = 0;

  const handleToggle = useCallback((word: string) => {
    setOutcome(null);
    setState((current) => toggleWord(current, word));
  }, []);

  const handleSubmit = useCallback(() => {
    const result = submitGuess(state, puzzle);
    setState(result.state);
    setOutcome(result.outcome);
  }, [state, puzzle]);

  const handleShuffle = useCallback(() => {
    setState((current) => shuffleTiles(current));
  }, []);

  const handleClear = useCallback(() => {
    setOutcome(null);
    setState((current) => clearSelection(current));
  }, []);

  // Spelet är slut → visa resultatet.
  useEffect(() => {
    if (screen === 'game' && state.status !== 'playing') {
      setScreen('result');
    }
  }, [screen, state.status]);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <ScrollView contentContainerStyle={styles.content}>
          {screen === 'home' && (
            <HomeScreen
              date={puzzle.date}
              streak={streak}
              status={state.status}
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
              streak={streak}
              onBack={() => setScreen('home')}
            />
          )}
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
  },
});
