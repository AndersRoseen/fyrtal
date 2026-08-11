/**
 * Skarven mot krypteringen (plan.md §4).
 *
 * Appen dekrypterar bara – den krypterar aldrig – så den behöver ingen
 * RNG-polyfill. Det här är avsiktligt bara ett kontrakt: `puzzleCrypto.ts`
 * (AES-GCM via @noble/ciphers) kopplas in via `setPuzzleDecryptor` när den
 * modulen finns, utan att någon annan fil behöver ändras.
 */
import type { PuzzleEnvelope } from './envelope';

/**
 * Tar en envelope och dagens datum, returnerar pusslet i klartext.
 *
 * Nyckeln härleds som `sha256(app-hemlighet + ":" + datum)`, så datumet
 * skickas med i stället för en nyckel – hemligheten stannar i modulen.
 * Kasta vid fel nyckel eller trasig ciphertext; anroparen översätter det
 * till ett begripligt fel.
 */
export type PuzzleDecryptor = (
  envelope: PuzzleEnvelope,
  date: string,
) => Promise<unknown>;

class MissingDecryptorError extends Error {
  constructor() {
    super(
      'Ingen dekrypterare inkopplad. Anropa setPuzzleDecryptor() vid appstart, ' +
        'eller peka PUZZLE_BASE_URL mot en dev-källa med okrypterade pussel.',
    );
    this.name = 'MissingDecryptorError';
  }
}

const missingDecryptor: PuzzleDecryptor = () => Promise.reject(new MissingDecryptorError());

let decryptor: PuzzleDecryptor = missingDecryptor;

/** Kopplar in den riktiga implementationen. Anropas en gång vid appstart. */
export function setPuzzleDecryptor(next: PuzzleDecryptor): void {
  decryptor = next;
}

export function getPuzzleDecryptor(): PuzzleDecryptor {
  return decryptor;
}

export function hasPuzzleDecryptor(): boolean {
  return decryptor !== missingDecryptor;
}

/** Nollställer skarven. Finns för testernas skull. */
export function resetPuzzleDecryptor(): void {
  decryptor = missingDecryptor;
}
