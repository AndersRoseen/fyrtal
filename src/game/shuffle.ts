/**
 * Fisher–Yates. Tar in en RNG så att tester kan vara deterministiska
 * och så att vi senare kan seeda per pussel om vi vill.
 */
export type Rng = () => number;

export const defaultRng: Rng = Math.random;

export function shuffle<T>(items: readonly T[], rng: Rng = defaultRng): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
