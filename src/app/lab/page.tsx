import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { Invite } from '@/components/v2/chartInvite';
import Landing from '@/components/v2/Landing';
import lab from './lab.module.css';

export const metadata: Metadata = { title: 'Lab · Jamie Levinson', robots: { index: false, follow: false } };

const OPTIONS: { id: Invite; name: string; hint: string }[] = [
  { id: 'bug', name: 'A bug on the chart', hint: 'After a few seconds a square wakes up and wanders, eating squares. Click it.' },
  { id: 'boardy', name: 'Boardy waiting', hint: 'The box sits on today’s column, at the right end. Hover it, click it.' },
  { id: 'keys', name: 'Key hint', hint: 'Put the pointer on the chart, then press Space or an arrow key. Desktop only.' },
  { id: 'label', name: 'Louder Play', hint: 'Only the Play label under the chart changes.' },
  { id: 'nudge', name: 'One-time nudge', hint: 'Six seconds in, a bug drops in and the caption asks. Once per visitor on the real page; every load here.' },
];

/** Prototypes: the landing page with one way of inviting people to the game switched on by `?try=`. Not served in production. */
export default async function Page({ searchParams }: { searchParams: Promise<{ try?: string }> }) {
  if (process.env.NODE_ENV !== 'development') notFound();
  const { try: wanted } = await searchParams;
  const current = OPTIONS.find((option) => option.id === wanted);
  return (
    <>
      <Landing invite={current?.id} />
      <div className={lab.space} />
      {/* Plain links, so each option loads fresh and its timing starts over. A tool, not part of the design. */}
      <nav className={lab.bar} aria-label="Prototype options">
        <div className={lab.row}>
          <a href="/lab" data-on={!current}>
            As it is
          </a>
          {OPTIONS.map(({ id, name }, index) => (
            <a key={id} href={`/lab?try=${id}`} data-on={current?.id === id}>
              {index + 1} {name}
            </a>
          ))}
        </div>
        <p className={lab.hint}>{current?.hint ?? 'The page as it is now: only the small Play label. Pick an option.'}</p>
      </nav>
    </>
  );
}
