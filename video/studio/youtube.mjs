// YouTube side of "Video publiceren" (docs/video.md §10): checks a video script
// from the Social-studio, works out when each part goes live, builds the
// YouTube metadata and uploads with the YouTube Data API.
// No dependencies: plain fetch. The keys come from GitHub secrets, never from the script.

import fs from 'node:fs';

export const TIMEZONE = 'Europe/Amsterdam';
export const DEFAULT_TIMES = { shorts: '19:30', youtube: '17:00' };
/** Must be at least this far in the future, or YouTube may publish straight away. */
export const MIN_LEAD_MINUTES = 30;

const ID = /^[a-z0-9-]{1,80}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^\d{2}:\d{2}$/;

const str = (v) => (typeof v === 'string' ? v : '');
// YouTube refuses < and > in titles and descriptions.
const clean = (v) => str(v).replace(/[<>]/g, '').trim();

/** Problems with the script, in Dutch for the result; empty when it can be published. */
export function validate(video) {
  const errors = [];
  if (!video || typeof video !== 'object') return ['Geen video-gegevens.'];
  if (!ID.test(str(video.id))) errors.push('Ongeldig video-id.');
  if (!DATE.test(str(video.datum))) errors.push('Geen geldige datum (JJJJ-MM-DD).');
  const scenes = Array.isArray(video.scenes) ? video.scenes : [];
  if (scenes.length < 2 || scenes.length > 10) errors.push('Het script moet 2 tot 10 scènes hebben.');
  if (video.extern) errors.push('Deze video is buiten de studio gemaakt; die kan niet automatisch.');
  return errors;
}

/**
 * Which parts go to YouTube: the Short and the 16:9 video, except a channel that is
 * skipped or that the owner already scheduled or placed himself (never upload twice).
 */
export function targets(video) {
  const k = video && typeof video.kanalen === 'object' && video.kanalen ? video.kanalen : {};
  const open = (c) => !['overslaan', 'ingepland', 'geplaatst'].includes(k[c]);
  return ['shorts', 'youtube'].filter(open);
}

/** Offset in minutes of a time zone at a moment (e.g. +120 in Dutch summer time). */
function offsetMinutes(date, tz) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB', {
    timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
  }).formatToParts(date).map((p) => [p.type, p.value]));
  const asUtc = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute);
  return Math.round((asUtc - Math.floor(date.getTime() / 60000) * 60000) / 60000);
}

/** The moment a date and wall-clock time in Amsterdam happen, as a Date. */
export function publishMoment(datum, tijd, tz = TIMEZONE) {
  if (!DATE.test(datum) || !TIME.test(tijd)) throw new Error('Ongeldige datum of tijd.');
  const [y, m, d] = datum.split('-').map(Number);
  const [h, mi] = tijd.split(':').map(Number);
  const wall = Date.UTC(y, m - 1, d, h, mi);
  let guess = new Date(wall - offsetMinutes(new Date(wall), tz) * 60000);
  guess = new Date(wall - offsetMinutes(guess, tz) * 60000); // again, for the days the clock changes
  return guess;
}

export function timeFor(video, target) {
  const t = video && video.tijden && video.tijden[target];
  return typeof t === 'string' && TIME.test(t) ? t : DEFAULT_TIMES[target];
}

/** The snippet and status for one upload. */
export function metadata(video, target, publishAt) {
  const yt = video.youtube && typeof video.youtube === 'object' ? video.youtube : {};
  const sh = video.short && typeof video.short === 'object' ? video.short : {};
  let title, description;
  if (target === 'shorts') {
    title = clean(sh.titel) || clean(yt.titel) || clean(video.titel);
    if (title && !/#shorts/i.test(title)) title = `${title} #shorts`;
    description = clean(sh.beschrijving) || clean(yt.beschrijving);
  } else {
    title = clean(yt.titel) || clean(video.titel);
    description = clean(yt.beschrijving);
  }
  if (!title) throw new Error('Geen titel in het script.');
  if (title.length > 100) title = title.slice(0, 99).trimEnd() + '…';
  const tags = [];
  let tagChars = 0;
  for (const t of Array.isArray(yt.tags) ? yt.tags : []) {
    const tag = clean(t).replace(/,/g, ' ').slice(0, 60);
    if (!tag || tagChars + tag.length + 1 > 450) continue;
    tags.push(tag); tagChars += tag.length + 1;
  }
  return {
    snippet: { title, description: description.slice(0, 4900), tags, categoryId: '17', defaultLanguage: 'nl', defaultAudioLanguage: 'nl' },
    status: {
      // A video with publishAt must be private until that moment; YouTube then makes it public.
      privacyStatus: 'private',
      publishAt: publishAt.toISOString(),
      selfDeclaredMadeForKids: false,
      // Studio videos are animations, not realistic people or events. The AI-presenter test (§9) is not made here.
      containsSyntheticMedia: false,
      embeddable: true,
      license: 'youtube',
    },
  };
}

/** Exchanges the refresh token (GitHub secret) for a short-lived access token. */
export async function accessToken({ clientId, clientSecret, refreshToken }) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, refresh_token: refreshToken, grant_type: 'refresh_token' }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.access_token) {
    throw new Error(`Inloggen bij Google lukte niet (${json.error || res.status}). Vernieuw YOUTUBE_REFRESH_TOKEN volgens docs/video.md §10.`);
  }
  return json.access_token;
}

async function apiError(res, what) {
  const json = await res.json().catch(() => ({}));
  const reason = json.error && (json.error.errors?.[0]?.reason || json.error.message);
  return new Error(`${what} lukte niet (${res.status}${reason ? ': ' + reason : ''}).`);
}

/** Resumable upload of one MP4. Returns the YouTube video id. */
export async function upload(token, meta, file) {
  const size = fs.statSync(file).size;
  const init = await fetch('https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json; charset=UTF-8',
      'X-Upload-Content-Type': 'video/mp4',
      'X-Upload-Content-Length': String(size),
    },
    body: JSON.stringify(meta),
  });
  if (!init.ok) throw await apiError(init, 'Upload starten');
  const location = init.headers.get('location');
  if (!location) throw new Error('Upload starten lukte niet (geen upload-adres).');
  const put = await fetch(location, {
    method: 'PUT',
    headers: { 'Content-Type': 'video/mp4', 'Content-Length': String(size) },
    body: fs.readFileSync(file),
  });
  if (!put.ok) throw await apiError(put, 'Video uploaden');
  const json = await put.json();
  if (!json.id) throw new Error('Video uploaden gaf geen video-id terug.');
  return json.id;
}

/** Custom thumbnail. Needs a verified channel; a failure is a warning, not an error. */
export async function setThumbnail(token, videoId, png) {
  const res = await fetch(`https://www.googleapis.com/upload/youtube/v3/thumbnails/set?videoId=${encodeURIComponent(videoId)}&uploadType=media`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'image/png' },
    body: fs.readFileSync(png),
  });
  if (!res.ok) throw await apiError(res, 'Thumbnail instellen');
}

/**
 * The approval issue (docs/video.md §10): the scheduled task opens it with the script;
 * the owner adds the label `publiceren` to start the upload. The script sits in a
 * ```json block right after the marker.
 */
export const SCRIPT_MARKER = '<!-- video-script -->';

export function issueBody(video) {
  return [
    `**${clean(video.titel) || video.id}** · live op ${video.datum} (Short ${timeFor(video, 'shorts')}, YouTube-video ${timeFor(video, 'youtube')})`,
    '',
    'Klaargezet in de Social-studio. **Zet het label `publiceren` op dit issue** om de video te laten maken en op YouTube in te plannen, privé tot het geplande moment. Niet doen? Sluit dit issue.',
    '',
    SCRIPT_MARKER,
    '```json',
    JSON.stringify(video, null, 2),
    '```',
  ].join('\n');
}

/** The script from an approval issue, or null when it is missing or not valid JSON. */
export function scriptFromIssue(body) {
  const text = str(body);
  const at = text.indexOf(SCRIPT_MARKER);
  if (at < 0) return null;
  const m = /```json\s*\n([\s\S]*?)\n```/.exec(text.slice(at));
  if (!m) return null;
  try { const v = JSON.parse(m[1]); return v && typeof v === 'object' ? v : null; } catch { return null; }
}

/** True when an earlier result comment on the issue already scheduled something: never upload twice. */
export function alreadyScheduled(comments) {
  return (Array.isArray(comments) ? comments : []).some((c) => {
    const b = str(c && c.body);
    return b.includes('<!-- video-publicatie ') && /"status":\s*"ingepland"/.test(b);
  });
}

export const watchUrl = (target, id) => (target === 'shorts' ? `https://youtube.com/shorts/${id}` : `https://youtu.be/${id}`);
