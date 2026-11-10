/**
 * "Lately": a few current facts from outside work, each kept up to date by its source.
 *
 *  - where I am, when it is not home (a dated entry below that expires by itself)
 *  - the song I have played most over the last four weeks (Spotify; needs the three SPOTIFY_*
 *    environment variables; Spotify offers no shorter period than that)
 *  - how my teams are doing (ESPN's public scoreboard; no key)
 *
 * Every source fails soft: a fact that cannot be fetched is left out, never shown stale or wrong.
 * Server only: it reads secrets from the environment.
 */

export interface LatelyFact {
  id: string;
  /** A few words to sit beside the picture: "Lost 4–0". */
  short: string;
  /** The fact in full, for a tooltip and for screen readers. */
  line: string;
  accent: string;
  href: string;
  /** A picture for the fact: a path under /public, or a remote URL. */
  art?: string;
}

export const HOME = { place: 'Toronto', timeZone: 'America/Toronto' };

/** A stay away from home. After `until` it disappears and the clock in the footer goes back to Toronto. */
const AWAY = {
  place: 'San Francisco',
  timeZone: 'America/Los_Angeles',
  until: '2026-12-31',
  line: 'In San Francisco for the HF0 residency, September to December',
  short: 'At HF0 in SF',
  href: 'https://www.hf0.com',
  accent: '#c0362c', // the Golden Gate's orange
  art: '/lately/hf0.png',
};

export function whereabouts(now = new Date()) {
  return dayKey(now) <= AWAY.until ? AWAY : null;
}

const TEAMS = [
  {
    id: 'leafs',
    name: 'Leafs',
    feed: 'hockey/nhl/teams/tor',
    abbreviation: 'TOR',
    accent: '#2a63c4',
    href: 'https://www.nhl.com/mapleleafs',
    art: '/lately/leafs.png',
  },
  {
    id: 'texans',
    name: 'Texans',
    feed: 'football/nfl/teams/hou',
    abbreviation: 'HOU',
    accent: '#c8243a',
    href: 'https://www.houstontexans.com',
    art: '/lately/texans.png',
  },
];

/** A team is shown only around its games: nothing in the off-season. */
const SEASON_WINDOW_DAYS = 15;

const DAY_MS = 86_400_000;
const SPORTS_DAY = 'America/Toronto'; // a game belongs to the Eastern calendar day it starts on

/** `fresh` asks every source again (the API route); otherwise answers may be reused for ten minutes (the page). */
type Fetching = { fresh: boolean };
const policy = ({ fresh }: Fetching): RequestInit => (fresh ? { cache: 'no-store' } : { next: { revalidate: 600 } });

function dayKey(date: Date, timeZone = SPORTS_DAY) {
  return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
}

/** Whole days from today to `date`: -1 is yesterday. */
function daysFromToday(date: Date, now: Date) {
  return Math.round((Date.parse(dayKey(date)) - Date.parse(dayKey(now))) / DAY_MS);
}

const format = (date: Date, options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('en', { timeZone: SPORTS_DAY, ...options }).format(date);

/** "today", "yesterday", "Sun", or "Nov 1" for anything older than a week. */
function shortDay(date: Date, now: Date) {
  const days = daysFromToday(date, now);
  if (days === 0) return 'today';
  if (days === -1) return 'yesterday';
  if (days === 1) return 'tomorrow';
  return Math.abs(days) < 7 ? format(date, { weekday: 'short' }) : format(date, { month: 'short', day: 'numeric' });
}

/** "today", "tomorrow", "on Tuesday", or "on Nov 29". */
function comingDay(date: Date, now: Date) {
  const days = daysFromToday(date, now);
  if (days <= 0) return 'today';
  if (days === 1) return 'tomorrow';
  return `on ${days < 7 ? format(date, { weekday: 'long' }) : format(date, { month: 'short', day: 'numeric' })}`;
}

/** The same, looking back: "today", "yesterday", "on Sunday", or "on Nov 1". */
function onDay(date: Date, now: Date) {
  const days = -daysFromToday(date, now);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  return `on ${days < 7 ? format(date, { weekday: 'long' }) : format(date, { month: 'short', day: 'numeric' })}`;
}

interface Competitor {
  team: { abbreviation: string; shortDisplayName: string };
  score?: { value?: number; displayValue?: string };
}

interface Game {
  date: string;
  /** Pages about the game; the one marked as the desktop summary is ESPN's page for it. */
  links?: { rel: string[]; href: string }[];
  competitions: { status: { type: { completed: boolean } }; competitors: Competitor[] }[];
}

async function getTeam(team: (typeof TEAMS)[number], fetching: Fetching, now: Date): Promise<LatelyFact | null> {
  try {
    const response = await fetch(`https://site.api.espn.com/apis/site/v2/sports/${team.feed}/schedule`, policy(fetching));
    if (!response.ok) return null;
    const { events } = (await response.json()) as { events?: Game[] };
    if (!events?.length) return null;

    const sides = (game: Game) => {
      const [first, second] = game.competitions[0].competitors;
      return first.team.abbreviation === team.abbreviation ? { us: first, them: second } : { us: second, them: first };
    };
    const played = events.filter((game) => game.competitions[0].status.type.completed).at(-1);
    const coming = events.find((game) => !game.competitions[0].status.type.completed && Date.parse(game.date) > now.getTime() - 6 * 3_600_000);

    const recent = played && -daysFromToday(new Date(played.date), now) <= SEASON_WINDOW_DAYS;
    const soon = coming && daysFromToday(new Date(coming.date), now) <= SEASON_WINDOW_DAYS;
    if (!recent && !soon) return null;

    const next = coming && soon ? `Next: ${sides(coming).them.team.shortDisplayName} ${comingDay(new Date(coming.date), now)}` : '';
    // Each fact links to the game it reports, on ESPN; the team's own site only if the feed gives no page for it.
    const page = (game: Game) => game.links?.find((link) => link.rel.includes('summary') && link.rel.includes('desktop'))?.href ?? team.href;
    const common = { id: team.id, accent: team.accent, art: team.art };
    if (!played || !recent) {
      return { ...common, href: page(coming!), short: `Next: ${shortDay(new Date(coming!.date), now)}`, line: `${team.name}. ${next}` };
    }

    const { us, them } = sides(played);
    const ours = us.score?.value ?? Number(us.score?.displayValue);
    const theirs = them.score?.value ?? Number(them.score?.displayValue);
    const rival = them.team.shortDisplayName;
    const score = `${Math.max(ours, theirs)}–${Math.min(ours, theirs)}`;
    const result = ours > theirs ? `beat the ${rival} ${score}` : ours < theirs ? `lost ${score} to the ${rival}` : `tied the ${rival} ${score}`;
    return {
      ...common,
      href: page(played),
      short: `${ours > theirs ? 'Won' : ours < theirs ? 'Lost' : 'Tied'} ${score}`,
      line: `${team.name} ${result} ${onDay(new Date(played.date), now)}${next ? `. ${next}` : ''}`,
    };
  } catch {
    return null;
  }
}

// --- Spotify

const SPOTIFY_GREEN = '#1db954';
let token: { value: string; expires: number } | null = null;

async function spotifyToken() {
  if (token && token.expires > Date.now() + 30_000) return token.value;
  const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN } = process.env;
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET || !SPOTIFY_REFRESH_TOKEN) return null;
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
    },
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: SPOTIFY_REFRESH_TOKEN }),
    // No cache setting on purpose: the framework's default asks afresh each time the page is
    // rendered, without forcing the page to be rendered on every request (as `no-store` would).
  });
  if (!response.ok) return null;
  const granted = (await response.json()) as { access_token: string; expires_in: number };
  token = { value: granted.access_token, expires: Date.now() + granted.expires_in * 1000 };
  return token.value;
}

interface Track {
  name: string;
  artists: { name: string }[];
  album: { images: { url: string; width: number }[] };
  external_urls: { spotify: string };
}

export const spotifyConnected = () =>
  Boolean(process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET && process.env.SPOTIFY_REFRESH_TOKEN);

/** Shown on this machine only, in place of the song, until Spotify has been approved. It links to the approval. */
const CONNECT: LatelyFact = {
  id: 'music',
  short: 'Connect Spotify',
  line: 'Spotify is not connected yet. Only you see this.',
  accent: SPOTIFY_GREEN,
  href: 'http://127.0.0.1:3000/api/spotify/login',
};

/**
 * The song played most over the last four weeks. That is the shortest period Spotify reports on:
 * its play history only goes back fifty plays, so a true "this week" would mean recording plays
 * ourselves on a schedule.
 */
async function getListening(fetching: Fetching): Promise<LatelyFact | null> {
  if (!spotifyConnected()) return process.env.NODE_ENV === 'development' ? CONNECT : null;
  try {
    const access = await spotifyToken();
    if (!access) return null;
    const response = await fetch('https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=1', {
      headers: { Authorization: `Bearer ${access}` },
      ...policy(fetching),
    });
    if (response.status !== 200) return null;
    const track = ((await response.json()) as { items: Track[] }).items[0];
    if (!track) return null;

    const artist = track.artists.map((each) => each.name).slice(0, 2).join(' and ');
    const images = [...track.album.images].sort((a, b) => a.width - b.width);
    return {
      id: 'music',
      short: track.name,
      line: `Most played this month: “${track.name}” by ${artist}`,
      accent: SPOTIFY_GREEN,
      href: track.external_urls.spotify,
      art: (images.find((image) => image.width >= 64) ?? images.at(-1))?.url,
    };
  } catch {
    return null;
  }
}

async function load(fetching: Fetching): Promise<LatelyFact[]> {
  const now = new Date();
  const away = whereabouts(now);
  const place: LatelyFact | null = away && { id: 'place', short: away.short, line: away.line, accent: away.accent, href: away.href, art: away.art };
  const [listening, ...teams] = await Promise.all([getListening(fetching), ...TEAMS.map((team) => getTeam(team, fetching, now))]);
  return [place, listening, ...teams].filter((fact): fact is LatelyFact => fact !== null);
}

/**
 * How long one set of fresh answers is reused. This is what keeps us far inside the sources' rate
 * limits whatever the traffic: however often the API route is called (even with made-up query
 * strings that get past the shared cache), a running server asks Spotify and the scoreboard at
 * most once in this time, and requests that arrive together share the one question.
 */
const REUSE_MS = 5 * 60_000;
let latest: { at: number; facts: Promise<LatelyFact[]> } | null = null;

export function getLately(fetching: Fetching = { fresh: false }): Promise<LatelyFact[]> {
  if (!fetching.fresh) return load(fetching); // the page render: the framework's own cache reuses answers for ten minutes
  if (!latest || Date.now() - latest.at > REUSE_MS) latest = { at: Date.now(), facts: load(fetching) };
  return latest.facts;
}
