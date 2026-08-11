/**
 * Puzzle-schemat (plan.md §3).
 *
 * Samma typer används av appen, generatorn och valideringen (§10), så
 * håll den här filen fri från React Native-beroenden.
 */

/** 1 = lättast, 4 = klurigast. Motsvarar NYT:s gul → lila. */
export type Level = 1 | 2 | 3 | 4;

export const LEVELS: readonly Level[] = [1, 2, 3, 4];

export interface PuzzleGroup {
  level: Level;
  theme: string;
  /** Exakt fyra ord. */
  words: string[];
}

export interface Puzzle {
  /** Samma som `date` i dagens upplägg, men egen nyckel för lagring (§6). */
  id: string;
  /** ISO-datum, `YYYY-MM-DD`. */
  date: string;
  /** `"generated"` markerar testpussel som aldrig får gå live (§5). */
  author: string;
  /** Exakt fyra grupper, en per nivå. */
  groups: PuzzleGroup[];
}

/** Slår upp vilken grupp ett ord tillhör. */
export function groupForWord(puzzle: Puzzle, word: string): PuzzleGroup | undefined {
  return puzzle.groups.find((group) => group.words.includes(word));
}

export function groupForLevel(puzzle: Puzzle, level: Level): PuzzleGroup {
  const group = puzzle.groups.find((candidate) => candidate.level === level);
  if (!group) {
    throw new Error(`Pusslet ${puzzle.id} saknar nivå ${level}`);
  }
  return group;
}

/** Alla 16 orden, i filens ordning (alltså inte spelordningen – se §3). */
export function allWords(puzzle: Puzzle): string[] {
  return puzzle.groups.flatMap((group) => group.words);
}
