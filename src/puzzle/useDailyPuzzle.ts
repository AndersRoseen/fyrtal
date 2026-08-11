/**
 * Kopplar ihop konfiguration, hämtning och cache till ett enda värde som
 * vyerna kan konsumera (plan.md §4).
 */
import { useCallback, useEffect, useState } from 'react';

import {
  ALLOW_GENERATED_PUZZLES,
  ALLOW_PLAINTEXT_PUZZLES,
  PUZZLE_BASE_URL,
  USING_BUNDLED_SAMPLE,
} from '../config/env';
import { puzzleForDate } from '../data/samplePuzzle';
import { loadCachedPuzzle, saveCachedPuzzle } from '../storage/storage';
import type { PuzzleLoad } from './source';
import { loadPuzzle } from './source';

export type DailyPuzzle = { status: 'loading' } | PuzzleLoad;

export function useDailyPuzzle(date: string): {
  puzzle: DailyPuzzle;
  retry: () => void;
} {
  const [puzzle, setPuzzle] = useState<DailyPuzzle>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  const retry = useCallback(() => {
    setPuzzle({ status: 'loading' });
    setAttempt((value) => value + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    // Ingen källa konfigurerad → kör på det inbyggda exempelpusslet, så att
    // appen går att starta direkt efter en klon (§5).
    if (USING_BUNDLED_SAMPLE) {
      setPuzzle({ status: 'ok', puzzle: puzzleForDate(date), source: 'cache' });
      return;
    }

    (async () => {
      const result = await loadPuzzle(date, {
        baseUrl: PUZZLE_BASE_URL,
        allowPlaintext: ALLOW_PLAINTEXT_PUZZLES,
        allowGenerated: ALLOW_GENERATED_PUZZLES,
        readCache: (day) => loadCachedPuzzle(day, ALLOW_GENERATED_PUZZLES),
        writeCache: saveCachedPuzzle,
      });
      if (!cancelled) {
        setPuzzle(result);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [date, attempt]);

  return { puzzle, retry };
}
