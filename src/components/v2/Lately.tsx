'use client';

/* eslint-disable @next/next/no-img-element -- the album cover comes straight from Spotify, already at the size shown */
import { useEffect, useState, type CSSProperties } from 'react';
import Image from 'next/image';
import styles from './Landing.module.css';
import type { LatelyFact } from '@/lib/lately';
import { Underline } from './sketch';

/**
 * A line of current facts under the intro, each a logo and a few words, underlined by hand in its
 * own colour like the names above it. `from` is where the facts join the page's load sequence.
 *
 * The facts rendered with the page may be as old as the page, so current ones are asked for once
 * it has loaded (see app/api/lately).
 */
export default function Lately({ initial, from }: { initial: LatelyFact[]; from: number }) {
  const [facts, setFacts] = useState(initial);

  useEffect(() => {
    let alive = true;
    fetch('/api/lately')
      .then((response) => (response.ok ? response.json() : null))
      .then((next: unknown) => {
        if (alive && Array.isArray(next) && next.length) setFacts(next as LatelyFact[]);
      })
      .catch(() => {
        // Offline or blocked: keep what the page came with.
      });
    return () => {
      alive = false;
    };
  }, []);

  if (!facts.length) return null;

  return (
    <p className={styles.lately}>
      <span className={styles.latelyTag}>Lately</span>
      <span className={styles.facts}>
        {facts.map((fact, index) => (
          <a
            key={fact.id}
            className={`${styles.accent} ${styles.fact}`}
            href={fact.href}
            target="_blank"
            rel="noopener noreferrer"
            title={fact.line}
            aria-label={fact.line}
            style={{ '--accent': fact.accent, '--order': from + index } as CSSProperties}
          >
            <span className={styles.factChip} aria-hidden>
              {fact.art && (fact.art.startsWith('/') ? <Image src={fact.art} alt="" fill sizes="40px" /> : <img src={fact.art} alt="" />)}
            </span>
            <span className={styles.factWords}>
              {fact.short}
              <Underline seed={(from + index) * 43 + 19} />
            </span>
          </a>
        ))}
      </span>
    </p>
  );
}
