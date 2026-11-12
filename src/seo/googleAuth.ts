// Google service-account login for read-only Search Console calls. Signs the
// login token with Node's own crypto: no Google client library needed.
// Shared by the weekly report and the daily figures (scripts/).
import { createSign } from 'node:crypto';

const SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';

export type ServiceAccount = { client_email: string; private_key: string };

export function readServiceAccount(): ServiceAccount {
  const raw = process.env.GSC_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error('GSC_SERVICE_ACCOUNT_JSON ontbreekt (GitHub Secrets).');
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(
      'GSC_SERVICE_ACCOUNT_JSON is geen geldige JSON. Plak de volledige inhoud van het gedownloade bestand.',
    );
  }
  const account = parsed as Partial<ServiceAccount>;
  if (typeof account.client_email !== 'string' || typeof account.private_key !== 'string') {
    throw new Error('GSC_SERVICE_ACCOUNT_JSON mist client_email of private_key.');
  }
  return { client_email: account.client_email, private_key: account.private_key };
}

const base64url = (value: string | Buffer) => Buffer.from(value).toString('base64url');

export async function getToken(account: ServiceAccount): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claims = base64url(
    JSON.stringify({ iss: account.client_email, scope: SCOPE, aud: TOKEN_URL, iat: now, exp: now + 3600 }),
  );
  const signature = createSign('RSA-SHA256')
    .update(`${header}.${claims}`)
    .sign(account.private_key, 'base64url');

  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${header}.${claims}.${signature}`,
    }),
  });
  if (!response.ok) {
    const detail = (await response.text()).slice(0, 300);
    throw new Error(`Inloggen bij Google mislukt (HTTP ${response.status}): ${detail}`);
  }
  const body = (await response.json()) as { access_token?: unknown };
  if (typeof body.access_token !== 'string') throw new Error('Geen access_token van Google.');
  return body.access_token;
}
