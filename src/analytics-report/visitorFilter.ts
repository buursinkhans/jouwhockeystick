/**
 * Which PostHog events count as a visitor, for every report (decision log
 * 2026-11-27). The old filter matched on $raw_user_agent, a property the site
 * does not send, so it removed nothing. This one uses three properties that
 * are on every browser event: the time zone, the screen and the window width.
 *
 * - `technical`: marks of an automated browser. No or a UTC time zone, a
 *   800 x 600 screen, or a window more than 1.5 times as wide as the screen.
 * - `outside`: a time zone outside Europe. Not necessarily a bot, but not the
 *   visitor this Dutch site is for; counted apart, not in the figures.
 * - `visitor`: everything else.
 *
 * This is a strong indication, not proof: a real visitor outside Europe is
 * left out, and a bot that looks like a European phone stays in. It only
 * changes how the reports read the data; tracking on the site is unchanged.
 */

/** Time zones of European places whose name does not start with "Europe/". */
export const EXTRA_EUROPEAN_ZONES = [
  'Arctic/Longyearbyen',
  'Asia/Famagusta',
  'Asia/Nicosia',
  'Atlantic/Azores',
  'Atlantic/Canary',
  'Atlantic/Faroe',
  'Atlantic/Madeira',
  'Atlantic/Reykjavik',
] as const;

export const NO_LOCAL_ZONES = ['', 'UTC', 'Etc/UTC', 'Etc/Unknown'] as const;

const list = (values: readonly string[]) => values.map((v) => `'${v}'`).join(', ');
const number = (property: string) => `coalesce(toFloat(properties.${property}), 0)`;
const ZONE = `coalesce(toString(properties.$timezone), '')`;

/** HogQL condition on an event: it carries a mark of an automated browser. */
export const TECHNICAL_BOT = [
  `${ZONE} IN (${list(NO_LOCAL_ZONES)})`,
  `(${number('$screen_width')} = 800 AND ${number('$screen_height')} = 600)`,
  `(${number('$screen_width')} > 0 AND ${number('$viewport_width')} > 1.5 * ${number('$screen_width')})`,
].join(' OR ');

/** HogQL condition on an event: its time zone is European. */
export const IN_EUROPE = `(${ZONE} LIKE 'Europe/%' OR ${ZONE} IN (${list(EXTRA_EUROPEAN_ZONES)}))`;

/** HogQL condition on an event: it counts in the figures. */
export const VISITOR = `NOT (${TECHNICAL_BOT}) AND ${IN_EUROPE}`;

/** HogQL expression naming the group of an event, to show what was left out. */
export const VISITOR_SEGMENT = `multiIf(${TECHNICAL_BOT}, 'technical', NOT ${IN_EUROPE}, 'outside', 'visitor')`;
