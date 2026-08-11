import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { applyResult, currentStreak, emptyStreak } from './streak';

describe('applyResult', () => {
  it('startar streaken på 1 vid första vinsten', () => {
    const streak = applyResult(emptyStreak, '2026-08-11', true);
    assert.deepEqual(streak, { current: 1, longest: 1, lastResultDate: '2026-08-11' });
  });

  it('ökar när man vinner dagen efter en vinst', () => {
    let streak = applyResult(emptyStreak, '2026-08-11', true);
    streak = applyResult(streak, '2026-08-12', true);
    assert.equal(streak.current, 2);
    assert.equal(streak.longest, 2);
  });

  it('börjar om på 1 när en dag hoppats över', () => {
    let streak = applyResult(emptyStreak, '2026-08-11', true);
    streak = applyResult(streak, '2026-08-12', true);
    streak = applyResult(streak, '2026-08-15', true);
    assert.equal(streak.current, 1);
    assert.equal(streak.longest, 2);
  });

  it('nollställer vid förlust', () => {
    let streak = applyResult(emptyStreak, '2026-08-11', true);
    streak = applyResult(streak, '2026-08-12', false);
    assert.equal(streak.current, 0);
    assert.equal(streak.longest, 1);
    assert.equal(streak.lastResultDate, '2026-08-12');
  });

  it('börjar om på 1 efter en förlust dagen innan', () => {
    let streak = applyResult(emptyStreak, '2026-08-11', false);
    streak = applyResult(streak, '2026-08-12', true);
    assert.equal(streak.current, 1);
  });

  it('räknar inte samma dag två gånger', () => {
    const first = applyResult(emptyStreak, '2026-08-11', true);
    const second = applyResult(first, '2026-08-11', true);
    assert.equal(second, first);
  });

  it('behåller längsta streaken över ett avbrott', () => {
    let streak = emptyStreak;
    for (const date of ['2026-08-01', '2026-08-02', '2026-08-03']) {
      streak = applyResult(streak, date, true);
    }
    streak = applyResult(streak, '2026-08-04', false);
    streak = applyResult(streak, '2026-08-05', true);
    assert.equal(streak.current, 1);
    assert.equal(streak.longest, 3);
  });

  it('klarar månadsskifte', () => {
    let streak = applyResult(emptyStreak, '2026-08-31', true);
    streak = applyResult(streak, '2026-09-01', true);
    assert.equal(streak.current, 2);
  });
});

describe('currentStreak', () => {
  it('visar streaken samma dag som resultatet', () => {
    const streak = applyResult(emptyStreak, '2026-08-11', true);
    assert.equal(currentStreak(streak, '2026-08-11'), 1);
  });

  it('lever vidare dagen efter, innan man spelat', () => {
    const streak = applyResult(emptyStreak, '2026-08-11', true);
    assert.equal(currentStreak(streak, '2026-08-12'), 1);
  });

  it('är bruten när en dag missats', () => {
    const streak = applyResult(emptyStreak, '2026-08-11', true);
    assert.equal(currentStreak(streak, '2026-08-13'), 0);
  });

  it('är 0 utan resultat', () => {
    assert.equal(currentStreak(emptyStreak, '2026-08-11'), 0);
  });
});
