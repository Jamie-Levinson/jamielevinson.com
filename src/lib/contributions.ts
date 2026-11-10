import snapshot from '@/data/contributions.json';

/** One calendar day: ISO date, contribution count, GitHub's 0–4 intensity level. */
export type ContributionDay = [date: string, count: number, level: number];

export interface Contributions {
  days: ContributionDay[];
  total: number;
  /** 'github' when fetched live, 'snapshot' when falling back to the committed copy. */
  source: 'github' | 'snapshot';
}

const GITHUB_USER = 'Jamie-Levinson';

/**
 * GitHub serves the profile calendar as an HTML fragment. It needs no token and already includes
 * private contributions when the profile is set to show them, which the GraphQL API only does
 * for the token's owner.
 */
function parseCalendar(html: string): ContributionDay[] {
  const counts = new Map<string, number>();
  for (const match of html.matchAll(/<tool-tip\b[^>]*\bfor="([^"]+)"[^>]*>\s*([^<]*?)\s*<\/tool-tip>/g)) {
    const count = /^([\d,]+) contribution/.exec(match[2]);
    counts.set(match[1], count ? Number(count[1].replace(/,/g, '')) : 0);
  }

  const days: ContributionDay[] = [];
  for (const [tag] of html.matchAll(/<td\b[^>]*\bContributionCalendar-day\b[^>]*>/g)) {
    const date = /\bdata-date="(\d{4}-\d{2}-\d{2})"/.exec(tag)?.[1];
    if (!date) continue;
    const id = /\bid="([^"]+)"/.exec(tag)?.[1] ?? '';
    const level = Number(/\bdata-level="(\d)"/.exec(tag)?.[1] ?? 0);
    days.push([date, counts.get(id) ?? 0, Math.min(4, level)]);
  }
  return days.sort((a, b) => a[0].localeCompare(b[0]));
}

function withTotal(days: ContributionDay[], source: Contributions['source']): Contributions {
  return { days, total: days.reduce((sum, day) => sum + day[1], 0), source };
}

/** The last year of contributions, refreshed hourly. Falls back to the snapshot if GitHub changes or fails. */
export async function getContributions(): Promise<Contributions> {
  try {
    const response = await fetch(`https://github.com/users/${GITHUB_USER}/contributions`, {
      headers: { accept: 'text/html', 'user-agent': 'Mozilla/5.0 (compatible; personal-site)' },
      next: { revalidate: 3600 },
    });
    if (!response.ok) throw new Error(`GitHub responded ${response.status}`);

    const days = parseCalendar(await response.text());
    if (days.length < 360) throw new Error(`Parsed only ${days.length} days`);
    return withTotal(days, 'github');
  } catch (error) {
    console.warn('[contributions] using snapshot:', error instanceof Error ? error.message : error);
    return withTotal(snapshot.days as ContributionDay[], 'snapshot');
  }
}
