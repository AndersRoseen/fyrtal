/**
 * Hårdkodat pussel (plan.md §11, fas 1). Ersätts av hämtning från
 * `PUZZLE_BASE_URL` + dekryptering (§4) – då kommer `id`/`date` från filen
 * i stället för att sättas här.
 */
import type { Puzzle } from '../types/puzzle';

const sampleGroups: Puzzle['groups'] = [
  { level: 1, theme: 'Frukter', words: ['Äpple', 'Päron', 'Banan', 'Plommon'] },
  { level: 2, theme: '___stjärna', words: ['Sjö', 'Film', 'Nord', 'Pop'] },
  { level: 3, theme: 'Betyder "snabb"', words: ['Kvick', 'Rapp', 'Rask', 'Flink'] },
  { level: 4, theme: '___pinne', words: ['Glass', 'Trum', 'Fisk', 'Grill'] },
];

/**
 * Samma pussel oavsett dag, men daterat till idag så att lagring och
 * streak arbetar mot riktiga datum redan nu (§6, §7).
 */
export function puzzleForDate(date: string): Puzzle {
  return { id: date, date, author: 'anders', groups: sampleGroups };
}
