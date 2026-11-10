import { getLately } from '@/lib/lately';

// Asked by the page once it has loaded, so the facts are current even when the page itself was rendered a while ago.
export const dynamic = 'force-dynamic';

export async function GET() {
  const facts = await getLately({ fresh: true });
  // Shared caches may reuse an answer for five minutes, which bounds how often the sources are asked.
  return Response.json(facts, { headers: { 'Cache-Control': 'public, s-maxage=300' } });
}
