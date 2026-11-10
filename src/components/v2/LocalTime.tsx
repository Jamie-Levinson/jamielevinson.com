'use client';

import { useEffect, useState } from 'react';

/** The current time in a place (Toronto unless told otherwise). Renders empty on the server so the markup matches on hydration. */
export default function LocalTime({ timeZone = 'America/Toronto' }: { timeZone?: string }) {
  const [time, setTime] = useState('');

  useEffect(() => {
    const clock = new Intl.DateTimeFormat('en-CA', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone });
    const tick = () => setTime(clock.format(new Date()));
    tick();
    const timer = setInterval(tick, 15_000);
    return () => clearInterval(timer);
  }, [timeZone]);

  return <time suppressHydrationWarning>{time}</time>;
}
