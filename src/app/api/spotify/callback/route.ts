import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { NextRequest } from 'next/server';
import { localOnly, page, SPOTIFY_REDIRECT, STATE_COOKIE } from '@/lib/spotifyAuth';

/**
 * Step two of connecting Spotify: Spotify sends the browser back here with a one-time code, which
 * is exchanged for a long-lived refresh token and saved to .env.local. The token is never shown.
 */
export async function GET(request: NextRequest) {
  if (!localOnly()) return new Response('Not found', { status: 404 });

  const params = request.nextUrl.searchParams;
  const code = params.get('code');
  const state = params.get('state');
  if (params.get('error')) return page('Spotify was not connected', `Spotify said: ${params.get('error')}.`, 400);
  if (!code || !state || state !== request.cookies.get(STATE_COOKIE)?.value) {
    return page('Spotify was not connected', 'The approval did not match this browser session. Open /api/spotify/login and try again.', 400);
  }

  const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } = process.env;
  const exchange = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
    },
    body: new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: SPOTIFY_REDIRECT }),
    cache: 'no-store',
  });
  const granted = (await exchange.json().catch(() => ({}))) as { refresh_token?: string; error_description?: string };
  if (!exchange.ok || !granted.refresh_token) {
    return page('Spotify was not connected', `The code could not be exchanged${granted.error_description ? `: ${granted.error_description}` : ''}.`, 400);
  }

  // Replace any earlier token, keep everything else in the file.
  const file = path.join(process.cwd(), '.env.local');
  const existing = await readFile(file, 'utf8').catch(() => '');
  const kept = existing.split('\n').filter((line) => line.trim() && !line.startsWith('SPOTIFY_REFRESH_TOKEN='));
  await writeFile(file, [...kept, `SPOTIFY_REFRESH_TOKEN=${granted.refresh_token}`, ''].join('\n'), { mode: 0o600 });

  return page('Spotify is connected', 'The token was saved to .env.local. You can close this tab and reload the site.');
}
