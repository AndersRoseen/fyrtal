/**
 * Design-tokens (plan.md §9). Allt tema-nära bor här så paletten och
 * typografin går att finslipa på ett ställe i fas 5.
 */
import type { Level } from '../types/puzzle';

export const colors = {
  background: '#FAF7F2',
  surface: '#FFFFFF',
  tile: '#EFEAE2',
  tileSelected: '#3F3A33',
  ink: '#1E1B18',
  inkInverse: '#FAF7F2',
  inkMuted: '#6E665C',
  border: '#DED6C9',
  danger: '#A6473C',
} as const;

/** Fyra dova skandinaviska toner istället för NYT:s pasteller (§9). */
export const levelColors: Record<Level, string> = {
  1: '#DCC88F', // sand
  2: '#A9BC9F', // salvia
  3: '#8FA9C0', // dammig blå
  4: '#A08AA6', // plommon
};

/**
 * Ett tecken per nivå så grupperna går att skilja åt utan färgseende (§9).
 * Ersätts med riktiga ikoner i fas 5.
 */
export const levelMarks: Record<Level, string> = {
  1: '●',
  2: '◆',
  3: '▲',
  4: '■',
};

export const levelNames: Record<Level, string> = {
  1: 'Sand',
  2: 'Salvia',
  3: 'Dimblå',
  4: 'Plommon',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 20,
  xl: 32,
} as const;

export const radius = {
  tile: 10,
  group: 12,
  button: 999,
} as const;

/**
 * Fas 5 byter ut `undefined` mot en grotesk för orden och en serif för
 * rubriker. Tills dess ärver vi systemets typsnitt.
 */
export const typography = {
  display: { fontFamily: undefined, fontSize: 34, fontWeight: '600' },
  title: { fontFamily: undefined, fontSize: 20, fontWeight: '600' },
  body: { fontFamily: undefined, fontSize: 15, fontWeight: '400' },
  label: { fontFamily: undefined, fontSize: 12, fontWeight: '600', letterSpacing: 1 },
  word: { fontFamily: undefined, fontSize: 14, fontWeight: '700', letterSpacing: 0.3 },
} as const;
