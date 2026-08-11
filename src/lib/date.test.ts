import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  daysBetween,
  formatCountdown,
  formatLongDate,
  msUntilNextStockholmMidnight,
  stockholmIsoDate,
  stockholmOffsetMinutes,
} from './date';

describe('svensk tidszon', () => {
  it('är CET på vintern och CEST på sommaren', () => {
    assert.equal(stockholmOffsetMinutes(new Date('2026-01-15T12:00:00Z')), 60);
    assert.equal(stockholmOffsetMinutes(new Date('2026-07-15T12:00:00Z')), 120);
  });

  it('växlar vid sista söndagen i mars', () => {
    // 2026 infaller den 29 mars.
    assert.equal(stockholmOffsetMinutes(new Date('2026-03-29T00:59:00Z')), 60);
    assert.equal(stockholmOffsetMinutes(new Date('2026-03-29T01:00:00Z')), 120);
  });

  it('växlar tillbaka vid sista söndagen i oktober', () => {
    // 2026 infaller den 25 oktober.
    assert.equal(stockholmOffsetMinutes(new Date('2026-10-25T00:59:00Z')), 120);
    assert.equal(stockholmOffsetMinutes(new Date('2026-10-25T01:00:00Z')), 60);
  });
});

describe('stockholmIsoDate', () => {
  it('är redan nästa dag strax före svensk midnatt', () => {
    // 23:30 UTC på sommaren = 01:30 svensk tid dagen efter.
    assert.equal(stockholmIsoDate(new Date('2026-08-11T23:30:00Z')), '2026-08-12');
  });

  it('är kvar på samma dag tidigt på morgonen', () => {
    assert.equal(stockholmIsoDate(new Date('2026-08-11T06:00:00Z')), '2026-08-11');
  });

  it('byter dag vid svensk midnatt, inte UTC-midnatt', () => {
    // 22:30 UTC på sommaren = 00:30 svensk tid dagen efter.
    assert.equal(stockholmIsoDate(new Date('2026-08-11T21:30:00Z')), '2026-08-11');
    assert.equal(stockholmIsoDate(new Date('2026-08-11T22:30:00Z')), '2026-08-12');
  });

  it('klarar årsskifte', () => {
    assert.equal(stockholmIsoDate(new Date('2026-12-31T23:30:00Z')), '2027-01-01');
  });
});

describe('msUntilNextStockholmMidnight', () => {
  it('räknar ner till svensk midnatt', () => {
    // 22:00 UTC på sommaren = 00:00 svensk tid → ett helt dygn kvar.
    const ms = msUntilNextStockholmMidnight(new Date('2026-08-11T21:00:00Z'));
    assert.equal(ms, 60 * 60 * 1000);
  });

  it('ligger alltid inom ett dygn', () => {
    for (const iso of ['2026-01-01T00:00:00Z', '2026-06-15T12:34:56Z']) {
      const ms = msUntilNextStockholmMidnight(new Date(iso));
      assert.ok(ms > 0 && ms <= 24 * 60 * 60 * 1000, `${iso} gav ${ms}`);
    }
  });
});

describe('daysBetween', () => {
  it('räknar hela dygn', () => {
    assert.equal(daysBetween('2026-08-11', '2026-08-12'), 1);
    assert.equal(daysBetween('2026-08-11', '2026-08-11'), 0);
    assert.equal(daysBetween('2026-08-12', '2026-08-11'), -1);
  });

  it('räknar över månads- och årsskifte', () => {
    assert.equal(daysBetween('2026-08-31', '2026-09-01'), 1);
    assert.equal(daysBetween('2026-12-31', '2027-01-01'), 1);
  });

  it('påverkas inte av sommartidsomställningen', () => {
    assert.equal(daysBetween('2026-03-28', '2026-03-29'), 1);
    assert.equal(daysBetween('2026-10-24', '2026-10-25'), 1);
  });
});

describe('formatering', () => {
  it('skriver ut datum på svenska', () => {
    assert.equal(formatLongDate('2026-08-12'), 'onsdag 12 augusti 2026');
  });

  it('formaterar nedräkningen', () => {
    assert.equal(formatCountdown(0), '00:00:00');
    assert.equal(formatCountdown(3661000), '01:01:01');
    assert.equal(formatCountdown(-5000), '00:00:00');
  });
});
