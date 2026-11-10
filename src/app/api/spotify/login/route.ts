import { NextResponse, type NextRequest } from 'next/server';
import { localOnly, page, SPOTIFY_ORIGIN, SPOTIFY_REDIRECT, SPOTIFY_SCOPES, STATE_COOKIE } from '@/lib/spotifyAuth';

/** Step one of connecting Spotify: send the browser to Spotify to approve read access to listening history. */
export async function GET(request: NextRequest) {
  if (!localOnly()) return new Response('Not found', { status: 404 });

  // The approval must start and end on the same address, so the check cookie comes back.
  if (request.headers.get('host') !== new URL(SPOTIFY_ORIGIN).host) {
    return NextResponse.redirect(`${SPOTIFY_ORIGIN}/api/spotify/login`);
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  if (!clientId || !process.env.SPOTIFY_CLIENT_SECRET) {
    return page('Spotify is not set up yet', 'Add SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET to .env.local, then open this page again.', 400);
  }

  const state = crypto.randomUUID();
  const authorize = new URL('https://accounts.spotify.com/authorize');
  authorize.search = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    scope: SPOTIFY_SCOPES,
    redirect_uri: SPOTIFY_REDIRECT,
    state,
  }).toString();

  const response = NextResponse.redirect(authorize);
  response.cookies.set(STATE_COOKIE, state, { httpOnly: true, sameSite: 'lax', path: '/api/spotify', maxAge: 600 });
  return response;
}
