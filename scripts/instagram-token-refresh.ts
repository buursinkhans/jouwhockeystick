// Monthly refresh of the Instagram access token (long-lived tokens expire
// after 60 days). Reads the live token from Netlify, asks Instagram for a new
// one, writes it back to Netlify and starts a new deploy so the site uses it.
// The token is never printed. Needs NETLIFY_AUTH_TOKEN (personal access
// token) and NETLIFY_SITE_ID, both GitHub Secrets.
// Run with: npm run instagram:refresh
import {
  INSTAGRAM_TOKEN_KEY,
  liveEnvValue,
  parseRefresh,
  type NetlifyEnvValue,
  type RefreshResponse,
} from '../src/lib/instagramToken';

const NETLIFY = 'https://api.netlify.com/api/v1';

function fail(message: string): never {
  console.error(`Instagram-token verversen mislukt: ${message}`);
  process.exit(1);
}

const netlifyToken = process.env.NETLIFY_AUTH_TOKEN;
const siteId = process.env.NETLIFY_SITE_ID;
if (!netlifyToken || !siteId) {
  fail('NETLIFY_AUTH_TOKEN of NETLIFY_SITE_ID ontbreekt (GitHub Secrets).');
}

async function netlify<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${NETLIFY}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${netlifyToken}`,
      'Content-Type': 'application/json',
      ...init.headers,
    },
  });
  if (!response.ok) {
    fail(`Netlify gaf HTTP ${response.status} op ${path.split('?')[0]}.`);
  }
  const text = await response.text();
  return (text ? JSON.parse(text) : {}) as T;
}

const site = await netlify<{ account_id?: string; name?: string }>(
  `/sites/${siteId}`,
);
if (!site.account_id) fail('geen account_id bij de site gevonden.');
const envPath = `/accounts/${site.account_id}/env/${INSTAGRAM_TOKEN_KEY}?site_id=${siteId}`;

const variable = await netlify<{ values?: NetlifyEnvValue[] }>(envPath);
const current = liveEnvValue(variable.values ?? []);
if (!current) {
  fail(
    `${INSTAGRAM_TOKEN_KEY} heeft in Netlify geen leesbare waarde voor productie. Staat "Contains secret values" aan? Dan kan de API hem niet lezen.`,
  );
}

const refreshUrl = new URL('https://graph.instagram.com/refresh_access_token');
refreshUrl.searchParams.set('grant_type', 'ig_refresh_token');
refreshUrl.searchParams.set('access_token', current.value);
const refreshResponse = await fetch(refreshUrl);
const refreshed = parseRefresh(
  refreshResponse.status,
  (await refreshResponse.json().catch(() => ({}))) as RefreshResponse,
);
if ('error' in refreshed) {
  fail(
    `${refreshed.error}. Is het token verlopen? Maak dan met de hand een nieuw token en zet het in Netlify.`,
  );
}

await netlify(envPath, {
  method: 'PATCH',
  body: JSON.stringify({ context: current.context, value: refreshed.token }),
});
await netlify(`/sites/${siteId}/builds`, { method: 'POST' });

console.log(
  `Instagram-token ververst voor ${site.name ?? 'de site'}: weer ${refreshed.expiresInDays} dagen geldig. Nieuwe deploy gestart.`,
);
