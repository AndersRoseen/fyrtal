/**
 * Streak-regeln (plan.md §7). Ren logik, ingen lagring – `storage.ts`
 * sköter läsning och skrivning.
 *
 * Regeln följer NYT:s vinst-streak: en vinst dagen efter en vinst ökar
 * streaken, allt annat börjar om. En förlust eller en missad dag nollar.
 */
import { daysBetween } from '../lib/date';

export interface StreakState {
  current: number;
  longest: number;
  /** Datumet för det senast avslutade spelet, `YYYY-MM-DD`. */
  lastResultDate: string | null;
}

export const emptyStreak: StreakState = {
  current: 0,
  longest: 0,
  lastResultDate: null,
};

/**
 * Uppdaterar streaken när dagens spel avslutas.
 *
 * `current > 0` innebär att det senaste resultatet var en vinst, eftersom
 * en förlust alltid nollställer – så det räcker för att veta om gårdagen
 * var en vinst.
 */
export function applyResult(
  streak: StreakState,
  date: string,
  won: boolean,
): StreakState {
  // Samma dag två gånger ska inte räknas dubbelt.
  if (streak.lastResultDate === date) {
    return streak;
  }

  if (!won) {
    return { ...streak, current: 0, lastResultDate: date };
  }

  const continued =
    streak.current > 0 &&
    streak.lastResultDate !== null &&
    daysBetween(streak.lastResultDate, date) === 1;
  const current = continued ? streak.current + 1 : 1;

  return {
    current,
    longest: Math.max(streak.longest, current),
    lastResultDate: date,
  };
}

/**
 * Streaken som den ska visas idag. En missad dag bryter den, så ett gammalt
 * `current` får inte ligga kvar och se levande ut i startvyn.
 */
export function currentStreak(streak: StreakState, today: string): number {
  if (streak.current === 0 || streak.lastResultDate === null) {
    return 0;
  }
  return daysBetween(streak.lastResultDate, today) <= 1 ? streak.current : 0;
}
