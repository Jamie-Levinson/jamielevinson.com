/**
 * One-time Spotify authorisation, used only on this machine (see app/api/spotify).
 *
 * Spotify requires a loopback redirect to use the literal address 127.0.0.1, not "localhost".
 * The same URI must be listed in the Spotify app's settings.
 */
export const SPOTIFY_ORIGIN = 'http://127.0.0.1:3000';
export const SPOTIFY_REDIRECT = `${SPOTIFY_ORIGIN}/api/spotify/callback`;
export const SPOTIFY_SCOPES = 'user-top-read'; // most played tracks
export const STATE_COOKIE = 'spotify_state';

export const localOnly = () => process.env.NODE_ENV === 'development';

export const page = (title: string, body: string, status = 200) =>
  new Response(
    `<!doctype html><meta charset="utf-8"><title>${title}</title><body style="font:16px/1.5 system-ui;max-width:34em;margin:15vh auto;padding:0 20px"><h1 style="font-size:20px">${title}</h1><p>${body}</p></body>`,
    { status, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
  );
