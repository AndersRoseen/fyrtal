import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { validatePuzzle } from '../src/puzzle/validate';
import { generatePuzzle } from './generate-puzzle';

describe('generate-puzzle', () => {
  it('producerar ett pussel som validerar', () => {
    for (let i = 0; i < 50; i += 1) {
      const puzzle = generatePuzzle('2026-08-12');
      assert.deepEqual(
        validatePuzzle(puzzle, { expectedDate: '2026-08-12', allowGenerated: true }),
        [],
      );
    }
  });

  it('märker pusslet som genererat, så prod-grinden fångar det', () => {
    const puzzle = generatePuzzle('2026-08-12');
    assert.equal(puzzle.author, 'generated');
    assert.match(validatePuzzle(puzzle).join(), /genererade pussel/);
  });

  it('ger 16 unika ord', () => {
    for (let i = 0; i < 50; i += 1) {
      const words = generatePuzzle('2026-08-12').groups.flatMap((group) => group.words);
      assert.equal(words.length, 16);
      assert.equal(new Set(words.map((word) => word.toLowerCase())).size, 16);
    }
  });

  it('ger varje nivå exakt en gång', () => {
    const levels = generatePuzzle('2026-08-12').groups.map((group) => group.level);
    assert.deepEqual([...levels].sort(), [1, 2, 3, 4]);
  });
});
