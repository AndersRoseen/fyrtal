/**
 * Dev-generator (plan.md §5).
 *
 * Spottar ut ett giltigt pussel så att man kan bygga och klicka runt utan
 * att först författa något. Resultatet märks `author: "generated"`, och
 * både appens prod-bygge och publiceringspipelinen avvisar den märkningen –
 * ett testpussel kan alltså inte råka gå live.
 *
 *   npx tsx scripts/generate-puzzle.ts                     # skriver till stdout
 *   npx tsx scripts/generate-puzzle.ts --date 2026-08-12
 *   npx tsx scripts/generate-puzzle.ts --out puzzles-src
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { shuffle } from '../src/game/shuffle';
import { validatePuzzle } from '../src/puzzle/validate';
import type { Level, Puzzle, PuzzleGroup } from '../src/types/puzzle';

/** Kandidatgrupper. Bara till för att fylla ett bräde – inte redaktionellt. */
const CANDIDATES: { theme: string; words: string[] }[] = [
  { theme: 'Frukter', words: ['Äpple', 'Päron', 'Banan', 'Plommon'] },
  { theme: 'Bär', words: ['Hallon', 'Blåbär', 'Lingon', 'Smultron'] },
  { theme: 'Träd', words: ['Björk', 'Gran', 'Tall', 'Ek'] },
  { theme: 'Vädertyper', words: ['Regn', 'Dimma', 'Hagel', 'Åska'] },
  { theme: 'Betyder "snabb"', words: ['Kvick', 'Rapp', 'Rask', 'Flink'] },
  { theme: 'Betyder "lugn"', words: ['Stilla', 'Rofylld', 'Trygg', 'Sansad'] },
  { theme: '___stjärna', words: ['Sjö', 'Film', 'Nord', 'Pop'] },
  { theme: '___pinne', words: ['Glass', 'Trum', 'Fisk', 'Grill'] },
  { theme: 'Musikinstrument', words: ['Fiol', 'Trumpet', 'Cello', 'Flöjt'] },
  { theme: 'Svenska sjöar', words: ['Vänern', 'Vättern', 'Mälaren', 'Siljan'] },
  { theme: 'Verktyg', words: ['Hammare', 'Tång', 'Såg', 'Skruvmejsel'] },
  { theme: 'Kryddor', words: ['Kanel', 'Kummin', 'Timjan', 'Saffran'] },
];

function parseArgs(argv: string[]): { date: string; out?: string } {
  let date = new Date().toISOString().slice(0, 10);
  let out: string | undefined;

  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--date' && argv[i + 1] !== undefined) {
      date = argv[i + 1];
      i += 1;
    } else if (argv[i] === '--out' && argv[i + 1] !== undefined) {
      out = argv[i + 1];
      i += 1;
    }
  }
  return { date, out };
}

export function generatePuzzle(date: string): Puzzle {
  // Väljer fyra grupper som inte delar något ord, så de 16 blir unika.
  const picked: typeof CANDIDATES = [];
  const used = new Set<string>();

  for (const candidate of shuffle(CANDIDATES)) {
    if (picked.length === 4) {
      break;
    }
    const words = candidate.words.map((word) => word.toLowerCase());
    if (words.some((word) => used.has(word))) {
      continue;
    }
    words.forEach((word) => used.add(word));
    picked.push(candidate);
  }

  if (picked.length < 4) {
    throw new Error('hittade inte fyra grupper utan överlappande ord');
  }

  const groups: PuzzleGroup[] = picked.map((candidate, index) => ({
    level: (index + 1) as Level,
    theme: candidate.theme,
    words: candidate.words,
  }));

  return { id: date, date, author: 'generated', groups };
}

async function main(): Promise<void> {
  const { date, out } = parseArgs(process.argv.slice(2));

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    console.error(`Ogiltigt datum: ${date}. Använd YYYY-MM-DD.`);
    process.exit(1);
  }

  const puzzle = generatePuzzle(date);

  // Generatorn får aldrig producera något valideringen underkänner.
  const errors = validatePuzzle(puzzle, { expectedDate: date, allowGenerated: true });
  if (errors.length > 0) {
    console.error(`Generatorn producerade ett ogiltigt pussel: ${errors.join('; ')}`);
    process.exit(1);
  }

  const json = `${JSON.stringify(puzzle, null, 2)}\n`;

  if (out === undefined) {
    process.stdout.write(json);
    return;
  }

  await mkdir(out, { recursive: true });
  const path = join(out, `${date}.json`);
  await writeFile(path, json, 'utf8');
  console.log(`Skrev ${path}`);
}

// Kör bara som skript, inte när testerna importerar generatePuzzle.
if (process.argv[1]?.includes('generate-puzzle')) {
  main().catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });
}
