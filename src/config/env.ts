/**
 * Miljökonfiguration (plan.md §5).
 *
 * `EXPO_PUBLIC_`-variabler bakas in av Metro vid bygget, så dev- och
 * prod-bygget kan peka på olika pusselkällor utan kodändring. Sätt dem i
 * `.env` lokalt och som EAS-secrets i pipelinen (§8B).
 *
 * Utan `EXPO_PUBLIC_PUZZLE_BASE_URL` faller appen tillbaka på det inbyggda
 * exempelpusslet, så den går att köra direkt efter en `git clone`.
 */

export const PUZZLE_BASE_URL = process.env.EXPO_PUBLIC_PUZZLE_BASE_URL ?? '';

/** Dev-källan får servera okrypterade pussel; prod-bygget avvisar dem. */
export const ALLOW_PLAINTEXT_PUZZLES = process.env.EXPO_PUBLIC_ALLOW_PLAINTEXT === '1';

/** Prod-grinden (§5): genererade pussel får aldrig nå ett prod-bygge. */
export const ALLOW_GENERATED_PUZZLES = process.env.EXPO_PUBLIC_ALLOW_GENERATED === '1';

/** Sant när ingen pusselkälla är konfigurerad – då används exempelpusslet. */
export const USING_BUNDLED_SAMPLE = PUZZLE_BASE_URL.length === 0;
