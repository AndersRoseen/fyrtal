/**
 * Datum-hjälpare. Intl-fria med flit: Hermes ICU-stöd skiljer sig mellan
 * Android och iOS, så tidszonen räknas ut för hand i stället.
 *
 * Allt som rör "vilken dag är det" går via Europe/Stockholm (plan.md §7),
 * inte enhetens lokala zon – annars kan man byta tidszon och få nya pussel.
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

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function pad(value: number): string {
  return `${value}`.padStart(2, '0');
}

/** Sista söndagen i en månad, vid given UTC-timme. `month` är 0-indexerad. */
function lastSundayUtc(year: number, month: number, hourUtc: number): number {
  const date = new Date(Date.UTC(year, month + 1, 0));
  date.setUTCDate(date.getUTCDate() - date.getUTCDay());
  date.setUTCHours(hourUtc, 0, 0, 0);
  return date.getTime();
}

/**
 * Sveriges offset i minuter: CET (+60) eller CEST (+120).
 *
 * EU-regeln är sista söndagen i mars 01:00 UTC → sista söndagen i oktober
 * 01:00 UTC. Den har gällt sedan 1996 och räcker gott för ett ordspel.
 */
export function stockholmOffsetMinutes(at: Date = new Date()): number {
  const year = at.getUTCFullYear();
  const dstStart = lastSundayUtc(year, 2, 1);
  const dstEnd = lastSundayUtc(year, 9, 1);
  const time = at.getTime();
  return time >= dstStart && time < dstEnd ? 120 : 60;
}

/** Samma ögonblick, förskjutet så att UTC-fälten visar svensk väggklocka. */
function toStockholmWallClock(at: Date): Date {
  return new Date(at.getTime() + stockholmOffsetMinutes(at) * 60 * 1000);
}

/** Dagens datum i Sverige som `YYYY-MM-DD`. */
export function stockholmIsoDate(at: Date = new Date()): string {
  const wall = toStockholmWallClock(at);
  return `${wall.getUTCFullYear()}-${pad(wall.getUTCMonth() + 1)}-${pad(wall.getUTCDate())}`;
}

/** Millisekunder till nästa svenska midnatt. */
export function msUntilNextStockholmMidnight(at: Date = new Date()): number {
  const wall = toStockholmWallClock(at);
  const nextMidnight = Date.UTC(
    wall.getUTCFullYear(),
    wall.getUTCMonth(),
    wall.getUTCDate() + 1,
  );
  return nextMidnight - wall.getTime();
}

/**
 * Hela dygn från `from` till `to`, båda `YYYY-MM-DD`. Negativt om `to`
 * ligger före `from`. Räknas på kalenderdatum, så sommartid inte stör.
 */
export function daysBetween(from: string, to: string): number {
  return Math.round((isoToUtcMillis(to) - isoToUtcMillis(from)) / MS_PER_DAY);
}

function isoToUtcMillis(iso: string): number {
  const [year, month, day] = iso.split('-').map(Number);
  return Date.UTC(year, month - 1, day);
}

/** T.ex. "onsdag 12 augusti 2026". */
export function formatLongDate(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return `${WEEKDAYS[date.getUTCDay()]} ${day} ${MONTHS[month - 1]} ${year}`;
}

/** Formaterar en varaktighet som `HH:MM:SS`. */
export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return [hours, minutes, seconds].map(pad).join(':');
}
