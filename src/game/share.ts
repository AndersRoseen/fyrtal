/**
 * Delnings-strängen (plan.md §2): ett rutnät av färgrutor, en rad per
 * gissning i den ordning de gjordes. Byggs enbart från gissnings-historiken,
 * så den kan återskapas för ett redan spelat pussel (§6).
 */
import type { Level } from '../types/puzzle';
import type { GameState } from './engine';

/** Emoji per nivå – speglar palettens sand/salvia/dammig blå/plommon (§9). */
const SQUARE: Record<Level, string> = {
  1: '🟨',
  2: '🟩',
  3: '🟦',
  4: '🟪',
};

export function shareGrid(state: GameState): string {
  return state.guesses
    .map((guess) => guess.levels.map((level) => SQUARE[level]).join(''))
    .join('\n');
}

export function shareText(state: GameState, date: string): string {
  const heading = `Fyrtal ${date}`;
  const grid = shareGrid(state);
  return grid ? `${heading}\n${grid}` : heading;
}
