'use client';

import { ThemeToggle } from './ThemeToggle';
import { DragHint } from './DragHint';

export default function Header() {
  const navItems = [
    { name: 'Home', href: '#hero' },
    { name: 'Experience', href: '#experience' },
    { name: 'Projects', href: '#projects' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <>
      <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border/50 supports-[backdrop-filter]:bg-background/60">
        <nav className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <a href="#hero" className="font-bold text-xl text-foreground hover:text-secondary transition-colors tracking-tight">
              JL
            </a>
            
            <div className="flex items-center space-x-6">
              <div className="hidden md:flex space-x-8">
                {navItems.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="text-sm font-medium text-secondary hover:text-foreground transition-all duration-200 hover:scale-105"
                  >
                    {item.name}
                  </a>
                ))}
              </div>
              {/* spacer for draggable theme toggle */}
              <div className="w-12 h-12 pointer-events-none" id="theme-toggle-placeholder" />
            </div>
          </div>
        </nav>
      </header>
      <ThemeToggle />
      <DragHint />
    </>
  );
}
