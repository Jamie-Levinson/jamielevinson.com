'use client';

import { ThemeToggle } from './ThemeToggle';
import { DragHint } from './DragHint';

export default function Header() {
  const navItems = [
    { name: 'Home', href: '#hero' },
    { name: 'Experience', href: '#experience' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-sm border-b border-border">
      <nav className="max-w-6xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          <a href="#hero" className="font-bold text-foreground hover:text-secondary transition-colors">
            JL
          </a>
          
          <div className="flex items-center space-x-6">
            <div className="hidden md:flex space-x-8">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-sm text-secondary hover:text-foreground hover:font-bold hover:scale-105 transition-all duration-200"
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
      <ThemeToggle />
      <DragHint />
    </header>
  );
}
