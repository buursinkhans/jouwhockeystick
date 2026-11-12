/**
 * Seals a JSON object with a passphrase, so figures that may not be public
 * (amounts, commission) can travel through the public repository. PBKDF2-SHA256
 * derives an AES-256-GCM key; the browser opens it with WebCrypto using the same
 * parameters (Marketingstudio, tab Verkoop). The passphrase is a GitHub Secret
 * (VERKOOP_SLEUTEL) and is typed once by the owner in the studio; it never
 * appears in code, logs or the sealed file.
 */
import { createCipheriv, createDecipheriv, pbkdf2Sync, randomBytes } from 'node:crypto';

export const SEAL_ITERATIONS = 310_000;

export type Sealed = {
  versie: 1;
  alg: 'PBKDF2-SHA256/AES-256-GCM';
  iter: number;
  /** base64 */
  salt: string;
  /** base64, 12 bytes */
  iv: string;
  /** base64: ciphertext followed by the 16-byte tag, as WebCrypto expects. */
  data: string;
  gemaakt: string;
};

const key = (passphrase: string, salt: Buffer, iter: number) => pbkdf2Sync(passphrase, salt, iter, 32, 'sha256');

export function seal(value: unknown, passphrase: string, now = new Date()): Sealed {
  if (passphrase.length < 16) throw new Error('VERKOOP_SLEUTEL is te kort: gebruik minstens 16 tekens.');
  const salt = randomBytes(16);
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key(passphrase, salt, SEAL_ITERATIONS), iv);
  const body = Buffer.concat([cipher.update(JSON.stringify(value), 'utf8'), cipher.final(), cipher.getAuthTag()]);
  return {
    versie: 1,
    alg: 'PBKDF2-SHA256/AES-256-GCM',
    iter: SEAL_ITERATIONS,
    salt: salt.toString('base64'),
    iv: iv.toString('base64'),
    data: body.toString('base64'),
    gemaakt: now.toISOString(),
  };
}

/** The reverse of seal(); for tests and checks. Throws on a wrong passphrase. */
export function unseal(sealed: Sealed, passphrase: string): unknown {
  const body = Buffer.from(sealed.data, 'base64');
  const decipher = createDecipheriv(
    'aes-256-gcm',
    key(passphrase, Buffer.from(sealed.salt, 'base64'), sealed.iter),
    Buffer.from(sealed.iv, 'base64'),
  );
  decipher.setAuthTag(body.subarray(body.length - 16));
  return JSON.parse(Buffer.concat([decipher.update(body.subarray(0, body.length - 16)), decipher.final()]).toString('utf8'));
}
