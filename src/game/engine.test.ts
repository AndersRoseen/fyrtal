import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { samplePuzzle } from '../data/samplePuzzle';
import type { Level } from '../types/puzzle';
import type { GameState } from './engine';
import {
  MAX_MISTAKES,
  canSubmit,
  clearSelection,
  createGame,
  mistakesUsed,
  shuffleTiles,
  submitGuess,
  toggleWord,
} from './engine';
import { shareGrid, shareText } from './share';

/** Deterministisk RNG så att brädet ser likadant ut i varje test. */
const fixedRng = () => 0.5;

function wordsOfLevel(level: Level): string[] {
  return samplePuzzle.groups.find((group) => group.level === level)!.words;
}

function select(state: GameState, words: string[]): GameState {
  return words.reduce(toggleWord, state);
}

function guessLevel(state: GameState, level: Level) {
  return submitGuess(select(state, wordsOfLevel(level)), samplePuzzle);
}

describe('createGame', () => {
  it('lägger ut alla 16 orden med fulla försök', () => {
    const state = createGame(samplePuzzle, fixedRng);
    assert.equal(state.order.length, 16);
    assert.equal(new Set(state.order).size, 16);
    assert.equal(state.mistakesRemaining, MAX_MISTAKES);
    assert.equal(state.status, 'playing');
    assert.deepEqual(state.solved, []);
  });

  it('shufflar så att spelordningen inte är filens ordning', () => {
    const fileOrder = samplePuzzle.groups.flatMap((group) => group.words);
    const state = createGame(samplePuzzle, fixedRng);
    assert.notDeepEqual(state.order, fileOrder);
  });
});

describe('markering', () => {
  it('markerar och avmarkerar', () => {
    const start = createGame(samplePuzzle, fixedRng);
    const word = start.order[0];
    assert.deepEqual(toggleWord(start, word).selected, [word]);
    assert.deepEqual(toggleWord(toggleWord(start, word), word).selected, []);
  });

  it('tillåter högst fyra markerade', () => {
    const state = select(createGame(samplePuzzle, fixedRng), [
      ...wordsOfLevel(1),
      ...wordsOfLevel(2).slice(0, 1),
    ]);
    assert.equal(state.selected.length, 4);
    assert.equal(state.selected.includes(wordsOfLevel(2)[0]), false);
  });

  it('aktiverar Gissa först vid exakt fyra', () => {
    const start = createGame(samplePuzzle, fixedRng);
    assert.equal(canSubmit(select(start, wordsOfLevel(1).slice(0, 3))), false);
    assert.equal(canSubmit(select(start, wordsOfLevel(1))), true);
  });

  it('rensar markeringen med avmarkera', () => {
    const state = select(createGame(samplePuzzle, fixedRng), wordsOfLevel(1));
    assert.deepEqual(clearSelection(state).selected, []);
  });

  it('ignorerar ord som inte ligger på brädet', () => {
    const start = createGame(samplePuzzle, fixedRng);
    assert.deepEqual(toggleWord(start, 'Finns inte').selected, []);
  });
});

describe('gissning', () => {
  it('låser gruppen och tar bort brickorna vid rätt', () => {
    const { state, outcome } = guessLevel(createGame(samplePuzzle, fixedRng), 1);
    assert.equal(outcome, 'correct');
    assert.deepEqual(state.solved, [{ level: 1, revealed: false }]);
    assert.equal(state.order.length, 12);
    assert.equal(
      wordsOfLevel(1).some((word) => state.order.includes(word)),
      false,
    );
    assert.deepEqual(state.selected, []);
    assert.equal(state.mistakesRemaining, MAX_MISTAKES);
  });

  it('drar av ett försök vid fel och behåller markeringen', () => {
    const selection = [...wordsOfLevel(1).slice(0, 2), ...wordsOfLevel(2).slice(0, 2)];
    const { state, outcome } = submitGuess(
      select(createGame(samplePuzzle, fixedRng), selection),
      samplePuzzle,
    );
    assert.equal(outcome, 'wrong');
    assert.equal(state.mistakesRemaining, MAX_MISTAKES - 1);
    assert.deepEqual(state.selected, selection);
    assert.equal(state.order.length, 16);
  });

  it('ger "en bort" när tre av fyra hör ihop', () => {
    const selection = [...wordsOfLevel(1).slice(0, 3), wordsOfLevel(2)[0]];
    const { outcome } = submitGuess(
      select(createGame(samplePuzzle, fixedRng), selection),
      samplePuzzle,
    );
    assert.equal(outcome, 'one-away');
  });

  it('ger inte "en bort" vid två och två', () => {
    const selection = [...wordsOfLevel(1).slice(0, 2), ...wordsOfLevel(2).slice(0, 2)];
    const { outcome } = submitGuess(
      select(createGame(samplePuzzle, fixedRng), selection),
      samplePuzzle,
    );
    assert.equal(outcome, 'wrong');
  });

  it('blockerar en upprepad gissning utan att kosta försök', () => {
    const selection = [...wordsOfLevel(1).slice(0, 2), ...wordsOfLevel(2).slice(0, 2)];
    const first = submitGuess(
      select(createGame(samplePuzzle, fixedRng), selection),
      samplePuzzle,
    );
    const second = submitGuess(first.state, samplePuzzle);
    assert.equal(second.outcome, 'already-guessed');
    assert.equal(second.state.mistakesRemaining, first.state.mistakesRemaining);
    assert.equal(second.state.guesses.length, 1);
  });

  it('blockerar samma gissning även i annan markeringsordning', () => {
    const selection = [...wordsOfLevel(1).slice(0, 2), ...wordsOfLevel(2).slice(0, 2)];
    const first = submitGuess(
      select(createGame(samplePuzzle, fixedRng), selection),
      samplePuzzle,
    );
    const reordered = select(clearSelection(first.state), [...selection].reverse());
    assert.equal(submitGuess(reordered, samplePuzzle).outcome, 'already-guessed');
  });

  it('gör ingenting med färre än fyra markerade', () => {
    const state = select(createGame(samplePuzzle, fixedRng), wordsOfLevel(1).slice(0, 3));
    const result = submitGuess(state, samplePuzzle);
    assert.equal(result.outcome, 'incomplete');
    assert.equal(result.state, state);
  });
});

describe('spelets slut', () => {
  it('vinner när alla fyra grupper är lösta', () => {
    let state = createGame(samplePuzzle, fixedRng);
    for (const level of [1, 2, 3, 4] as Level[]) {
      state = guessLevel(state, level).state;
    }
    assert.equal(state.status, 'won');
    assert.equal(state.order.length, 0);
    assert.equal(mistakesUsed(state), 0);
    assert.deepEqual(
      state.solved.map((entry) => entry.level),
      [1, 2, 3, 4],
    );
  });

  it('förlorar efter fyra felgissningar och avslöjar resten', () => {
    let state = guessLevel(createGame(samplePuzzle, fixedRng), 1).state;
    const wrongSelections = [
      [wordsOfLevel(2)[0], wordsOfLevel(3)[0], wordsOfLevel(4)[0], wordsOfLevel(2)[1]],
      [wordsOfLevel(2)[0], wordsOfLevel(3)[0], wordsOfLevel(4)[0], wordsOfLevel(3)[1]],
      [wordsOfLevel(2)[0], wordsOfLevel(3)[0], wordsOfLevel(4)[0], wordsOfLevel(4)[1]],
      [wordsOfLevel(2)[1], wordsOfLevel(3)[1], wordsOfLevel(4)[1], wordsOfLevel(2)[2]],
    ];
    for (const selection of wrongSelections) {
      state = submitGuess(select(clearSelection(state), selection), samplePuzzle).state;
    }
    assert.equal(state.status, 'lost');
    assert.equal(state.mistakesRemaining, 0);
    assert.deepEqual(
      state.solved.map((entry) => ({ ...entry })),
      [
        { level: 1, revealed: false },
        { level: 2, revealed: true },
        { level: 3, revealed: true },
        { level: 4, revealed: true },
      ],
    );
    assert.deepEqual(state.order, []);
  });

  it('tar inte emot fler gissningar efter spelets slut', () => {
    let state = createGame(samplePuzzle, fixedRng);
    for (const level of [1, 2, 3, 4] as Level[]) {
      state = guessLevel(state, level).state;
    }
    assert.equal(submitGuess(state, samplePuzzle).outcome, 'game-over');
    assert.equal(toggleWord(state, samplePuzzle.groups[0].words[0]), state);
  });
});

describe('blanda', () => {
  it('rör bara olösta brickor', () => {
    const solved = guessLevel(createGame(samplePuzzle, fixedRng), 1).state;
    let calls = 0;
    const shuffled = shuffleTiles(solved, () => {
      calls += 1;
      return 0.25;
    });
    assert.equal(shuffled.order.length, 12);
    assert.deepEqual([...shuffled.order].sort(), [...solved.order].sort());
    assert.ok(calls > 0);
  });
});

describe('delnings-sträng', () => {
  it('ger en rad per gissning i den ordning de gjordes', () => {
    let state = guessLevel(createGame(samplePuzzle, fixedRng), 2).state;
    state = submitGuess(
      select(state, [...wordsOfLevel(1).slice(0, 3), wordsOfLevel(3)[0]]),
      samplePuzzle,
    ).state;
    state = guessLevel(clearSelection(state), 1).state;

    assert.equal(shareGrid(state), ['🟩🟩🟩🟩', '🟨🟨🟨🟦', '🟨🟨🟨🟨'].join('\n'));
    assert.equal(
      shareText(state, samplePuzzle.date),
      `Fyrtal ${samplePuzzle.date}\n🟩🟩🟩🟩\n🟨🟨🟨🟦\n🟨🟨🟨🟨`,
    );
  });
});
