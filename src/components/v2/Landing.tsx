import type { CSSProperties, ReactNode } from 'react';
import { Inter_Tight, JetBrains_Mono } from 'next/font/google';
import Image from 'next/image';
import { FaEnvelope, FaGithub, FaLinkedinIn, FaXTwitter } from 'react-icons/fa6';
import type { Invite } from './chartInvite';
import ContributionField from './ContributionField';
import Lately from './Lately';
import LocalTime from './LocalTime';
import { SketchFilters, Underline } from './sketch';
import ThemeSwitch from './ThemeSwitch';
import { getContributions } from '@/lib/contributions';
import { getLately, HOME, whereabouts } from '@/lib/lately';
import styles from './Landing.module.css';

const sans = Inter_Tight({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-sans' });
const mono = JetBrains_Mono({ subsets: ['latin'], weight: ['400'], variable: '--font-mono' });

/** One colour per name, used for its hand-drawn underline and for what its logo or icon turns on hover. */
const ACCENT = {
  boardy: '#e5a76a', // the cardboard box
  loop: '#6fd08f',
  paramount: '#dca028',
  thoughtwire: '#00a8e8',
  waterloo: '#f5c518',
  github: '#2da44e',
  linkedin: '#0a66c2',
  kotlin: '#a97bff', // GitHub's language colours
  cpp: '#f34b7d',
};

const SITES = {
  boardy: 'https://boardy.ai',
  loop: 'https://www.bankonloop.com/en-ca',
  paramount: 'https://www.paramountcommerce.com/',
  thoughtwire: 'https://www.linkedin.com/company/thoughtwire', // the company has shut down; its site is gone
  waterloo: 'https://uwaterloo.ca/',
};

const external = { target: '_blank', rel: 'noopener noreferrer' };

/** `--accent` and `--order` (the element's place in the load sequence) as inline custom properties. */
const tint = (accent: string | undefined, order: number) => ({ '--accent': accent, '--order': order }) as CSSProperties;

const links = [
  { label: 'GitHub', href: 'https://github.com/Jamie-Levinson', icon: FaGithub, accent: ACCENT.github },
  { label: 'LinkedIn', href: 'https://linkedin.com/in/jamielevinson1', icon: FaLinkedinIn, accent: ACCENT.linkedin },
  { label: 'X', href: 'https://x.com/jamielevinson', icon: FaXTwitter, accent: undefined }, // X and email have no colour of their own
  { label: 'Email', href: 'mailto:jamie@levinson.ca', icon: FaEnvelope, accent: undefined },
];

interface Entry {
  name: string;
  role: string;
  note: string;
  years: string;
  href: string;
  accent: string;
  logo?: string;
}

const work: Entry[] = [
  {
    name: 'Boardy',
    role: 'Member of Technical Staff',
    note: 'Building the world\u2019s most advanced AI superconnector. Conversational AI and intelligent matching.',
    years: '2025 –',
    href: SITES.boardy,
    accent: ACCENT.boardy,
    logo: '/company_logos/boardy_logo.png',
  },
  {
    name: 'Loop Financial',
    role: 'Full-Stack Software Engineer',
    note: 'Overhauled the credit card program and its authorization engine: thousands of multi-currency transactions a day. Plus 15+ other banking features.',
    years: '2023 – 24',
    href: SITES.loop,
    accent: ACCENT.loop,
    logo: '/company_logos/loop_financial_logo.png',
  },
  {
    name: 'Paramount Commerce',
    role: 'Java Developer, Co-op',
    note: 'APIs supporting real-time, bank-integrated payment rails, used by merchants across North America.',
    years: '2022 – 23',
    href: SITES.paramount,
    accent: ACCENT.paramount,
    logo: '/company_logos/paramount_commerce_logo.jpg',
  },
  {
    name: 'ThoughtWire',
    role: 'Data Engineer, Intern',
    note: 'Large-scale data sets and BI dashboards to simulate a digital-twin platform for hospitals and enterprise environments.',
    years: '2021',
    href: SITES.thoughtwire,
    accent: ACCENT.thoughtwire,
    logo: '/company_logos/thoughtwire_logo.png',
  },
];

const projects: Entry[] = [
  {
    name: 'Stickies++',
    role: 'Kotlin, JavaFX',
    note: 'A desktop notes app with multi-window workspaces.',
    years: '2023',
    href: 'https://github.com/Jamie-Levinson/StickiesPlusPlus',
    accent: ACCENT.kotlin,
  },
  {
    name: 'Straights',
    role: 'C++',
    note: 'A four-player card game.',
    years: '2022',
    href: 'https://github.com/Jamie-Levinson/Straights',
    accent: ACCENT.cpp,
  },
];

/** A name in running text, underlined by hand in its own colour. The line is drawn on load and shakes on hover. */
function Accent({ href, accent, order, children }: { href: string; accent: string; order: number; children: ReactNode }) {
  return (
    <a className={styles.accent} href={href} {...external} style={tint(accent, order)}>
      {children}
      <Underline seed={order * 17 + 3} />
    </a>
  );
}

/** GitHub, LinkedIn, X and email, as icons. Used at the top of the page and again at the bottom. */
function Socials() {
  return links.map(({ label, href, icon: Icon, accent }) => (
    <a key={label} href={href} aria-label={label} title={label} style={tint(accent, 0)} {...(href.startsWith('http') ? external : {})}>
      <Icon aria-hidden />
    </a>
  ));
}

function Rows({ title, entries, from }: { title: string; entries: Entry[]; from: number }) {
  return (
    <section className={styles.section}>
      <h2>{title}</h2>
      <ul className={styles.rows}>
        {entries.map((entry, index) => (
          <li key={entry.name}>
            <a className={styles.row} href={entry.href} {...external} style={tint(entry.accent, from + index)}>
              <span className={styles.name}>
                {/* A logo, or for projects a cell in the language's colour. Grey until the row is hovered. */}
                <span className={styles.chip} aria-hidden>
                  {entry.logo && <Image src={entry.logo} alt="" width={40} height={40} />}
                </span>
                <span className={styles.label}>
                  {entry.name}
                  <Underline seed={(from + index) * 29 + 11} />
                </span>
              </span>
              <span className={styles.what}>
                {entry.role}. <span>{entry.note}</span>
              </span>
              <span className={styles.years}>{entry.years}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** The landing page. `invite` switches on one way of inviting people to the chart's game, for trying it out (see app/lab). */
export default async function Landing({ invite }: { invite?: Invite }) {
  const [{ days, total }, lately] = await Promise.all([getContributions(), getLately()]);
  const here = whereabouts() ?? HOME; // the footer clock shows wherever I am

  // The chart's column count, so the portrait can be sized to span exactly its last seven weeks.
  const leading = new Date(`${days[0][0]}T00:00:00Z`).getUTCDay();
  const columns = Math.ceil((leading + days.length) / 7);

  return (
    <div className={`${sans.variable} ${mono.variable} ${styles.page}`}>
      <SketchFilters />

      <header className={styles.top}>
        <h1>Jamie Levinson</h1>
        <nav className={styles.socials} aria-label="Elsewhere">
          <Socials />
          <ThemeSwitch />
        </nav>
      </header>

      <main>
        <section className={styles.hero}>
          <div className={styles.intro} style={{ '--columns': columns } as CSSProperties}>
            <div>
              <p className={styles.statement}>
                Member of Technical Staff @{' '}
                <Accent href={SITES.boardy} accent={ACCENT.boardy} order={0}>
                  Boardy
                </Accent>
                , building an AI that introduces people who should know each other.
              </p>
              <p className={styles.sub}>
                Previously{' '}
                <Accent href={SITES.loop} accent={ACCENT.loop} order={1}>
                  Loop Financial
                </Accent>
                ,{' '}
                <Accent href={SITES.paramount} accent={ACCENT.paramount} order={2}>
                  Paramount Commerce
                </Accent>{' '}
                and{' '}
                <Accent href={SITES.thoughtwire} accent={ACCENT.thoughtwire} order={3}>
                  ThoughtWire
                </Accent>
                . Computer science at{' '}
                <Accent href={SITES.waterloo} accent={ACCENT.waterloo} order={4}>
                  Waterloo
                </Accent>
                . Based in Toronto.
              </p>
              <Lately initial={lately} from={5} />
            </div>
            <div className={styles.portrait}>
              <Image src="/profile_pic.jpg" alt="Jamie Levinson" fill sizes="(max-width: 760px) 240px, 400px" priority />
            </div>
          </div>
          <div className={styles.chart}>
            <ContributionField days={days} total={total} invite={invite} replay={invite !== undefined} />
          </div>
        </section>

        <Rows title="Work" entries={work} from={0} />
        <Rows title="Projects" entries={projects} from={work.length} />
      </main>

      <footer className={styles.foot}>
        {/* The same links as the header, for whoever reads to the end. */}
        <nav className={styles.socials} aria-label="Contact">
          <Socials />
        </nav>
        <p>
          {here.place} <LocalTime timeZone={here.timeZone} />
        </p>
      </footer>
    </div>
  );
}
