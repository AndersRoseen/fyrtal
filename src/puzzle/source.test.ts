import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';

import { puzzleForDate } from '../data/samplePuzzle';
import type { Puzzle } from '../types/puzzle';
import { resetPuzzleDecryptor, setPuzzleDecryptor } from './crypto';
import type { PuzzleEnvelope } from './envelope';
import type { FetchResult, PuzzleSourceDeps } from './source';
import { loadPuzzle, manifestUrl, puzzleUrl } from './source';

const DATE = '2026-08-12';
const BASE = 'https://example.test/fyrtal';
const puzzle = puzzleForDate(DATE);

const envelope: PuzzleEnvelope = {
  v: 1,
  id: DATE,
  date: DATE,
  nonce: 'bm9uY2U=',
  ct: 'Y2lwaGVy',
};

/** Bygger deps med en fetch som svarar utifrån en url→svar-tabell. */
function makeDeps(
  responses: Record<string, FetchResult>,
  overrides: Partial<PuzzleSourceDeps> = {},
): PuzzleSourceDeps & { written: Puzzle[]; requested: string[] } {
  const written: Puzzle[] = [];
  const requested: string[] = [];
  return {
    baseUrl: BASE,
    allowPlaintext: true,
    allowGenerated: false,
    readCache: async () => null,
    writeCache: async (value) => {
      written.push(value);
    },
    fetchJson: async (url) => {
      requested.push(url);
      return responses[url] ?? { kind: 'not-found' };
    },
    written,
    requested,
    ...overrides,
  };
}

beforeEach(() => {
  resetPuzzleDecryptor();
});

describe('url-byggare', () => {
  it('bygger pussel- och manifest-url', () => {
    assert.equal(puzzleUrl(BASE, DATE), `${BASE}/puzzles/${DATE}.json`);
    assert.equal(manifestUrl(BASE), `${BASE}/manifest.json`);
  });

  it('tål avslutande snedstreck i bas-url', () => {
    assert.equal(puzzleUrl(`${BASE}/`, DATE), `${BASE}/puzzles/${DATE}.json`);
  });
});

describe('cache', () => {
  it('använder cachen och rör inte nätet', async () => {
    const deps = makeDeps({}, { readCache: async () => puzzle });
    const result = await loadPuzzle(DATE, deps);
    assert.deepEqual(result, { status: 'ok', puzzle, source: 'cache' });
    assert.deepEqual(deps.requested, []);
  });

  it('sparar ett hämtat pussel i cachen', async () => {
    const deps = makeDeps({ [puzzleUrl(BASE, DATE)]: { kind: 'json', value: puzzle } });
    const result = await loadPuzzle(DATE, deps);
    assert.equal(result.status, 'ok');
    assert.deepEqual(deps.written, [puzzle]);
  });
});

describe('okrypterade pussel', () => {
  it('accepteras när dev-källan tillåter det', async () => {
    const deps = makeDeps({ [puzzleUrl(BASE, DATE)]: { kind: 'json', value: puzzle } });
    const result = await loadPuzzle(DATE, deps);
    assert.deepEqual(result, { status: 'ok', puzzle, source: 'network' });
  });

  it('avvisas i prod-bygget', async () => {
    const deps = makeDeps(
      { [puzzleUrl(BASE, DATE)]: { kind: 'json', value: puzzle } },
      { allowPlaintext: false },
    );
    const result = await loadPuzzle(DATE, deps);
    assert.equal(result.status, 'error');
    assert.match((result as { message: string }).message, /okrypterat/);
  });
});

describe('krypterade pussel', () => {
  it('dekrypteras via den inkopplade dekrypteraren', async () => {
    setPuzzleDecryptor(async (received, date) => {
      assert.deepEqual(received, envelope);
      assert.equal(date, DATE);
      return puzzle;
    });
    const deps = makeDeps({ [puzzleUrl(BASE, DATE)]: { kind: 'json', value: envelope } });
    const result = await loadPuzzle(DATE, deps);
    assert.deepEqual(result, { status: 'ok', puzzle, source: 'network' });
  });

  it('accepterar JSON-text från dekrypteraren', async () => {
    setPuzzleDecryptor(async () => JSON.stringify(puzzle));
    const deps = makeDeps({ [puzzleUrl(BASE, DATE)]: { kind: 'json', value: envelope } });
    const result = await loadPuzzle(DATE, deps);
    assert.equal(result.status, 'ok');
  });

  it('ger ett fel när ingen dekrypterare är inkopplad', async () => {
    const deps = makeDeps({ [puzzleUrl(BASE, DATE)]: { kind: 'json', value: envelope } });
    const result = await loadPuzzle(DATE, deps);
    assert.equal(result.status, 'error');
    assert.match((result as { message: string }).message, /dekrypterare/);
  });

  it('ger ett fel när dekrypteringen misslyckas', async () => {
    setPuzzleDecryptor(async () => {
      throw new Error('fel nyckel');
    });
    const deps = makeDeps({ [puzzleUrl(BASE, DATE)]: { kind: 'json', value: envelope } });
    const result = await loadPuzzle(DATE, deps);
    assert.deepEqual(result, { status: 'error', message: 'fel nyckel' });
  });

  it('ger ett fel när dekrypterat innehåll inte är JSON', async () => {
    setPuzzleDecryptor(async () => 'inte json {');
    const deps = makeDeps({ [puzzleUrl(BASE, DATE)]: { kind: 'json', value: envelope } });
    const result = await loadPuzzle(DATE, deps);
    assert.equal(result.status, 'error');
    assert.match((result as { message: string }).message, /giltig JSON/);
  });
});

describe('validering av hämtat pussel', () => {
  it('avvisar ett pussel med fel datum', async () => {
    const wrongDate = puzzleForDate('2026-01-01');
    const deps = makeDeps({ [puzzleUrl(BASE, DATE)]: { kind: 'json', value: wrongDate } });
    const result = await loadPuzzle(DATE, deps);
    assert.equal(result.status, 'error');
    assert.match((result as { message: string }).message, /matchar inte/);
  });

  it('avvisar ett trasigt pussel utan att cacha det', async () => {
    const broken = { ...puzzle, groups: puzzle.groups.slice(0, 3) };
    const deps = makeDeps({ [puzzleUrl(BASE, DATE)]: { kind: 'json', value: broken } });
    const result = await loadPuzzle(DATE, deps);
    assert.equal(result.status, 'error');
    assert.deepEqual(deps.written, []);
  });

  it('avvisar ett genererat pussel i prod-bygget', async () => {
    const generated = { ...puzzle, author: 'generated' };
    const deps = makeDeps({ [puzzleUrl(BASE, DATE)]: { kind: 'json', value: generated } });
    const result = await loadPuzzle(DATE, deps);
    assert.equal(result.status, 'error');
    assert.match((result as { message: string }).message, /genererade/);
  });

  it('avvisar okänt filformat', async () => {
    const deps = makeDeps({ [puzzleUrl(BASE, DATE)]: { kind: 'json', value: { hej: 1 } } });
    const result = await loadPuzzle(DATE, deps);
    assert.deepEqual(result, { status: 'error', message: 'okänt filformat' });
  });
});

describe('saknat pussel', () => {
  it('säger "inte publicerat" när datumet ligger efter sista pusslet', async () => {
    const deps = makeDeps({
      [manifestUrl(BASE)]: {
        kind: 'json',
        value: { firstDate: '2026-01-01', latestDate: '2026-08-11' },
      },
    });
    const result = await loadPuzzle(DATE, deps);
    assert.deepEqual(result, { status: 'unavailable', reason: 'not-published' });
  });

  it('säger "före första" när datumet ligger före första pusslet', async () => {
    const deps = makeDeps({
      [manifestUrl(BASE)]: {
        kind: 'json',
        value: { firstDate: '2026-09-01', latestDate: '2026-09-30' },
      },
    });
    const result = await loadPuzzle(DATE, deps);
    assert.deepEqual(result, { status: 'unavailable', reason: 'before-first' });
  });

  it('faller tillbaka på "missing" utan manifest', async () => {
    const result = await loadPuzzle(DATE, makeDeps({}));
    assert.deepEqual(result, { status: 'unavailable', reason: 'missing' });
  });

  it('faller tillbaka på "missing" när datumet ligger inom intervallet', async () => {
    const deps = makeDeps({
      [manifestUrl(BASE)]: {
        kind: 'json',
        value: { firstDate: '2026-01-01', latestDate: '2026-12-31' },
      },
    });
    const result = await loadPuzzle(DATE, deps);
    assert.deepEqual(result, { status: 'unavailable', reason: 'missing' });
  });
});

describe('nätfel', () => {
  it('rapporterar offline', async () => {
    const deps = makeDeps({ [puzzleUrl(BASE, DATE)]: { kind: 'offline' } });
    assert.deepEqual(await loadPuzzle(DATE, deps), { status: 'offline' });
  });

  it('rapporterar serverfel', async () => {
    const deps = makeDeps({
      [puzzleUrl(BASE, DATE)]: { kind: 'error', message: 'HTTP 500' },
    });
    assert.deepEqual(await loadPuzzle(DATE, deps), {
      status: 'error',
      message: 'HTTP 500',
    });
  });

  it('använder cachen även när nätet är nere', async () => {
    const deps = makeDeps(
      { [puzzleUrl(BASE, DATE)]: { kind: 'offline' } },
      { readCache: async () => puzzle },
    );
    const result = await loadPuzzle(DATE, deps);
    assert.equal(result.status, 'ok');
  });
});
