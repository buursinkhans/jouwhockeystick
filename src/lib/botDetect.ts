/**
 * Recognises requests that are not a person with a browser, by user-agent
 * (decision log 2026-11-24). Used by the redirect /go/, so crawlers, SEO tools,
 * AI crawlers, link previews, headless browsers and plain scripts do not click
 * affiliate links. Only for /go/: nothing else on the site looks at this.
 *
 * It stops bots that say what they are. A bot that presents itself as an
 * ordinary Chrome passes. Deliberately no `Sec-Fetch-Site` check (owner,
 * 2026-11-24): it would also catch some real, older browsers.
 */

/** Named bots and tools, lower case. Parts of a user-agent string. */
const NAMED = [
  // Search engines (also Google's other fetchers: only /go/ is closed to them, and robots.txt asks them not to come)
  'googlebot', 'googleother', 'google-inspectiontool', 'storebot-google', 'adsbot', 'mediapartners', 'apis-google', 'feedfetcher', 'google-read-aloud', 'google-extended',
  'bingbot', 'bingpreview', 'msnbot', 'adidxbot', 'duckduckbot', 'duckassistbot', 'yandex', 'baiduspider', 'sogou', 'exabot', 'seznambot', 'qwantify', 'applebot', 'petalbot', 'bytespider',
  // SEO and monitoring tools
  'ahrefsbot', 'ahrefssiteaudit', 'semrushbot', 'mj12bot', 'dotbot', 'rogerbot', 'screaming frog', 'sitebulb', 'seokicks', 'blexbot', 'dataforseobot', 'serpstatbot', 'barkrowler', 'lighthouse', 'pagespeed', 'gtmetrix', 'pingdom', 'uptimerobot', 'statuscake', 'site24x7', 'datadog', 'newrelic',
  // AI crawlers and assistants fetching pages
  'gptbot', 'chatgpt-user', 'oai-searchbot', 'claudebot', 'claude-web', 'claude-user', 'claude-searchbot', 'anthropic-ai', 'perplexitybot', 'perplexity-user', 'ccbot', 'amazonbot', 'meta-externalagent', 'meta-externalfetcher', 'cohere-ai', 'diffbot', 'youbot', 'imagesiftbot', 'omgili',
  // Link previews and chat apps
  'facebookexternalhit', 'facebot', 'twitterbot', 'linkedinbot', 'slackbot', 'slack-imgproxy', 'discordbot', 'telegrambot', 'whatsapp', 'pinterestbot', 'skypeuripreview', 'embedly', 'vkshare', 'redditbot', 'tumblr', 'quora link preview', 'flipboard',
  // Headless browsers and test drivers
  'headlesschrome', 'phantomjs', 'playwright', 'puppeteer', 'selenium', 'webdriver', 'cypress', 'slimerjs',
  // Plain scripts and HTTP libraries
  'curl/', 'wget/', 'python-requests', 'python-urllib', 'python-httpx', 'aiohttp', 'httpx', 'go-http-client', 'libwww-perl', 'scrapy', 'node-fetch', 'axios/', 'undici', 'postmanruntime', 'insomnia/', 'java-http-client', 'apache-httpclient', 'jakarta commons', 'okhttp-bot', 'guzzlehttp', 'php/', 'ruby/', 'mechanize', 'httpie',
];

/** Words that name a bot without a list: "...bot/1.0", "crawler", "spider", "scraper", "headless". */
const GENERIC = /(crawl|spider|slurp|scrap(?:e|y)|headless|\bbot\b|bot[\s/;)\-_]|[\-_ ]bot$|\w+bot$)/i;

/** A browser user-agent starts like this; anything shorter than a real one is a script. */
const MIN_LENGTH = 12;

export function isBot(userAgent: string | null | undefined): boolean {
  const ua = (userAgent ?? '').trim();
  if (ua.length < MIN_LENGTH) return true;
  const lower = ua.toLowerCase();
  if (NAMED.some((name) => lower.includes(name))) return true;
  // A phone brand with "bot" in its name is a person, not a bot.
  return GENERIC.test(ua.replace(/cubot/gi, ''));
}
