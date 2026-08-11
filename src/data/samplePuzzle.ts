/**
 * Hårdkodat pussel för fas 1 (plan.md §11). Ersätts i fas 2 av hämtning
 * från `PUZZLE_BASE_URL` + dekryptering (§4).
 */
import type { Puzzle } from '../types/puzzle';

export const samplePuzzle: Puzzle = {
  id: '2026-08-12',
  date: '2026-08-12',
  author: 'anders',
  groups: [
    { level: 1, theme: 'Frukter', words: ['Äpple', 'Päron', 'Banan', 'Plommon'] },
    { level: 2, theme: '___stjärna', words: ['Sjö', 'Film', 'Nord', 'Pop'] },
    { level: 3, theme: 'Betyder "snabb"', words: ['Kvick', 'Rapp', 'Rask', 'Flink'] },
    { level: 4, theme: '___pinne', words: ['Glass', 'Trum', 'Fisk', 'Grill'] },
  ],
};
