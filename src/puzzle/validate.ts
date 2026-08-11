/**
 * Pusselvalidering (plan.md §8, steg 1).
 *
 * Ren och beroendefri med flit: samma modul ska kunna köras av
 * `build-puzzles.ts` i pipelinen som av appen efter dekryptering. Appen
 * litar inte på att en hämtad fil är hel – en trasig fil ska ge ett
 * begripligt fel, inte ett halvt spelbart bräde.
 */
import type { Level, Puzzle, PuzzleGroup } from '../types/puzzle';
import { LEVELS } from '../types/puzzle';

export interface ValidationOptions {
  /** Filnamnets datum. Anges det måste pusslets `date` stämma överens. */
  expectedDate?: string;
  /**
   * Prod-grinden (§5): genererade pussel får aldrig gå live. Sätts till
   * true bara i dev-bygget och i generatorns egna tester.
   */
  allowGenerated?: boolean;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function isLevel(value: unknown): value is Level {
  return LEVELS.includes(value as Level);
}

/** Returnerar alla fel den hittar, tom lista = giltigt pussel. */
export function validatePuzzle(value: unknown, options: ValidationOptions = {}): string[] {
  const errors: string[] = [];

  if (typeof value !== 'object' || value === null) {
    return ['pusslet är inte ett objekt'];
  }
  const puzzle = value as Partial<Puzzle>;

  if (typeof puzzle.date !== 'string' || !ISO_DATE.test(puzzle.date)) {
    errors.push('date saknas eller är inte YYYY-MM-DD');
  } else if (options.expectedDate !== undefined && puzzle.date !== options.expectedDate) {
    errors.push(`date ${puzzle.date} matchar inte ${options.expectedDate}`);
  }

  if (typeof puzzle.id !== 'string' || puzzle.id.length === 0) {
    errors.push('id saknas');
  }

  if (typeof puzzle.author !== 'string' || puzzle.author.trim().length === 0) {
    errors.push('author saknas');
  } else if (puzzle.author === 'generated' && options.allowGenerated !== true) {
    errors.push('genererade pussel släpps inte igenom');
  }

  if (!Array.isArray(puzzle.groups) || puzzle.groups.length !== 4) {
    errors.push('pusslet måste ha exakt 4 grupper');
    return errors;
  }

  const seenLevels = new Set<Level>();
  const seenWords = new Set<string>();

  puzzle.groups.forEach((group: PuzzleGroup, index: number) => {
    const label = `grupp ${index + 1}`;

    if (!isLevel(group?.level)) {
      errors.push(`${label}: level måste vara 1–4`);
    } else if (seenLevels.has(group.level)) {
      errors.push(`${label}: level ${group.level} förekommer flera gånger`);
    } else {
      seenLevels.add(group.level);
    }

    if (typeof group?.theme !== 'string' || group.theme.trim().length === 0) {
      errors.push(`${label}: theme får inte vara tomt`);
    }

    if (!Array.isArray(group?.words) || group.words.length !== 4) {
      errors.push(`${label}: måste ha exakt 4 ord`);
      return;
    }

    group.words.forEach((word) => {
      if (typeof word !== 'string' || word.trim().length === 0) {
        errors.push(`${label}: tomt ord`);
        return;
      }
      // Skiftlägesokänslig unikhet (§8) – annars kan två brickor se lika ut.
      const key = word.trim().toLowerCase();
      if (seenWords.has(key)) {
        errors.push(`ordet "${word}" förekommer flera gånger`);
      }
      seenWords.add(key);
    });
  });

  return errors;
}

export function isValidPuzzle(
  value: unknown,
  options: ValidationOptions = {},
): value is Puzzle {
  return validatePuzzle(value, options).length === 0;
}
