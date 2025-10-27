'use client';

import { ThemeToggle } from './ThemeToggle';

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
                  className="text-sm text-secondary hover:text-foreground transition-colors"
                >
                  {item.name}
                </a>
              ))}
            </div>
            <ThemeToggle />
          </div>
        </div>
      </nav>
    </header>
  );
}
