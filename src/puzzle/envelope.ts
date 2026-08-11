/**
 * Det publicerade filformatet (plan.md §4).
 *
 * `id`/`date` ligger i klartext för routing, resten är krypterat. Appen
 * hämtar antingen en sådan envelope (prod) eller ett rått pussel (dev-
 * källan enligt §5) – därför skiljer vi på formen redan här.
 */
import type { Puzzle } from '../types/puzzle';

export interface PuzzleEnvelope {
  /** Formatversion, så vi kan byta chiffer utan att gamla appar gissar fel. */
  v: number;
  id: string;
  date: string;
  /** Base64. */
  nonce: string;
  /** Base64, krypterad `Puzzle`-JSON. */
  ct: string;
}

/** `{ firstDate, latestDate }` – valfri, ger snyggare fel (§4). */
export interface PuzzleManifest {
  firstDate: string;
  latestDate: string;
}

export function isEnvelope(value: unknown): value is PuzzleEnvelope {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const envelope = value as Partial<PuzzleEnvelope>;
  return (
    typeof envelope.v === 'number' &&
    typeof envelope.date === 'string' &&
    typeof envelope.nonce === 'string' &&
    typeof envelope.ct === 'string'
  );
}

/** Ett rått, okrypterat pussel – bara dev-källan serverar sådana. */
export function looksLikePlaintextPuzzle(value: unknown): value is Puzzle {
  return (
    typeof value === 'object' &&
    value !== null &&
    Array.isArray((value as Partial<Puzzle>).groups)
  );
}

export function isManifest(value: unknown): value is PuzzleManifest {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const manifest = value as Partial<PuzzleManifest>;
  return typeof manifest.firstDate === 'string' && typeof manifest.latestDate === 'string';
}
