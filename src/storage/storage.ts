/**
 * Lokal lagring (plan.md §6). Ingen inloggning, ingen molnsync.
 *
 * Spel-tillståndet nycklas på pusslets id, så gårdagens spel ligger kvar
 * och dagens kan återupptas mitt i. Gissnings-historiken följer med i
 * `GameState`, vilket är det som gör delnings-strängen återskapbar (§2).
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

import type { GameState } from '../game/engine';
import type { StreakState } from '../game/streak';
import { emptyStreak } from '../game/streak';

const GAME_PREFIX = 'fyrtal:game:';
const STREAK_KEY = 'fyrtal:streak';

function gameKey(puzzleId: string): string {
  return `${GAME_PREFIX}${puzzleId}`;
}

/**
 * Lagringen får aldrig sänka appen. Trasig eller gammal JSON behandlas som
 * "inget sparat" – man förlorar på sin höjd ett pågående spel.
 */
async function readJson<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw === null ? null : (JSON.parse(raw) as T);
  } catch {
    return null;
  }
}

async function writeJson(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Full disk eller nekad lagring – spelet fungerar ändå, utan att spara.
  }
}

export async function loadGame(puzzleId: string): Promise<GameState | null> {
  const state = await readJson<GameState>(gameKey(puzzleId));
  return state !== null && isGameState(state) && state.puzzleId === puzzleId ? state : null;
}

export async function saveGame(state: GameState): Promise<void> {
  await writeJson(gameKey(state.puzzleId), state);
}

export async function loadStreak(): Promise<StreakState> {
  const streak = await readJson<StreakState>(STREAK_KEY);
  return streak !== null && isStreakState(streak) ? streak : emptyStreak;
}

export async function saveStreak(streak: StreakState): Promise<void> {
  await writeJson(STREAK_KEY, streak);
}

/** Rensar allt Fyrtal skrivit. Används av utvecklarverktygen. */
export async function clearAll(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const ours = keys.filter(
      (key) => key.startsWith(GAME_PREFIX) || key === STREAK_KEY,
    );
    if (ours.length > 0) {
      await AsyncStorage.multiRemove(ours);
    }
  } catch {
    // Inget att göra – rensningen är bäst-möjliga-försök.
  }
}

/**
 * Grundkoll på formen. Ett sparat spel från en äldre version ska inte
 * kunna krascha appen, så vi kastar det hellre än att lita på det.
 */
function isGameState(value: unknown): value is GameState {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const state = value as Partial<GameState>;
  return (
    typeof state.puzzleId === 'string' &&
    Array.isArray(state.order) &&
    Array.isArray(state.selected) &&
    Array.isArray(state.solved) &&
    Array.isArray(state.guesses) &&
    typeof state.mistakesRemaining === 'number' &&
    (state.status === 'playing' || state.status === 'won' || state.status === 'lost')
  );
}

function isStreakState(value: unknown): value is StreakState {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const streak = value as Partial<StreakState>;
  return (
    typeof streak.current === 'number' &&
    typeof streak.longest === 'number' &&
    (streak.lastResultDate === null || typeof streak.lastResultDate === 'string')
  );
}
