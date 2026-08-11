/**
 * Datum-hjälpare. Medvetet Intl-fria så de beter sig likadant på Hermes.
 *
 * Fas 1 använder enhetens lokala tid. Fas 2 knyter det till Europe/Stockholm
 * enligt plan.md §7 när streaken ska räknas.
 */

const MONTHS = [
  'januari',
  'februari',
  'mars',
  'april',
  'maj',
  'juni',
  'juli',
  'augusti',
  'september',
  'oktober',
  'november',
  'december',
];

const WEEKDAYS = ['söndag', 'måndag', 'tisdag', 'onsdag', 'torsdag', 'fredag', 'lördag'];

/** `YYYY-MM-DD` för ett lokalt datum. */
export function toIsoDate(date: Date): string {
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Tolkar `YYYY-MM-DD` som ett lokalt datum (inte UTC). */
export function fromIsoDate(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/** T.ex. "tisdag 12 augusti 2026". */
export function formatLongDate(iso: string): string {
  const date = fromIsoDate(iso);
  return `${WEEKDAYS[date.getDay()]} ${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

/** Millisekunder kvar till nästa midnatt. */
export function msUntilNextMidnight(now: Date = new Date()): number {
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return next.getTime() - now.getTime();
}

/** Formaterar en varaktighet som `HH:MM:SS`. */
export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return [hours, minutes, seconds].map((part) => `${part}`.padStart(2, '0')).join(':');
}
