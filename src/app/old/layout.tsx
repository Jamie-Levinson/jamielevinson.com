import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Jamie Levinson (previous site)',
  robots: { index: false, follow: false },
};

export default function OldLayout({ children }: { children: React.ReactNode }) {
  return children;
}
