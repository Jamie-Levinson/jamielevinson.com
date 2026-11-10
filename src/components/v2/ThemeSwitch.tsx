'use client';

import { useTheme } from 'next-themes';
import { FaMoon, FaSun } from 'react-icons/fa6';
import styles from './ThemeSwitch.module.css';

/**
 * Switches between light and dark. Both icons are always rendered and CSS shows the right one
 * from the class on <html>, so the markup is identical on the server and never flickers.
 */
export default function ThemeSwitch() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      type="button"
      className={styles.switch}
      aria-label="Switch between light and dark"
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
    >
      <FaSun className={styles.sun} aria-hidden />
      <FaMoon className={styles.moon} aria-hidden />
    </button>
  );
}
