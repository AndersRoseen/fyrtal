/**
 * Hämtning av dagens pussel (plan.md §4).
 *
 * Ordningen är cache först, nät sedan. Det ger tre saker på en gång: appen
 * fungerar offline, ett redan hämtat pussel överlever att filen ändras
 * eller försvinner, och man slipper ett nätanrop vid varje appstart.
 */
import type { Puzzle } from '../types/puzzle';
import { getPuzzleDecryptor } from './crypto';
import type { PuzzleManifest } from './envelope';
import { isEnvelope, isManifest, looksLikePlaintextPuzzle } from './envelope';
import { validatePuzzle } from './validate';

export type PuzzleUnavailableReason =
  /** Datumet ligger efter sista publicerade pusslet – "inget pussel ännu". */
  | 'not-published'
  /** Datumet ligger före det första pusslet – enhetsklockan är nog fel. */
  | 'before-first'
  /** Filen finns inte, utan att manifestet förklarar varför. */
  | 'missing';

export type PuzzleLoad =
  | { status: 'ok'; puzzle: Puzzle; source: 'cache' | 'network' }
  | { status: 'unavailable'; reason: PuzzleUnavailableReason }
  | { status: 'offline' }
  | { status: 'error'; message: string };

export interface PuzzleSourceDeps {
  baseUrl: string;
  /** Dev-källan får servera okrypterade pussel (§5). Aldrig i prod. */
  allowPlaintext: boolean;
  /** Prod-grinden (§5): `author: "generated"` släpps bara igenom i dev. */
  allowGenerated: boolean;
  readCache: (date: string) => Promise<Puzzle | null>;
  writeCache: (puzzle: Puzzle) => Promise<void>;
  /** Injicerbart för testernas skull. */
  fetchJson?: (url: string) => Promise<FetchResult>;
  timeoutMs?: number;
}

export type FetchResult =
  | { kind: 'json'; value: unknown }
  | { kind: 'not-found' }
  | { kind: 'offline' }
  | { kind: 'error'; message: string };

const DEFAULT_TIMEOUT_MS = 10_000;

export async function loadPuzzle(date: string, deps: PuzzleSourceDeps): Promise<PuzzleLoad> {
  const cached = await deps.readCache(date);
  if (cached !== null) {
    return { status: 'ok', puzzle: cached, source: 'cache' };
  }

  const fetchJson = deps.fetchJson ?? makeFetchJson(deps.timeoutMs ?? DEFAULT_TIMEOUT_MS);
  const response = await fetchJson(puzzleUrl(deps.baseUrl, date));

  switch (response.kind) {
    case 'offline':
      return { status: 'offline' };
    case 'error':
      return { status: 'error', message: response.message };
    case 'not-found':
      return { status: 'unavailable', reason: await explainMissing(date, deps, fetchJson) };
    case 'json':
      break;
  }

  let raw: unknown = response.value;

  if (isEnvelope(raw)) {
    try {
      raw = await getPuzzleDecryptor()(raw, date);
    } catch (error) {
      return { status: 'error', message: describe(error) };
    }
    // Dekrypteraren får returnera JSON-text lika gärna som ett objekt.
    if (typeof raw === 'string') {
      try {
        raw = JSON.parse(raw);
      } catch {
        return { status: 'error', message: 'dekrypterat pussel är inte giltig JSON' };
      }
    }
  } else if (looksLikePlaintextPuzzle(raw)) {
    if (!deps.allowPlaintext) {
      return { status: 'error', message: 'okrypterat pussel avvisat i produktionsbygget' };
    }
  } else {
    return { status: 'error', message: 'okänt filformat' };
  }

  const errors = validatePuzzle(raw, {
    expectedDate: date,
    allowGenerated: deps.allowGenerated,
  });
  if (errors.length > 0) {
    return { status: 'error', message: errors.join('; ') };
  }

  const puzzle = raw as Puzzle;
  await deps.writeCache(puzzle);
  return { status: 'ok', puzzle, source: 'network' };
}

/**
 * En 404 kan betyda "imorgondagens pussel finns inte än" eller "din klocka
 * är fel". Manifestet skiljer dem åt; saknas det får man det vaga svaret.
 */
async function explainMissing(
  date: string,
  deps: PuzzleSourceDeps,
  fetchJson: (url: string) => Promise<FetchResult>,
): Promise<PuzzleUnavailableReason> {
  const response = await fetchJson(manifestUrl(deps.baseUrl));
  if (response.kind !== 'json' || !isManifest(response.value)) {
    return 'missing';
  }
  const manifest: PuzzleManifest = response.value;
  if (date > manifest.latestDate) {
    return 'not-published';
  }
  if (date < manifest.firstDate) {
    return 'before-first';
  }
  return 'missing';
}

export function puzzleUrl(baseUrl: string, date: string): string {
  return `${trimSlash(baseUrl)}/puzzles/${date}.json`;
}

export function manifestUrl(baseUrl: string): string {
  return `${trimSlash(baseUrl)}/manifest.json`;
}

function trimSlash(url: string): string {
  return url.replace(/\/+$/, '');
}

function describe(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/**
 * `fetch` skiljer inte på "nere" och "finns inte", och hänger gärna kvar på
 * ett dåligt nät – därför timeout och en uttrycklig uppdelning här.
 */
function makeFetchJson(timeoutMs: number): (url: string) => Promise<FetchResult> {
  return async (url: string): Promise<FetchResult> => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, { signal: controller.signal });
      if (response.status === 404) {
        return { kind: 'not-found' };
      }
      if (!response.ok) {
        return { kind: 'error', message: `HTTP ${response.status}` };
      }
      return { kind: 'json', value: await response.json() };
    } catch {
      // Avbruten, timeout eller inget nät – alla behandlas som offline.
      return { kind: 'offline' };
    } finally {
      clearTimeout(timer);
    }
  };
}
