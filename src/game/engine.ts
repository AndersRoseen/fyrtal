/**
 * Spel-logiken (plan.md §2). Ren och deterministisk: inga sidoeffekter,
 * inga React-beroenden. Hela tillståndet är serialiserbart så att det kan
 * sparas och återupptas rakt av i fas 2 (§6).
 */
import type { Level, Puzzle } from '../types/puzzle';
import { LEVELS, groupForLevel, groupForWord } from '../types/puzzle';
import type { Rng } from './shuffle';
import { defaultRng, shuffle } from './shuffle';

export const MAX_SELECTION = 4;
export const MAX_MISTAKES = 4;

export type GameStatus = 'playing' | 'won' | 'lost';

/** En gjord gissning – sparas i historiken för delnings-strängen (§2). */
export interface Guess {
  /** De fyra orden, i den ordning spelaren markerade dem. */
  words: string[];
  /** Nivån för respektive ord, samma ordning – rad i delnings-rutnätet. */
  levels: Level[];
  correct: boolean;
}

export interface SolvedGroup {
  level: Level;
  /** true = avslöjad vid förlust, inte löst av spelaren. */
  revealed: boolean;
}

export interface GameState {
  puzzleId: string;
  /** Spelordningen för de olösta brickorna. */
  order: string[];
  selected: string[];
  /** Lösta grupper i den ordning de löstes. */
  solved: SolvedGroup[];
  mistakesRemaining: number;
  guesses: Guess[];
  status: GameStatus;
}

export type GuessOutcome =
  | 'correct'
  | 'one-away'
  | 'wrong'
  | 'already-guessed'
  | 'incomplete'
  | 'game-over';

export interface GuessResult {
  state: GameState;
  outcome: GuessOutcome;
}

export function createGame(puzzle: Puzzle, rng: Rng = defaultRng): GameState {
  const words = puzzle.groups.flatMap((group) => group.words);
  return {
    puzzleId: puzzle.id,
    // Filens ordning läcker grupperna, så vi shufflar vid start (§3).
    order: shuffle(words, rng),
    selected: [],
    solved: [],
    mistakesRemaining: MAX_MISTAKES,
    guesses: [],
    status: 'playing',
  };
}

export function toggleWord(state: GameState, word: string): GameState {
  if (state.status !== 'playing' || !state.order.includes(word)) {
    return state;
  }
  if (state.selected.includes(word)) {
    return { ...state, selected: state.selected.filter((w) => w !== word) };
  }
  if (state.selected.length >= MAX_SELECTION) {
    return state;
  }
  return { ...state, selected: [...state.selected, word] };
}

export function clearSelection(state: GameState): GameState {
  return state.selected.length === 0 ? state : { ...state, selected: [] };
}

/** Blandar bara de olösta brickorna; markeringen behålls (§2). */
export function shuffleTiles(state: GameState, rng: Rng = defaultRng): GameState {
  if (state.status !== 'playing') {
    return state;
  }
  return { ...state, order: shuffle(state.order, rng) };
}

export function canSubmit(state: GameState): boolean {
  return state.status === 'playing' && state.selected.length === MAX_SELECTION;
}

export function submitGuess(state: GameState, puzzle: Puzzle): GuessResult {
  if (state.status !== 'playing') {
    return { state, outcome: 'game-over' };
  }
  if (state.selected.length !== MAX_SELECTION) {
    return { state, outcome: 'incomplete' };
  }
  // Samma gissning igen blockeras och kostar inget försök (§2).
  if (state.guesses.some((guess) => sameWordSet(guess.words, state.selected))) {
    return { state, outcome: 'already-guessed' };
  }

  const levels = state.selected.map((word) => levelOf(puzzle, word));
  const guess: Guess = {
    words: [...state.selected],
    levels,
    correct: isUniform(levels),
  };
  const guesses = [...state.guesses, guess];

  if (guess.correct) {
    const level = levels[0];
    const solved = [...state.solved, { level, revealed: false }];
    const order = state.order.filter((word) => !state.selected.includes(word));
    return {
      state: {
        ...state,
        order,
        selected: [],
        solved,
        guesses,
        status: solved.length === 4 ? 'won' : 'playing',
      },
      outcome: 'correct',
    };
  }

  const mistakesRemaining = state.mistakesRemaining - 1;
  const lost = mistakesRemaining === 0;
  const outcome: GuessOutcome = !lost && oneAway(levels) ? 'one-away' : 'wrong';

  return {
    state: {
      ...state,
      // Markeringen behålls efter en felgissning så man kan byta ut ett ord (§2).
      selected: lost ? [] : state.selected,
      order: lost ? [] : state.order,
      solved: lost ? revealRemaining(state.solved) : state.solved,
      mistakesRemaining,
      guesses,
      status: lost ? 'lost' : 'playing',
    },
    outcome,
  };
}

/** Nivåerna i lösnings-/avslöjandeordning, för resultatvyn (§3). */
export function solvedGroups(state: GameState, puzzle: Puzzle) {
  return state.solved.map((entry) => ({
    ...entry,
    group: groupForLevel(puzzle, entry.level),
  }));
}

export function mistakesUsed(state: GameState): number {
  return MAX_MISTAKES - state.mistakesRemaining;
}

function levelOf(puzzle: Puzzle, word: string): Level {
  const group = groupForWord(puzzle, word);
  if (!group) {
    throw new Error(`Ordet "${word}" finns inte i pusslet ${puzzle.id}`);
  }
  return group.level;
}

function isUniform(levels: readonly Level[]): boolean {
  return levels.every((level) => level === levels[0]);
}

/** "En bort": exakt tre av de fyra markerade delar grupp (§2). */
function oneAway(levels: readonly Level[]): boolean {
  const counts = new Map<Level, number>();
  for (const level of levels) {
    counts.set(level, (counts.get(level) ?? 0) + 1);
  }
  return [...counts.values()].some((count) => count === 3);
}

function sameWordSet(a: readonly string[], b: readonly string[]): boolean {
  if (a.length !== b.length) {
    return false;
  }
  const set = new Set(a);
  return b.every((word) => set.has(word));
}

/** Vid förlust avslöjas resterande grupper i svårighetsordning. */
function revealRemaining(solved: readonly SolvedGroup[]): SolvedGroup[] {
  const done = new Set(solved.map((entry) => entry.level));
  const remaining = LEVELS
    .filter((level) => !done.has(level))
    .map((level) => ({ level, revealed: true }));
  return [...solved, ...remaining];
}
