/**
 * Design-tokens (plan.md §9).
 *
 * Allt tema-nära bor här. Vyerna refererar bara till tokens, aldrig till
 * råa hex-värden eller typsnittsnamn, så paletten går att skruva på ett
 * ställe.
 *
 * Riktningen: redaktionellt och lugnt, men egen identitet – dova
 * skandinaviska toner i stället för NYT:s pasteller, och en grotesk mot en
 * serif i stället för NYT:s enda snitt.
 */
import type { Level } from '../types/puzzle';

export const colors = {
  /** Varm papperston, inte rent vitt – lugnare att titta på länge. */
  background: '#F7F4EE',
  surface: '#FFFFFF',
  tile: '#E9E3D8',
  tilePressed: '#DED6C7',
  /** Markerad bricka: mörk, så markeringen aldrig förväxlas med en nivåfärg. */
  tileSelected: '#33302B',
  ink: '#1C1A17',
  inkInverse: '#F7F4EE',
  inkMuted: '#6B6459',
  inkFaint: '#A39A8C',
  border: '#D9D1C2',
  danger: '#9E4A3C',
} as const;

/**
 * Fyra dova toner: sand, salvia, dimblå, plommon.
 *
 * Ljusheten är medvetet trappad (ljusast på nivå 1, mörkast på nivå 4) så
 * ordningen syns även utan färgseende – och `levelMarks` ger en form att
 * skilja dem på utöver färgen.
 */
export const levelColors: Record<Level, string> = {
  1: '#E3CE96',
  2: '#A9BFA2',
  3: '#8AA4BE',
  4: '#8E7796',
};

/** Textfärg som håller kontrast mot respektive nivåfärg. */
export const levelInk: Record<Level, string> = {
  1: '#3A3117',
  2: '#1F2C1B',
  3: '#152430',
  4: '#FAF7F2',
};

/** En form per nivå, så grupperna går att skilja åt utan färgseende (§9). */
export const levelMarks: Record<Level, string> = {
  1: '●',
  2: '◆',
  3: '▲',
  4: '■',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 20,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  tile: 12,
  group: 14,
  card: 18,
  button: 999,
} as const;

/**
 * Typsnitten laddas i `useAppFonts`. Namnen här måste matcha nycklarna
 * som skickas till `useFonts` – ändra på båda ställena eller inget.
 */
export const fonts = {
  /** Grotesk: orden på brickorna, knappar, siffror. */
  sans: 'SpaceGrotesk_500Medium',
  sansBold: 'SpaceGrotesk_700Bold',
  /** Serif: rubriker och tema-etiketter – det som ger editorial-känslan. */
  serif: 'Fraunces_400Regular',
  serifBold: 'Fraunces_600SemiBold',
} as const;

export const typography = {
  /** Speltiteln. */
  display: { fontFamily: fonts.serifBold, fontSize: 44, letterSpacing: 0.5 },
  title: { fontFamily: fonts.serifBold, fontSize: 26 },
  /** Tema-etiketten på en löst grupp. */
  theme: { fontFamily: fonts.serifBold, fontSize: 15, letterSpacing: 0.4 },
  body: { fontFamily: fonts.sans, fontSize: 15, lineHeight: 21 },
  /** Versaler + spärrad – används till småetiketter och knappar. */
  label: { fontFamily: fonts.sansBold, fontSize: 11, letterSpacing: 1.4 },
  /** Orden på brickorna. Storleken krymps av `adjustsFontSizeToFit`. */
  word: { fontFamily: fonts.sansBold, fontSize: 15, letterSpacing: 0.2 },
  /** Siffror som ska läsas snabbt: streak, försök. */
  numeric: { fontFamily: fonts.sansBold, fontSize: 20 },
} as const;

/** Diskret upphöjning – tokens så att skuggor inte spretar mellan vyer. */
export const elevation = {
  card: {
    shadowColor: '#2B2317',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
} as const;

/** Animationslängder – hålls korta, spelet ska inte kännas långsamt. */
export const motion = {
  tile: 120,
  lock: 320,
  shake: 320,
} as const;
