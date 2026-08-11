import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { puzzleForDate } from '../data/samplePuzzle';
import type { Puzzle } from '../types/puzzle';
import { validatePuzzle } from './validate';

const valid = puzzleForDate('2026-08-12');

function mutate(change: (puzzle: Puzzle) => void): Puzzle {
  const copy = JSON.parse(JSON.stringify(valid)) as Puzzle;
  change(copy);
  return copy;
}

describe('validatePuzzle', () => {
  it('släpper igenom ett giltigt pussel', () => {
    assert.deepEqual(validatePuzzle(valid), []);
  });

  it('kräver exakt fyra grupper', () => {
    const puzzle = mutate((p) => p.groups.pop());
    assert.match(validatePuzzle(puzzle).join(), /exakt 4 grupper/);
  });

  it('kräver exakt fyra ord per grupp', () => {
    const puzzle = mutate((p) => p.groups[0].words.pop());
    assert.match(validatePuzzle(puzzle).join(), /exakt 4 ord/);
  });

  it('kräver att varje nivå förekommer en gång', () => {
    const puzzle = mutate((p) => {
      p.groups[1].level = 1;
    });
    assert.match(validatePuzzle(puzzle).join(), /flera gånger/);
  });

  it('upptäcker dubbletter oavsett skiftläge', () => {
    const puzzle = mutate((p) => {
      p.groups[1].words[0] = p.groups[0].words[0].toUpperCase();
    });
    assert.match(validatePuzzle(puzzle).join(), /förekommer flera gånger/);
  });

  it('kräver icke-tomt tema', () => {
    const puzzle = mutate((p) => {
      p.groups[2].theme = '   ';
    });
    assert.match(validatePuzzle(puzzle).join(), /theme får inte vara tomt/);
  });

  it('kräver att datumet matchar filnamnet', () => {
    assert.match(
      validatePuzzle(valid, { expectedDate: '2026-08-13' }).join(),
      /matchar inte/,
    );
    assert.deepEqual(validatePuzzle(valid, { expectedDate: '2026-08-12' }), []);
  });

  it('avvisar genererade pussel som standard', () => {
    const puzzle = mutate((p) => {
      p.author = 'generated';
    });
    assert.match(validatePuzzle(puzzle).join(), /genererade pussel/);
    assert.deepEqual(validatePuzzle(puzzle, { allowGenerated: true }), []);
  });

  it('kräver en author', () => {
    const puzzle = mutate((p) => {
      p.author = '';
    });
    assert.match(validatePuzzle(puzzle).join(), /author saknas/);
  });

  it('avvisar skräp utan att kasta', () => {
    assert.match(validatePuzzle(null).join(), /inte ett objekt/);
    assert.match(validatePuzzle('nope').join(), /inte ett objekt/);
    assert.ok(validatePuzzle({}).length > 0);
  });
});
